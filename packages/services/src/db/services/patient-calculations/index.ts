import { z } from "zod";
import {
  bmiIndicator,
  calculationKinds,
  type CalculationKind,
} from "../../../shared/calculations";
import { energyProposal } from "../../../shared/energy";
import { ageInYears } from "../../../shared/format";
import {
  proteinProposal,
  proteinTarget,
  proteinTargetDefaults,
} from "../../../shared/protein";
import { err, ok, type Result } from "../../../shared/result";
import type { Id } from "../../../types";
import { getDatabase, type DatabaseClient } from "../../client";
import type {
  CalculationParameters,
  PatientCalculation,
} from "../../models/patient-calculation";
import type { PatientProfile } from "../../models/patient-profile";
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
 * functions live in `shared/calculations.ts`, `shared/protein.ts` and
 * `shared/energy.ts`.
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

/** What the practitioner gives for the protein target. Null is an empty field. */
export type ProteinTargetValidation = {
  referenceWeightKg: number | null;
  coefficient: number | null;
  /** The final value in g/day as typed. Null: the computed value is the target. */
  value: number | null;
};

const targetNumber = z.number().finite().nullable();

const proteinTargetSchema = z.object({
  referenceWeightKg: targetNumber,
  coefficient: targetNumber,
  value: targetNumber,
});

/**
 * Validate the protein target of a file (story 8, REM-50). `proteinTarget`
 * gives the value from the reference weight and the coefficient, or keeps the
 * final value that the practitioner typed. The addition of the pregnancy or
 * the lactation comes from the row, never from the caller.
 *
 * The write is `validateCalculation`: the validated columns and one
 * `calculation.validated` event with the reference weight, the coefficient
 * and the final value (D-32). The estimate stays as it is. The reference
 * weight is a parameter of this row only: no weight of the file, no BMI and no
 * energy estimate is read or written here.
 *
 * A file with no protein estimate and no validated value is refused: the
 * target starts from a fact of the row (D-30).
 */
const unscopedValidateProteinTarget = async (
  patientId: Id,
  input: ProteinTargetValidation,
  actor: OperatorActor,
  db?: DatabaseClient,
): Promise<Result<PatientCalculation>> => {
  if (!uuidSchema.safeParse(patientId).success) {
    return noSuchPatient();
  }
  const parsed = proteinTargetSchema.safeParse(input);
  if (!parsed.success) {
    return err("invalid_input", "that protein target is not valid");
  }
  const defaults = proteinTargetDefaults(
    await rowFor(patientId, "protein", db),
  );
  if (!defaults) {
    return err("conflict", "the protein need has no estimate yet");
  }
  const target = proteinTarget({
    referenceWeightKg: parsed.data.referenceWeightKg,
    coefficient: parsed.data.coefficient,
    additionGramsPerDay: defaults.additionGramsPerDay,
    directValue: parsed.data.value,
  });
  if (target.state === "invalid") {
    return err("invalid_input", "that protein target is not valid");
  }
  return unscopedValidateCalculation(
    patientId,
    "protein",
    {
      value: target.value,
      parameters: {
        referenceWeightKg: target.referenceWeightKg,
        coefficient: target.coefficient,
        additionGramsPerDay: target.additionGramsPerDay,
        direct: target.direct,
      },
    },
    actor,
    db,
  );
};

type Measures = Pick<PatientProfile, "id" | "heightCm" | "weightKg">;

/**
 * Recompute the BMI estimate from the file's height and current weight
 * (story 7). The services that save one of the two call it after the save,
 * and nothing else does: no other datum changes the BMI. Unscoped: the
 * caller has checked the actor before its own write.
 *
 * Missing or implausible data clears the estimate (D-30). A file with no
 * estimate yet gets no empty row.
 */
export const refreshBmiEstimate = async (
  patientId: Id,
  db?: DatabaseClient,
): Promise<void> => {
  const profile = await (db ?? getDatabase())
    .collection<Measures>("patient_profiles")
    .findById(patientId);
  if (!profile) {
    return;
  }
  const heightCm = profile.heightCm ?? null;
  const weightKg = profile.weightKg ?? null;
  const indicator = bmiIndicator({ heightCm, weightKg });
  if (indicator.state === "computed") {
    await unscopedSetCalculationEstimate(
      patientId,
      "bmi",
      { value: indicator.value, parameters: { heightCm, weightKg } },
      db,
    );
    return;
  }
  const row = await rowFor(patientId, "bmi", db);
  if (row && row.estimatedValue !== null) {
    await unscopedSetCalculationEstimate(patientId, "bmi", null, db);
  }
};

type ProteinInputs = Pick<
  PatientProfile,
  "id" | "heightCm" | "weightKg" | "birthDate"
> & {
  /** `patient_profiles.special_situation`. Null until the practitioner enters it. */
  specialSituation?: string | null;
};

/**
 * Recompute the protein estimate from the file's current weight, with the
 * adaptations proposed (story 8). The services that refresh the BMI call it
 * after the same save, and after a save of the birth date. Unscoped: the
 * caller has checked the actor before its own write.
 *
 * The row keeps the reference weight, the coefficient, the addition and the
 * adaptations with the value (D-32). The age is derived on the day and is
 * not stored. A missing or implausible weight clears the estimate (D-30). A
 * file with no estimate yet gets no empty row.
 */
export const refreshProteinEstimate = async (
  patientId: Id,
  db?: DatabaseClient,
): Promise<void> => {
  const profile = await (db ?? getDatabase())
    .collection<ProteinInputs>("patient_profiles")
    .findById(patientId);
  if (!profile) {
    return;
  }
  const proposal = proteinProposal({
    weightKg: profile.weightKg ?? null,
    heightCm: profile.heightCm ?? null,
    age: ageInYears(profile.birthDate ?? null),
    specialSituation: profile.specialSituation ?? null,
  });
  if (proposal.state === "computed") {
    await unscopedSetCalculationEstimate(
      patientId,
      "protein",
      {
        value: proposal.value,
        parameters: {
          referenceWeightKg: proposal.referenceWeightKg,
          coefficient: proposal.coefficient,
          additionGramsPerDay: proposal.additionGramsPerDay,
          adaptations: proposal.adaptations,
        },
      },
      db,
    );
    return;
  }
  const row = await rowFor(patientId, "protein", db);
  if (row && row.estimatedValue !== null) {
    await unscopedSetCalculationEstimate(patientId, "protein", null, db);
  }
};

type EnergyInputs = Pick<
  PatientProfile,
  "id" | "heightCm" | "weightKg" | "birthDate"
> & {
  /** `patient_profiles.sex_for_calculation`: `female`, `male` or null. */
  sexForCalculation?: string | null;
  /** `patient_profiles.activity_level`: one of the four NAP levels, or null. */
  activityLevel?: string | null;
};

/**
 * Recompute the energy estimate (story 9): the resting metabolism of
 * Mifflin-St Jeor times the NAP coefficient. The services that refresh the
 * protein estimate call it after the same save, and the questionnaire calls
 * it after a save of the sex used for the calculation or of the activity
 * level. Unscoped: the caller has checked the actor before its own write.
 *
 * The weight is the current weight. The protein reference weight is not
 * read. The value is the daily need, not rounded: the screen rounds. The row
 * keeps the resting metabolism, the sex, the age, the height, the weight,
 * the activity level and the NAP with the value (D-32). The validated
 * columns stay as they are. Missing or implausible data clears the estimate
 * (D-30). A file with no estimate yet gets no empty row.
 */
export const refreshEnergyEstimate = async (
  patientId: Id,
  db?: DatabaseClient,
): Promise<void> => {
  const profile = await (db ?? getDatabase())
    .collection<EnergyInputs>("patient_profiles")
    .findById(patientId);
  if (!profile) {
    return;
  }
  const proposal = energyProposal({
    sexForCalculation: profile.sexForCalculation ?? null,
    ageYears: ageInYears(profile.birthDate ?? null),
    heightCm: profile.heightCm ?? null,
    weightKg: profile.weightKg ?? null,
    activityLevel: profile.activityLevel ?? null,
  });
  if (proposal.state === "computed") {
    await unscopedSetCalculationEstimate(
      patientId,
      "energy",
      {
        value: proposal.value,
        parameters: {
          restingMetabolism: proposal.restingMetabolism,
          sexForCalculation: proposal.sexForCalculation,
          ageYears: proposal.ageYears,
          heightCm: proposal.heightCm,
          weightKg: proposal.weightKg,
          activityLevel: proposal.activityLevel,
          nap: proposal.nap,
        },
      },
      db,
    );
    return;
  }
  const row = await rowFor(patientId, "energy", db);
  if (row && row.estimatedValue !== null) {
    await unscopedSetCalculationEstimate(patientId, "energy", null, db);
  }
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
export const validateProteinTarget = byPatient(
  "write",
  unscopedValidateProteinTarget,
  noSuchPatient,
);
