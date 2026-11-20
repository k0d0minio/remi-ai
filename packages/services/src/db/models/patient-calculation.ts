import type { CalculationKind } from "../../shared/calculations";
import type { Entity, Id } from "../../types";

/** The inputs and the rule a value came from, kept with the value (D-32). */
export type CalculationParameters = Readonly<Record<string, unknown>>;

/**
 * One automatic calculation of a patient — stories 7, 8 and 9. One row per
 * patient and kind. The estimate REMI computes and the value the practitioner
 * validates live in separate columns: writing one never changes the other
 * (D-30). Every null is « non calculé » or « non validé ».
 */
export type PatientCalculation = Entity & {
  patientId: Id;
  kind: CalculationKind;
  estimatedValue: number | null;
  estimateParameters: CalculationParameters | null;
  estimatedAt: Date | null;
  validatedValue: number | null;
  validationParameters: CalculationParameters | null;
  validatedAt: Date | null;
  /** The operator who validated. No foreign key, like `audit_events`. */
  validatedBy: Id | null;
  /** The inputs changed after the validation. The epics that validate set it. */
  needsRevalidation: boolean;
};

/**
 * The estimates that REMI computes from the file as it is now, for the kinds
 * whose estimate is written only at a save (REM-52). Nothing stores them: a
 * screen shows one where the row has no estimate yet. Null: a datum is
 * missing or out of range, so there is no number (D-30).
 */
export type ComputedEstimates = Record<
  "protein" | "energy",
  { value: number; parameters: CalculationParameters } | null
>;
