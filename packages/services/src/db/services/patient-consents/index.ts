import { z } from "zod";
import { consentText } from "../../../consent";
import {
  consentDecisions,
  consentKeys,
  consentTextLocales,
  type ConsentKey,
} from "../../../shared/consent";
import { err, ok, type Result } from "../../../shared/result";
import type { Id } from "../../../types";
import { getDatabase } from "../../client";
import type { PatientConsent } from "../../models/patient-consent";
import { recordAuditEvent, type AuditActor } from "../audit";
import { getPatient } from "../patients";

/**
 * The patient's consent decisions — story 3, D-32. The table is append-only:
 * this service inserts rows and never updates or deletes one. A patient's
 * answer for a key is the latest row of that key.
 *
 * The hash on the row comes from the text file, never from the caller. The
 * caller names the version and the locale it showed, and the service refuses a
 * pair that no file carries.
 */

const consents = () =>
  getDatabase().collection<PatientConsent>("patient_consents");

/** Above any history a patient can build: one row per decision, two keys. */
const HISTORY_LIMIT = 500;

const consentInput = z.object({
  patientId: z.uuid(),
  key: z.enum(consentKeys),
  version: z.string().trim().min(1),
  locale: z.enum(consentTextLocales),
  decision: z.enum(consentDecisions),
});

export type ConsentInput = z.input<typeof consentInput> & {
  actor: AuditActor;
};

/** Latest first. A tie on `decidedAt` falls to `createdAt`. */
const newestFirst = (a: PatientConsent, b: PatientConsent) =>
  b.decidedAt.getTime() - a.decidedAt.getTime() ||
  b.createdAt.getTime() - a.createdAt.getTime();

const historyOf = async (patientId: Id): Promise<PatientConsent[]> => {
  const page = await consents().findMany(
    { patientProfileId: patientId },
    { limit: HISTORY_LIMIT },
  );
  return [...page.items].sort(newestFirst);
};

/** The latest decision per key. A key with no row is absent. */
export const consentsOf = async (
  patientId: Id,
): Promise<Partial<Record<ConsentKey, PatientConsent>>> => {
  const latest: Partial<Record<ConsentKey, PatientConsent>> = {};
  if (!z.uuid().safeParse(patientId).success) {
    return latest;
  }
  for (const row of await historyOf(patientId)) {
    latest[row.consentKey] ??= row;
  }
  return latest;
};

export const recordConsent = async (
  input: ConsentInput,
): Promise<Result<PatientConsent>> => {
  const parsed = consentInput.safeParse(input);
  if (!parsed.success) {
    return err(
      "invalid_input",
      "a consent needs a patient, a key, a version, a locale and a decision",
    );
  }
  const { patientId, key, version, locale, decision } = parsed.data;
  const text = consentText(key, version, locale);
  if (!text) {
    const name = `${key} v${version} ${locale}`;
    return err("invalid_input", `no consent text ${name}`);
  }
  const patient = await getPatient(patientId);
  if (!patient.ok) {
    return err("not_found", "no such patient");
  }

  const current = (await historyOf(patientId)).find(
    (row) => row.consentKey === key,
  );
  // A withdrawal takes back a consent in force. With none, the row would claim
  // a consent that was never given.
  if (decision === "withdrawn" && current?.decision !== "given") {
    return err("conflict", "no consent in force to withdraw");
  }

  const actor = input.actor;
  const created = await consents().insert({
    patientProfileId: patientId,
    consentKey: key,
    textVersion: text.version,
    textLocale: text.locale,
    textHash: text.hash,
    decision,
    channel: "app",
    decidedAt: new Date(),
    actorKind: "kind" in actor ? actor.kind : "operator",
  });
  await recordAuditEvent({
    actor,
    action: `consent.${decision}` as const,
    targetType: "patient",
    targetId: patientId,
    targetLabel: patient.data.pseudonym,
    detail: `${key} v${text.version} ${text.locale}`,
  });
  return ok(created);
};
