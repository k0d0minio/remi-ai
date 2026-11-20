/**
 * The energy estimate of the file — story 9. The resting metabolism is
 * Mifflin-St Jeor (1990) on the current weight, the height, the age and the
 * sex used for the calculation. The daily need is the resting metabolism
 * times the NAP coefficient of the activity level. Morgane names this a
 * hybrid choice, not the EFSA calculation itself.
 *
 * The weight is always the current weight: the protein reference weight
 * changes nothing here. REMI applies no calorie restriction alone. The result
 * is an estimate until the practitioner validates a target (D-30).
 *
 * The functions do not round. The screen rounds to the kcal, so the need
 * comes from the exact resting metabolism.
 *
 * Isomorphic: no I/O and no clock. The caller gives the age.
 */

import {
  bmiInputRanges,
  calculationInputs,
  type BmiInput,
  type CalculationInput,
} from "./calculations";
import {
  activityLevelDetails,
  activityLevels,
  sexesForCalculation,
} from "./questionnaire";

type SexForCalculation = (typeof sexesForCalculation)[number];
type ActivityLevel = (typeof activityLevels)[number];

/** The constant that Mifflin-St Jeor adds for each sex, in kcal/day. */
export const restingMetabolismSexConstants = {
  female: -161,
  male: 5,
} as const satisfies Record<SexForCalculation, number>;

const isSexForCalculation = (value: unknown): value is SexForCalculation =>
  typeof value === "string" &&
  (sexesForCalculation as readonly string[]).includes(value);

const isActivityLevel = (value: unknown): value is ActivityLevel =>
  typeof value === "string" &&
  (activityLevels as readonly string[]).includes(value);

/**
 * The resting metabolism in kcal/day, not rounded:
 * `10 × poids + 6,25 × taille − 5 × âge`, then − 161 (female) or + 5 (male).
 */
export const restingMetabolism = ({
  sex,
  weightKg,
  heightCm,
  ageYears,
}: {
  sex: SexForCalculation;
  weightKg: number;
  heightCm: number;
  ageYears: number;
}) =>
  10 * weightKg +
  6.25 * heightCm -
  5 * ageYears +
  restingMetabolismSexConstants[sex];

/** The daily need in kcal/day, not rounded: the resting metabolism × NAP. */
export const energyNeed = (
  restingKcalPerDay: number,
  activityLevel: ActivityLevel,
) => restingKcalPerDay * activityLevelDetails[activityLevel].nap;

/** The file's data that the estimate reads. Null is « Non renseigné ». */
export type EnergyProfile = {
  /** `patient_profiles.sex_for_calculation`. Never the identity field `sex`. */
  sexForCalculation: string | null;
  /** Whole years on the day of the calculation. */
  ageYears: number | null;
  heightCm: number | null;
  /** The current weight. Never the protein reference weight. */
  weightKg: number | null;
  activityLevel: string | null;
};

/** What the file can say about the energy need. */
export type EnergyProposal =
  | { state: "missing"; inputs: CalculationInput[] }
  | { state: "out_of_range"; inputs: BmiInput[] }
  | {
      state: "computed";
      /** kcal/day, not rounded: the estimated daily need. */
      value: number;
      /** kcal/day, not rounded. */
      restingMetabolism: number;
      sexForCalculation: SexForCalculation;
      ageYears: number;
      heightCm: number;
      weightKg: number;
      activityLevel: ActivityLevel;
      nap: number;
    };

const measureInputs: readonly BmiInput[] = ["heightCm", "weightKg"];

/**
 * The energy estimate of a file (story 9). It computes only when the five
 * data are present, and the height and the weight are plausible. Else it
 * names the data and gives no value (D-30).
 *
 * A sex that is not female or male, and an activity level that is not one of
 * the four, read as missing: the formula has no answer for them.
 */
export const energyProposal = (profile: EnergyProfile): EnergyProposal => {
  const { ageYears, heightCm, weightKg } = profile;
  const sex = isSexForCalculation(profile.sexForCalculation)
    ? profile.sexForCalculation
    : null;
  const activityLevel = isActivityLevel(profile.activityLevel)
    ? profile.activityLevel
    : null;
  if (
    sex === null ||
    ageYears === null ||
    heightCm === null ||
    weightKg === null ||
    activityLevel === null
  ) {
    const present: Record<CalculationInput, boolean> = {
      sexForCalculation: sex !== null,
      age: ageYears !== null,
      heightCm: heightCm !== null,
      weightKg: weightKg !== null,
      activityLevel: activityLevel !== null,
    };
    return {
      state: "missing",
      inputs: calculationInputs.energy.filter((input) => !present[input]),
    };
  }
  const measures = { heightCm, weightKg };
  const outOfRange = measureInputs.filter((input) => {
    const range = bmiInputRanges[input];
    return measures[input] < range.min || measures[input] > range.max;
  });
  if (outOfRange.length > 0) {
    return { state: "out_of_range", inputs: outOfRange };
  }
  const resting = restingMetabolism({ sex, weightKg, heightCm, ageYears });
  return {
    state: "computed",
    value: energyNeed(resting, activityLevel),
    restingMetabolism: resting,
    sexForCalculation: sex,
    ageYears,
    heightCm,
    weightKg,
    activityLevel,
    nap: activityLevelDetails[activityLevel].nap,
  };
};

/** What the `energy` row keeps with its estimate (D-32). */
export type EnergyEstimateParameters = {
  restingMetabolism: number | null;
  sexForCalculation: SexForCalculation | null;
  ageYears: number | null;
  heightCm: number | null;
  weightKg: number | null;
  activityLevel: ActivityLevel | null;
  nap: number | null;
};

const numberOrNull = (value: unknown) =>
  typeof value === "number" && Number.isFinite(value) ? value : null;

/**
 * Read the parameters of a stored energy estimate. The column is free JSON,
 * so each field is checked: a field of the wrong type or with an unknown key
 * reads as null.
 */
export const energyEstimateParameters = (
  parameters: Readonly<Record<string, unknown>> | null,
): EnergyEstimateParameters => {
  const sex = parameters?.sexForCalculation;
  const level = parameters?.activityLevel;
  return {
    restingMetabolism: numberOrNull(parameters?.restingMetabolism),
    sexForCalculation: isSexForCalculation(sex) ? sex : null,
    ageYears: numberOrNull(parameters?.ageYears),
    heightCm: numberOrNull(parameters?.heightCm),
    weightKg: numberOrNull(parameters?.weightKg),
    activityLevel: isActivityLevel(level) ? level : null,
    nap: numberOrNull(parameters?.nap),
  };
};
