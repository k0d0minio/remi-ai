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
import { getDatabase, type DatabaseClient } from "../../client";
import type { PatientConsent } from "../../models/patient-consent";
import type { PatientQuestionnaire } from "../../models/patient-questionnaire";
import { recordAuditEvent, type AuditActor, type AuditRecord } from "../audit";
import { getPatient } from "../patients";
import { consentRows, historyOf } from "./in-force";
import type { Actor } from "../../models/actor";
import { byPatient, mayAccessPatient, systemActor } from "../access";

/**
 * The patient's consent decisions — story 3, D-32. The table is append-only:
 * this service inserts rows and never updates or deletes one. A patient's
 * answer for a key is the latest row of that key.
 *
 * The hash on the row comes from the text file, never from the caller. The
 * caller names the version and the locale it showed, and the service refuses a
 * pair that no file carries.
 */

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

type GenotypeField = "apoe" | "dio2" | "amy1a";

type GenotypeRow = { id: Id } & Pick<PatientQuestionnaire, GenotypeField>;

const genotypeRows = (db: DatabaseClient) =>
  db.collection<GenotypeRow>("patient_profiles");

/**
 * The genotype lives only under a `given` genetic consent (story 3, D-30). Any
 * other decision empties the three fields in the caller's transaction. Returns
 * whether a value was there to clear.
 */
const clearGenotype = async (
  patientId: Id,
  db: DatabaseClient,
): Promise<boolean> => {
  const row = await genotypeRows(db).findById(patientId);
  const held = [row?.apoe, row?.dio2, row?.amy1a].some(
    (value) => value !== null && value !== undefined,
  );
  if (held) {
    await genotypeRows(db).update(patientId, {
      apoe: null,
      dio2: null,
      amy1a: null,
    });
  }
  return held;
};

/** The latest decision per key. A key with no row is absent. */
const unscopedConsentsOf = async (
  patientId: Id,
): Promise<Partial<Record<ConsentKey, PatientConsent>>> => {
  const latest: Partial<Record<ConsentKey, PatientConsent>> = {};
  for (const row of await historyOf(patientId)) {
    latest[row.consentKey] ??= row;
  }
  return latest;
};

/**
 * A consent row, and the audit events that record it: the decision first, then
 * `genotype.cleared` when a genetic decision emptied the genotype.
 */
export type ConsentWrite = {
  row: PatientConsent;
  audits: readonly AuditRecord[];
};

/**
 * Writes one decision on `db` and writes no audit event. The caller writes
 * `audits` after its transaction commits: an event written inside a transaction
 * that rolls back would name a consent that no row holds.
 *
 * The sign-up uses it: the patient file, the account and the consent rows
 * commit together, or none of them does.
 */
export const insertConsent = async (
  input: ConsentInput,
  db: DatabaseClient,
): Promise<Result<ConsentWrite>> => {
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
  const actor = input.actor;
  // The genetic consent is the patient's own act, in the app. An operator
  // cannot record it for them, not even from paper (Jamie, 2026-11-03).
  if (key === "genetic" && !("kind" in actor)) {
    return err("not_permitted", "only the patient records the genetic consent");
  }
  const patient = await getPatient(systemActor, patientId, db);
  if (!patient.ok) {
    return err("not_found", "no such patient");
  }

  const current = (await historyOf(patientId, db)).find(
    (row) => row.consentKey === key,
  );
  // A withdrawal takes back a consent in force. With none, the row would claim
  // a consent that was never given.
  if (decision === "withdrawn" && current?.decision !== "given") {
    return err("conflict", "no consent in force to withdraw");
  }

  const row = await consentRows(db).insert({
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
  const target = {
    targetType: "patient",
    targetId: patientId,
    targetLabel: patient.data.pseudonym,
  };
  const audits: AuditRecord[] = [
    {
      actor,
      action: `consent.${decision}` as const,
      ...target,
      detail: `${key} v${text.version} ${text.locale}`,
    },
  ];
  if (
    key === "genetic" &&
    decision !== "given" &&
    (await clearGenotype(patientId, db))
  ) {
    audits.push({
      actor,
      action: "genotype.cleared",
      ...target,
      detail: `consent ${decision}`,
    });
  }
  return ok({ row, audits });
};

/**
 * Writes one decision and its audit events (D-32). The row and the genotype's
 * clearing commit together. The events follow the commit.
 */
export const recordConsent = async (
  actor: Actor,
  input: ConsentInput,
): Promise<Result<PatientConsent>> => {
  if (!(await mayAccessPatient(actor, input.patientId, "write"))) {
    return noSuchPatient();
  }
  const written = await getDatabase().transaction((tx) =>
    insertConsent(input, tx),
  );
  if (!written.ok) {
    return written;
  }
  for (const audit of written.data.audits) {
    await recordAuditEvent(audit);
  }
  return ok(written.data.row);
};

/**
 * The scoped surface (story 3, D-27). Each service takes the actor first, and
 * `db/services/access` checks it before the body runs. A refused call answers
 * as a missing file.
 */
export const consentsOf = byPatient("read", unscopedConsentsOf, () => ({}));
