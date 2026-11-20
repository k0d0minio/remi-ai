import { z } from "zod";
import { err, ok, type Result } from "../../../shared/result";
import type { Id } from "../../../types";
import { getDatabase } from "../../client";
import type { Operator } from "../../models/operator";
import type { PatientProfile } from "../../models/patient-profile";
import type { PatientQuestionnaire } from "../../models/patient-questionnaire";
import { byPatient, noSuchPatient } from "../access";

/**
 * What the waiting screen shows before the activation (story 22, REM-81): who
 * prepares the care, and the appointment when the patient gave its date. It
 * holds no recommendation, no recipe and no status.
 */
export type PatientWaitingView = {
  /** The practitioner who holds the file. `null`: no name to show. */
  practitionerName: string | null;
  /** `YYYY-MM-DD`, from the questionnaire. `null`: no date is set. */
  appointmentDate: string | null;
};

type WaitingRow = PatientProfile & Partial<PatientQuestionnaire>;

const isValidId = (id: Id) => z.uuid().safeParse(id).success;

const unscopedGetPatientWaitingView = async (
  patientId: Id,
): Promise<Result<PatientWaitingView>> => {
  if (!isValidId(patientId)) {
    return err("not_found", "no such patient");
  }
  const db = getDatabase();
  const row = await db
    .collection<WaitingRow>("patient_profiles")
    .findById(patientId);
  if (!row) {
    return err("not_found", "no such patient");
  }
  // Only the name leaves the operator's row: no e-mail, no hash, no link.
  const practitioner = isValidId(row.practitionerId)
    ? await db.collection<Operator>("operators").findById(row.practitionerId)
    : null;
  return ok({
    practitionerName: practitioner?.name.trim() || null,
    appointmentDate: row.consultationDate ?? null,
  });
};

/**
 * The scoped surface (D-26, D-27). The actor comes first. A patient reads only
 * their own file: a refused call answers as a missing file.
 */
export const getPatientWaitingView = byPatient(
  "read",
  unscopedGetPatientWaitingView,
  noSuchPatient,
);
