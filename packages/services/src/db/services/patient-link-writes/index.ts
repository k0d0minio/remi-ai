import { err, ok, type Result } from "../../../shared/result";
import type { Id } from "../../../types";
import { getDatabase } from "../../client";
import type { AuditAction } from "../../models/audit-event";
import type { PatientLinkWrite } from "../../models/patient-link-write";
import type { PatientProfile } from "../../models/patient-profile";
import { recordAuditEvent } from "../audit";
import {
  getPatientByShareToken,
  recordPatientLinkWrote,
  restorePatientLastEdited,
} from "../patients";

/**
 * The one way anything writes through a patient link.
 *
 * `/p/[token]` is the only unauthenticated route in the monorepo that touches
 * the database, and decision #2 (2026-09-10) makes the token in its URL a
 * write credential as well as a read one — patient accounts are parked in
 * `beyond-december`, so there is no session to check and nothing else to
 * trust. Every rule that follows from that lives here rather than in each
 * caller, because five callers enforcing it five ways is five chances to miss
 * one: the token is resolved exactly as the loader resolves it, the ceilings
 * are checked before any row is created, the write is attributed to the
 * patient, and the trail records that a patient — not Morgane — did it.
 *
 * The rules live in this package rather than in the app's server action so
 * they can be tested against the in-memory client. `apps/web` holds the thin
 * wrapper that supplies the token from the route and revalidates the segment.
 */

/** Free prose — a meal description, a check-in note. */
export const PATIENT_LINK_BODY_MAX = 2000;
/** A word or a key — a slot, a one-word answer to a check-in. */
export const PATIENT_LINK_SHORT_MAX = 200;

/**
 * The ceilings, per token, both rolling.
 *
 * An active day is around fifteen writes: three meals entered twice (« je vais
 * manger », then « j'ai mangé »), a check-in, some recipe feedback. A hundred
 * a day leaves six times that for a patient who edits and retries, and makes a
 * leaked link tedious rather than useful — anything written through it is
 * attributed to the patient and visible to Morgane, so the trail is the real
 * defence and the ceiling only has to stop a script. Ten a minute is the burst
 * guard; nobody types that fast, and it costs nothing to a human.
 */
export const PATIENT_LINK_WRITES_PER_MINUTE = 10;
export const PATIENT_LINK_WRITES_PER_DAY = 100;

const MINUTE_MS = 60 * 1000;
const DAY_MS = 24 * 60 * MINUTE_MS;

/**
 * How many ledger rows one count reads. Pruning keeps a patient's ledger at
 * roughly the day ceiling, so this is comfortably above it and the read never
 * has to page.
 */
const LEDGER_READ_LIMIT = 500;

const ledger = () =>
  getDatabase().collection<PatientLinkWrite>("patient_link_writes");

/**
 * The text a write carries, declared by length class so the caller never has
 * to remember which cap applies to which field.
 */
export type PatientLinkWriteText = {
  bodies?: readonly string[];
  shorts?: readonly string[];
};

export type PatientLinkWriteRequest<T> = {
  /** Straight from the route. Never a patient id — see the note below. */
  token: string;
  action: AuditAction;
  text?: PatientLinkWriteText;
  target?: {
    type?: string;
    id?: string | null;
    /** How the target read at the time — a pseudonym, a title. */
    label?: string;
    detail?: string;
  };
  /**
   * The actual write, run only once the token resolved and the ceilings
   * allowed it. It receives the resolved patient, which is the only way a
   * caller learns a patient id: taking one as an argument would let any caller
   * write to any patient by naming them, and the token would stop being the
   * credential.
   */
  write: (patient: PatientProfile) => Promise<Result<T>>;
};

const tooLong = (values: readonly string[] | undefined, max: number): boolean =>
  (values ?? []).some((value) => value.length > max);

/**
 * Prunes what has fallen out of the longest window and counts what has not.
 *
 * Rows are read newest first (the seam orders by `createdAt`), so the count
 * walks forward and the tail is what gets deleted. Pruning on every write is
 * what keeps the ledger at roughly one day per patient rather than growing
 * forever — there is no cron in this product, so a table nobody prunes is a
 * table that never stops.
 */
const countRecentWrites = async (
  patientId: Id,
  now: number,
): Promise<{ inMinute: number; inDay: number }> => {
  const page = await ledger().findMany(
    { patientId },
    { limit: LEDGER_READ_LIMIT },
  );

  let inMinute = 0;
  let inDay = 0;
  const stale: Id[] = [];
  for (const row of page.items) {
    const age = now - row.createdAt.getTime();
    if (age >= DAY_MS) {
      stale.push(row.id);
      continue;
    }
    inDay += 1;
    if (age < MINUTE_MS) {
      inMinute += 1;
    }
  }

  await Promise.all(stale.map((id) => ledger().remove(id)));
  return { inMinute, inDay };
};

/**
 * Resolve, check, write, attribute, record — in that order, and the order is
 * the point.
 *
 * Length is checked first because it is pure: an oversized body is refused
 * without the database being touched at all. The token comes next, so an
 * unknown or regenerated one is "no such patient link" whatever it carried.
 * Only then is the ledger consulted, and a row is written to it BEFORE the
 * caller's write runs: an attempt that reaches the seam has cost work whether
 * or not the payload turns out to be valid, and a limit that only counted
 * successes would let a valid token retry rejected writes forever.
 */
export const writeThroughPatientLink = async <T>(
  request: PatientLinkWriteRequest<T>,
): Promise<Result<T>> => {
  const { text } = request;
  if (tooLong(text?.bodies, PATIENT_LINK_BODY_MAX)) {
    return err(
      "invalid_input",
      `that text is too long — ${PATIENT_LINK_BODY_MAX} characters at most`,
    );
  }
  if (tooLong(text?.shorts, PATIENT_LINK_SHORT_MAX)) {
    return err(
      "invalid_input",
      `that value is too long — ${PATIENT_LINK_SHORT_MAX} characters at most`,
    );
  }

  const resolved = await getPatientByShareToken(request.token);
  if (!resolved.ok) {
    return resolved;
  }
  const patient = resolved.data;

  const now = Date.now();
  const recent = await countRecentWrites(patient.id, now);
  if (recent.inMinute >= PATIENT_LINK_WRITES_PER_MINUTE) {
    return err("rate_limited", "too many changes at once — try again shortly");
  }
  if (recent.inDay >= PATIENT_LINK_WRITES_PER_DAY) {
    return err("rate_limited", "too many changes today — try again tomorrow");
  }
  await ledger().insert({ patientId: patient.id });

  const result = await request.write(patient);
  if (!result.ok) {
    return result;
  }

  // The write may have gone through a console service, which bumps the roster
  // timestamp because an operator writing there IS working on the patient. A
  // patient writing into their own link is not, so it goes back.
  await restorePatientLastEdited(patient.id, patient.lastEditedAt);

  // Both of these record the write rather than being part of it, so neither
  // may fail it: the audit service swallows its own errors by design, and the
  // stamp is one column on a row that has already been read.
  await recordAuditEvent({
    actor: { kind: "patient", id: patient.id, name: patient.pseudonym },
    action: request.action,
    targetType: request.target?.type,
    targetId: request.target?.id,
    targetLabel: request.target?.label ?? patient.pseudonym,
    detail: request.target?.detail,
  });
  await recordPatientLinkWrote(patient.id);

  return ok(result.data);
};
