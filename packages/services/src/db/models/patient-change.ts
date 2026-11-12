import type {
  PatientChangeValue,
  WatchedPatientField,
} from "../../shared/patient-changes";
import type { Entity, Id } from "../../types";

/**
 * One change a patient made to a watched field after activation — story 21.
 * Open while `acknowledgedAt` is null. The file's markers, the patient list's
 * indicator and the « à revalider » flag read the open ones.
 */
export type PatientChange = Entity & {
  patientId: Id;
  fieldKey: WatchedPatientField;
  /** The value before the patient's first change since the last acknowledgement. */
  oldValue: PatientChangeValue;
  /** The value after the patient's latest change. */
  newValue: PatientChangeValue;
  /** When the patient last changed the field. */
  changedAt: Date;
  acknowledgedAt: Date | null;
  /** The operator who acknowledged. No foreign key, like `audit_events`. */
  acknowledgedBy: Id | null;
};
