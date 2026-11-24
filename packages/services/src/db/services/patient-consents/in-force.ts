import { z } from "zod";
import type { ConsentKey } from "../../../shared/consent";
import type { Id } from "../../../types";
import { getDatabase, type DatabaseClient } from "../../client";
import type { PatientConsent } from "../../models/patient-consent";

/**
 * The consent rows and the one question every gated write asks: is this
 * consent in force now? A separate file so the patient and questionnaire
 * services can ask it without importing `./index`, which imports them.
 */

/** On the pooled client by default, or on a transaction the caller opened. */
export const consentRows = (db: DatabaseClient = getDatabase()) =>
  db.collection<PatientConsent>("patient_consents");

/** Above any history a patient can build: one row per decision, three keys. */
const HISTORY_LIMIT = 500;

/** Latest first. A tie on `decidedAt` falls to `createdAt`. */
const newestFirst = (a: PatientConsent, b: PatientConsent) =>
  b.decidedAt.getTime() - a.decidedAt.getTime() ||
  b.createdAt.getTime() - a.createdAt.getTime();

export const historyOf = async (
  patientId: Id,
  db?: DatabaseClient,
): Promise<PatientConsent[]> => {
  if (!z.uuid().safeParse(patientId).success) {
    return [];
  }
  const page = await consentRows(db).findMany(
    { patientProfileId: patientId },
    { limit: HISTORY_LIMIT },
  );
  return [...page.items].sort(newestFirst);
};

/**
 * True when the latest decision of the key is `given`. No row, `refused` and
 * `withdrawn` all answer false. A `legacy` row counts: it is a care consent
 * Morgane recorded by hand before the table.
 */
export const consentInForce = async (
  patientId: Id,
  key: ConsentKey,
  db?: DatabaseClient,
): Promise<boolean> => {
  const latest = (await historyOf(patientId, db)).find(
    (row) => row.consentKey === key,
  );
  return latest?.decision === "given";
};
