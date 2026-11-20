import { z } from "zod";
import {
  bmiIndicator,
  calculationKinds,
  type CalculationKind,
} from "../../../shared/calculations";
import { energyProposal, energyTarget } from "../../../shared/energy";
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
  ComputedEstimates,
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
 *
 * An estimate is written at a save of one of its data. A file that was last
 * saved before an estimate existed thus has none, though its data are
 * complete (REM-52). Two rules cover it. A read never writes:
 * `computePatientEstimates` gives the estimate of the file as it is now, for
 * the screen. A validation writes the missing estimate first, then validates.
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
  let row = await rowFor(patientId, "protein", db);
  if ((row?.estimatedValue ?? null) === null) {
    // The file may have its data and no stored estimate yet (REM-52).
    await refreshProteinEstimate(patientId, db);
    row = await rowFor(patientId, "protein", db);
  }
  const defaults = proteinTargetDefaults(row);
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

/** The protein estimate of the file as it is now, or null (D-30). */
const proteinEstimateOf = (profile: ProteinInputs): CalculationValue | null => {
  const proposal = proteinProposal({
    weightKg: profile.weightKg ?? null,
    heightCm: profile.heightCm ?? null,
    age: ageInYears(profile.birthDate ?? null),
    specialSituation: profile.specialSituation ?? null,
  });
  return proposal.state === "computed"
    ? {
        value: proposal.value,
        parameters: {
          referenceWeightKg: proposal.referenceWeightKg,
          coefficient: proposal.coefficient,
          additionGramsPerDay: proposal.additionGramsPerDay,
          adaptations: proposal.adaptations,
        },
      }
    : null;
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
  const estimate = proteinEstimateOf(profile);
  if (estimate) {
    await unscopedSetCalculationEstimate(patientId, "protein", estimate, db);
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

/** The energy estimate of the file as it is now, or null (D-30). */
const energyEstimateOf = (profile: EnergyInputs): CalculationValue | null => {
  const proposal = energyProposal({
    sexForCalculation: profile.sexForCalculation ?? null,
    ageYears: ageInYears(profile.birthDate ?? null),
    heightCm: profile.heightCm ?? null,
    weightKg: profile.weightKg ?? null,
    activityLevel: profile.activityLevel ?? null,
  });
  return proposal.state === "computed"
    ? {
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
      }
    : null;
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
  const estimate = energyEstimateOf(profile);
  if (estimate) {
    await unscopedSetCalculationEstimate(patientId, "energy", estimate, db);
    return;
  }
  const row = await rowFor(patientId, "energy", db);
  if (row && row.estimatedValue !== null) {
    await unscopedSetCalculationEstimate(patientId, "energy", null, db);
  }
};

const noEstimates: ComputedEstimates = { protein: null, energy: null };

/**
 * The protein and energy estimates of the file as it is now, computed and
 * not written (REM-52). The screen shows one where the row has no estimate
 * yet, so a file with complete data never reads « Non calculé ». The
 * functions and the parameters are those of the two refreshes: the value on
 * the screen is the value that the next write stores.
 */
const unscopedComputePatientEstimates = async (
  patientId: Id,
  db?: DatabaseClient,
): Promise<ComputedEstimates> => {
  if (!uuidSchema.safeParse(patientId).success) {
    return noEstimates;
  }
  const profile = await (db ?? getDatabase())
    .collection<ProteinInputs & EnergyInputs>("patient_profiles")
    .findById(patientId);
  if (!profile) {
    return noEstimates;
  }
  return {
    protein: proteinEstimateOf(profile),
    energy: energyEstimateOf(profile),
  };
};

/** What the practitioner gives for the calorie target. Null is an empty field. */
export type EnergyTargetValidation = {
  /** A key of `energyGoals`. */
  goal: string | null;
  /** A key of `specialSituations`. Null: not entered. */
  specialSituation: string | null;
  /** `value` or `difference`. */
  entry: string | null;
  /** kcal/day: the target, or the difference from the estimate. */
  amount: number | null;
};

const energyTargetSchema = z.object({
  goal: z.string().nullable(),
  specialSituation: z.string().nullable(),
  entry: z.string().nullable(),
  amount: targetNumber,
});

/**
 * Validate the calorie target of a file (story 9, REM-52). `energyTarget`
 * gives the value: the typed target, or the estimated need plus the typed
 * difference. The estimate comes from the row, never from the caller. A file
 * with its data and no stored estimate gets the estimate written first. A
 * file with no estimate is refused: with a datum missing there is no number
 * (D-30).
 *
 * The write is `validateCalculation`: the validated columns and one
 * `calculation.validated` event with the goal, the situation, the estimate
 * and the target (D-32). The estimate stays as it is, and a later estimate
 * never changes the validated target. The goal and the situation are
 * parameters of this row only: no datum of the file and no protein value is
 * read or written here. REMI sets no target alone.
 */
const unscopedValidateEnergyTarget = async (
  patientId: Id,
  input: EnergyTargetValidation,
  actor: OperatorActor,
  db?: DatabaseClient,
): Promise<Result<PatientCalculation>> => {
  if (!uuidSchema.safeParse(patientId).success) {
    return noSuchPatient();
  }
  const parsed = energyTargetSchema.safeParse(input);
  if (!parsed.success) {
    return err("invalid_input", "that calorie target is not valid");
  }
  let row = await rowFor(patientId, "energy", db);
  if ((row?.estimatedValue ?? null) === null) {
    await refreshEnergyEstimate(patientId, db);
    row = await rowFor(patientId, "energy", db);
  }
  const estimate = row?.estimatedValue ?? null;
  if (estimate === null) {
    return err("conflict", "the energy need has no estimate yet");
  }
  const target = energyTarget({
    estimateKcalPerDay: estimate,
    ...parsed.data,
  });
  if (target.state === "invalid") {
    return err("invalid_input", "that calorie target is not valid");
  }
  return unscopedValidateCalculation(
    patientId,
    "energy",
    {
      value: target.value,
      parameters: {
        goal: target.goal,
        specialSituation: target.specialSituation,
        entry: target.entry,
        estimatedNeed: target.estimatedNeed,
        difference: target.difference,
      },
    },
    actor,
    db,
  );
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
export const validateEnergyTarget = byPatient(
  "write",
  unscopedValidateEnergyTarget,
  noSuchPatient,
);
export const computePatientEstimates = byPatient(
  "read",
  unscopedComputePatientEstimates,
  () => noEstimates,
);
