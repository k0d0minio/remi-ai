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
 * one: the token is resolved exactly as the loader resolves it, a row the
 * token does not own is refused, the ceilings are checked before any row is
 * created, the write is attributed to the patient, and the trail records that
 * a patient — not Morgane — did it.
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
 * The text a write carries, declared by length class so the caller never has to
 * remember which cap applies to which field.
 *
 * Required, and `{}` is a legitimate value for a write that carries no text at
 * all. It is required because a generic helper cannot read an opaque
 * callback's payload: the cap applies to what the caller declares, so leaving
 * the field optional would make "I forgot" and "there is none" the same
 * gesture. Declaring is the caller's one obligation here.
 */
export type PatientLinkWriteText = {
  bodies?: readonly string[];
  shorts?: readonly string[];
};

/**
 * What the write is about.
 *
 * A union, and that is the whole guard: naming an existing row makes `ownerOf`
 * mandatory, so a caller cannot target a row without saying how to find out
 * whose it is. The type is the enforcement — a rule this helper merely
 * documented would be a rule five callers can each forget once.
 *
 * It matters because the patient is bound to the token, but most writes in this
 * model are keyed by a CHILD row: a goal id, a meal id. Those ids are plain
 * uuids that travel — a screenshot, a support export, a pasted link — and the
 * services that own them answer "does this row exist", not "is it yours". A
 * patient posting their own form with someone else's goal id would otherwise
 * write health data into another person's record, under `writtenBy: patient`,
 * and the trail would read as if they had written it about themselves.
 */
export type PatientLinkWriteTarget =
  | {
      type?: string;
      id?: null;
      /** How the target read at the time — a pseudonym, a title. */
      label?: string;
      detail?: string;
    }
  | {
      type?: string;
      /** An existing row this write touches. Checked against the token's patient. */
      id: string;
      label?: string;
      detail?: string;
      /** Whose row is it? `null` when the row does not exist. */
      ownerOf: (id: string) => Promise<Id | null>;
    };

export type PatientLinkWriteRequest<T> = {
  /** Straight from the route. Never a patient id — see the note below. */
  token: string;
  action: AuditAction;
  /** What the caller is about to write, by length class. `{}` when none. */
  text: PatientLinkWriteText;
  target?: PatientLinkWriteTarget;
  /**
   * The actual write, run only once the token resolved and the ceilings
   * allowed it. It receives the resolved patient, which is the only way a
   * caller learns a patient id: taking one as an argument would let any caller
   * write to any patient by naming them, and the token would stop being the
   * credential.
   */
  write: (patient: PatientProfile) => Promise<Result<T>>;
};

const tooLong = (values: readonly string[], max: number): boolean =>
  values.some((value) => value.length > max);

type Claim = { granted: true } | { granted: false; window: "minute" | "day" };

/**
 * Takes a slot under both ceilings, or refuses — without a transaction, and
 * correctly under concurrency.
 *
 * The obvious shape is count-then-insert, and it is wrong here: the HTTP driver
 * this package registers has no interactive transactions (`adapters/neon.ts`
 * says so, and its `transaction()` is a passthrough), so two requests carrying
 * the same token read the same pre-write count and both pass. A ceiling that
 * only holds against a serial script is not a ceiling — the script that would
 * abuse a leaked link is the one that fans out.
 *
 * So the row goes in FIRST, and the count that follows includes it and every
 * row a racing request has already inserted. Over the ceiling, the claim hands
 * its slot back and refuses. Serially this is exact: the tenth write of a
 * minute counts ten and passes, the eleventh counts eleven and does not. Under
 * a genuine simultaneous burst it errs toward refusing — several claims can see
 * the same over-limit total and all stand down — which is the safe direction,
 * costs a human nothing (nobody fires ten parallel writes by hand) and costs a
 * script exactly what it should.
 *
 * Note what it deliberately does NOT do: rank rows against each other. Ordering
 * by timestamp needs a tie-break once two rows share an instant, and any
 * tie-break that is not insertion order (a uuid, say) makes the last write of a
 * serial run rank mid-pack and slip through. Counting has no such edge.
 *
 * The same pass prunes what has fallen out of the longest window — there is no
 * cron in this product, so a table nobody prunes is a table that never stops.
 * Pruning holds the ledger at roughly the day ceiling per patient, which is why
 * `LEDGER_READ_LIMIT` is comfortably above it and the read never has to page.
 */
const claimWriteSlot = async (patientId: Id): Promise<Claim> => {
  const mine = await ledger().insert({ patientId });
  const reference = mine.createdAt.getTime();
  const page = await ledger().findMany(
    { patientId },
    { limit: LEDGER_READ_LIMIT },
  );

  let inMinute = 0;
  let inDay = 0;
  const stale: Id[] = [];
  for (const row of page.items) {
    const age = reference - row.createdAt.getTime();
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

  const window =
    inMinute > PATIENT_LINK_WRITES_PER_MINUTE
      ? "minute"
      : inDay > PATIENT_LINK_WRITES_PER_DAY
        ? "day"
        : null;
  if (window) {
    // Hand the slot back, so a refusal does not spend a place in the window.
    await ledger().remove(mine.id);
    return { granted: false, window };
  }
  return { granted: true };
};

/**
 * Resolve, claim, write, attribute, record — in that order, and the order is
 * the point.
 *
 * Length is checked first because it is pure: an oversized body is refused
 * without the database being touched at all. The token comes next, so an
 * unknown or regenerated one is "no such patient link" whatever it carried.
 * Only then is a slot claimed, and it is claimed BEFORE the caller's write
 * runs: an attempt that reaches the seam has cost work whether or not the
 * payload turns out to be valid, and a limit that only counted successes would
 * let a valid token retry rejected writes forever.
 */
export const writeThroughPatientLink = async <T>(
  request: PatientLinkWriteRequest<T>,
): Promise<Result<T>> => {
  const { text } = request;
  if (tooLong(text.bodies ?? [], PATIENT_LINK_BODY_MAX)) {
    return err(
      "invalid_input",
      `that text is too long — ${PATIENT_LINK_BODY_MAX} characters at most`,
    );
  }
  if (tooLong(text.shorts ?? [], PATIENT_LINK_SHORT_MAX)) {
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

  const claim = await claimWriteSlot(patient.id);
  if (!claim.granted) {
    return err(
      "rate_limited",
      claim.window === "minute"
        ? "too many changes at once — try again shortly"
        : "too many changes today — try again tomorrow",
    );
  }

  // A row this token does not own is refused in the same words as a token that
  // never existed: the caller learns nothing about whose it was, or whether it
  // was anyone's. It costs the attempt its slot, which is right — guessing at
  // other people's ids is exactly what the ceiling is for.
  const { target } = request;
  if (target?.id) {
    const owner = await target.ownerOf(target.id);
    if (owner !== patient.id) {
      return err("not_found", "no such patient link");
    }
  }

  const result = await request.write(patient);
  if (!result.ok) {
    return result;
  }

  // Everything below records the write rather than being part of it, so none of
  // it may fail the write: the row is already committed, and a throw here would
  // show the patient an error for a meal that saved — and have them enter it
  // twice. The audit service already swallows its own failures; these two
  // reach the database on their own account, so they are caught here.
  try {
    // The write may have gone through a console service, which bumps the roster
    // timestamp because an operator writing there IS working on the patient. A
    // patient writing into their own link is not, so it goes back.
    await restorePatientLastEdited(patient.id, patient.lastEditedAt);
    await recordAuditEvent({
      actor: { kind: "patient", id: patient.id, name: patient.pseudonym },
      action: request.action,
      targetType: request.target?.type,
      targetId: request.target?.id,
      targetLabel:
        request.target?.label ?? (target?.id ? "" : patient.pseudonym),
      detail: request.target?.detail,
    });
    await recordPatientLinkWrote(patient.id);
  } catch (cause) {
    console.error("[patient-link] a write was saved but not fully recorded", {
      action: request.action,
      cause,
    });
  }

  return ok(result.data);
};
