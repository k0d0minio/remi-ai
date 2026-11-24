import { z } from "zod";
import { consentText } from "../../../consent";
import {
  consentDecisions,
  consentKeys,
  consentTextLocales,
  isTermsConsentKey,
  type ConsentKey,
} from "../../../shared/consent";
import { err, ok, type Result } from "../../../shared/result";
import type { Id } from "../../../types";
import { getDatabase, type DatabaseClient } from "../../client";
import type { PatientConsent } from "../../models/patient-consent";
import type { PatientQuestionnaire } from "../../models/patient-questionnaire";
import { recordAuditEvent, type AuditActor, type AuditRecord } from "../audit";
import { getPatient } from "../patients";
import { consentInForce, consentRows, historyOf } from "./in-force";
import type { Actor } from "../../models/actor";
import {
  byPatient,
  mayAccessPatient,
  noSuchPatient,
  systemActor,
} from "../access";

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
  // An accepted text of terms is never refused or withdrawn in the app
  // (REM-207, Jamie, 2026-11-24).
  if (isTermsConsentKey(key) && decision !== "given") {
    return err("not_permitted", `the ${key} terms are only accepted`);
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

const withdrawalInput = z.object({
  patientId: z.uuid(),
  key: z.enum(consentKeys),
});

export type WithdrawalInput = z.input<typeof withdrawalInput> & {
  actor: AuditActor;
};

/**
 * Writes the withdrawal of the consent in force on `db`, and writes no audit
 * event: the caller writes `audits` after its transaction commits.
 *
 * The row names the text that the patient accepted: the version, the language
 * and the hash come from the row in force, never from the caller. Thus a
 * `legacy` consent, which has no text file, can be withdrawn too. No earlier
 * row changes.
 */
const insertWithdrawal = async (
  input: WithdrawalInput,
  db: DatabaseClient,
): Promise<Result<ConsentWrite>> => {
  const parsed = withdrawalInput.safeParse(input);
  if (!parsed.success) {
    return err(
      "invalid_input",
      "a withdrawal needs a patient and a consent key",
    );
  }
  const { patientId, key } = parsed.data;
  if (isTermsConsentKey(key)) {
    return err("not_permitted", `the ${key} terms are not withdrawn`);
  }
  const actor = input.actor;
  // A withdrawal is the patient's own act (REM-43). An operator and a job
  // cannot take a consent back for them.
  if (!("kind" in actor) || actor.kind !== "patient") {
    return err("not_permitted", "only the patient withdraws a consent");
  }
  const patient = await getPatient(systemActor, patientId, db);
  if (!patient.ok) {
    return err("not_found", "no such patient");
  }
  const current = (await historyOf(patientId, db)).find(
    (row) => row.consentKey === key,
  );
  if (current?.decision !== "given") {
    return err("conflict", "no consent in force to withdraw");
  }

  const row = await consentRows(db).insert({
    patientProfileId: patientId,
    consentKey: key,
    textVersion: current.textVersion,
    textLocale: current.textLocale,
    textHash: current.textHash,
    decision: "withdrawn",
    channel: "app",
    decidedAt: new Date(),
    actorKind: actor.kind,
  });
  const target = {
    targetType: "patient",
    targetId: patientId,
    targetLabel: patient.data.pseudonym,
  };
  const text = [key, `v${current.textVersion}`, current.textLocale]
    .filter((part) => part !== null)
    .join(" ");
  const audits: AuditRecord[] = [
    { actor, action: "consent.withdrawn", ...target, detail: text },
  ];
  if (key === "genetic" && (await clearGenotype(patientId, db))) {
    audits.push({
      actor,
      action: "genotype.cleared",
      ...target,
      detail: "consent withdrawn",
    });
  }
  return ok({ row, audits });
};

/**
 * The patient withdraws a consent from the settings (REM-43). One row
 * `withdrawn`, and for `genetic` the three genotype fields emptied, commit
 * together. The audit events follow the commit (D-32).
 *
 * The consequence is immediate because each dependent read asks the table at
 * the time of the read: `consentInForce` for the genotype and the optional
 * data, `careConsentInForce` for the generation of a suggestion.
 */
export const withdrawConsent = async (
  actor: Actor,
  input: WithdrawalInput,
): Promise<Result<PatientConsent>> => {
  if (!(await mayAccessPatient(actor, input.patientId, "write"))) {
    return noSuchPatient();
  }
  const written = await getDatabase().transaction((tx) =>
    insertWithdrawal(input, tx),
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

/**
 * True when the care consent is in force now (REM-43). Each generation and
 * each suggestion for a patient asks it before any other read. A refused
 * actor reads `false`: no consent that it can see.
 */
export const careConsentInForce = byPatient(
  "read",
  (patientId: Id) => consentInForce(patientId, "care"),
  () => false,
);
