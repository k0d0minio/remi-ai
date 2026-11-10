import { z } from "zod";
import {
  calculationKinds,
  type CalculationKind,
} from "../../../shared/calculations";
import { err, ok, type Result } from "../../../shared/result";
import type { Id } from "../../../types";
import { getDatabase, type DatabaseClient } from "../../client";
import type {
  CalculationParameters,
  PatientCalculation,
} from "../../models/patient-calculation";
import { recordAuditEvent, type OperatorActor } from "../audit";
import { byPatient, noSuchPatient } from "../access";

/**
 * The automatic calculations of a patient — stories 7, 8 and 9. One row per
 * patient and kind. Two writes, each on its own columns (D-30):
 *
 * - The estimate, written by REMI when an input changes. A null estimate
 *   clears it: a missing datum leaves no stale value behind.
 * - The validated value, written by the practitioner, with an audit event
 *   that names the value and the parameters (D-32).
 *
 * Neither write touches the other's columns. Nothing here computes: the
 * functions live in `shared/calculations.ts`.
 */

const calculations = (db: DatabaseClient = getDatabase()) =>
  db.collection<PatientCalculation>("patient_calculations");

const uuidSchema = z.uuid();

const kindSchema = z.enum(calculationKinds);

const valueSchema = z.object({
  value: z.number().finite().nonnegative(),
  parameters: z.record(z.string(), z.unknown()),
});

/** A value and the inputs it came from. */
export type CalculationValue = {
  value: number;
  parameters: CalculationParameters;
};

const rowFor = async (
  patientId: Id,
  kind: CalculationKind,
  db?: DatabaseClient,
): Promise<PatientCalculation | null> => {
  const page = await calculations(db).findMany(
    { patientId, kind },
    { limit: 1 },
  );
  return page.items[0] ?? null;
};

/** The row of the kind, inserted empty when the patient has none yet. */
const ensureRow = async (
  patientId: Id,
  kind: CalculationKind,
  db?: DatabaseClient,
): Promise<PatientCalculation> =>
  (await rowFor(patientId, kind, db)) ??
  calculations(db).insert({
    patientId,
    kind,
    estimatedValue: null,
    estimateParameters: null,
    estimatedAt: null,
    validatedValue: null,
    validationParameters: null,
    validatedAt: null,
    validatedBy: null,
    needsRevalidation: false,
  });

/** Every calculation row of the patient, in the order of `calculationKinds`. */
const unscopedListPatientCalculations = async (
  patientId: Id,
  db?: DatabaseClient,
): Promise<PatientCalculation[]> => {
  if (!uuidSchema.safeParse(patientId).success) {
    return [];
  }
  const page = await calculations(db).findMany({ patientId });
  return [...page.items].sort(
    (a, b) =>
      calculationKinds.indexOf(a.kind) - calculationKinds.indexOf(b.kind),
  );
};

/**
 * Write REMI's estimate of one kind, or clear it with `null`. The validated
 * columns stay as they are.
 */
const unscopedSetCalculationEstimate = async (
  patientId: Id,
  kind: CalculationKind,
  estimate: CalculationValue | null,
  db?: DatabaseClient,
): Promise<Result<PatientCalculation>> => {
  if (!uuidSchema.safeParse(patientId).success) {
    return noSuchPatient();
  }
  const parsedKind = kindSchema.safeParse(kind);
  if (!parsedKind.success) {
    return err("invalid_input", "that calculation does not exist");
  }
  const parsed = estimate === null ? null : valueSchema.safeParse(estimate);
  if (parsed && !parsed.success) {
    return err("invalid_input", "that estimate is not valid");
  }
  const row = await ensureRow(patientId, parsedKind.data, db);
  const updated = await calculations(db).update(row.id, {
    estimatedValue: parsed ? parsed.data.value : null,
    estimateParameters: parsed ? parsed.data.parameters : null,
    estimatedAt: parsed ? new Date() : null,
  });
  return updated ? ok(updated) : noSuchPatient();
};

/**
 * Write the practitioner's validated value of one kind. The estimate stays as
 * it is. One `calculation.validated` event names the kind, the value and the
 * parameters used (D-32).
 */
const unscopedValidateCalculation = async (
  patientId: Id,
  kind: CalculationKind,
  validated: CalculationValue,
  actor: OperatorActor,
  db?: DatabaseClient,
): Promise<Result<PatientCalculation>> => {
  if (!uuidSchema.safeParse(patientId).success) {
    return noSuchPatient();
  }
  const parsedKind = kindSchema.safeParse(kind);
  if (!parsedKind.success) {
    return err("invalid_input", "that calculation does not exist");
  }
  const parsed = valueSchema.safeParse(validated);
  if (!parsed.success) {
    return err("invalid_input", "that value is not valid");
  }
  const row = await ensureRow(patientId, parsedKind.data, db);
  const updated = await calculations(db).update(row.id, {
    validatedValue: parsed.data.value,
    validationParameters: parsed.data.parameters,
    validatedAt: new Date(),
    validatedBy: actor.id,
    needsRevalidation: false,
  });
  if (!updated) {
    return noSuchPatient();
  }
  await recordAuditEvent({
    actor,
    action: "calculation.validated",
    targetType: "patient",
    targetId: patientId,
    detail: JSON.stringify({
      kind: parsedKind.data,
      value: parsed.data.value,
      parameters: parsed.data.parameters,
    }),
  });
  return ok(updated);
};

/**
 * The scoped surface (story 3, D-27). The actor comes first, and
 * `db/services/access` checks it before the body runs. A refused call answers
 * as a missing file.
 */
export const listPatientCalculations = byPatient(
  "read",
  unscopedListPatientCalculations,
  () => [],
);
export const setCalculationEstimate = byPatient(
  "write",
  unscopedSetCalculationEstimate,
  noSuchPatient,
);
export const validateCalculation = byPatient(
  "write",
  unscopedValidateCalculation,
  noSuchPatient,
);
