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
  isSpecialSituation,
  type BmiInput,
  type CalculationInput,
  type SpecialSituation,
} from "./calculations";
import type { Locale } from "./i18n";
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

/**
 * The goal that the practitioner records with the calorie target (story 9).
 * It names the target. It changes no estimate and no target: REMI sets no
 * restriction from a goal (Morgane's question 2, default accepted).
 */
export const energyGoals = [
  "maintenance",
  "weight_loss",
  "weight_gain",
  "muscle_gain",
] as const;

export type EnergyGoal = (typeof energyGoals)[number];

/** Morgane's wording (story 9). */
export const energyGoalLabels = {
  maintenance: { fr: "Maintien" },
  weight_loss: { fr: "Perte de poids" },
  weight_gain: { fr: "Prise de poids" },
  muscle_gain: { fr: "Prise de masse musculaire" },
} as const satisfies Record<EnergyGoal, Readonly<Record<Locale, string>>>;

const isEnergyGoal = (value: unknown): value is EnergyGoal =>
  typeof value === "string" &&
  (energyGoals as readonly string[]).includes(value);

/**
 * How the practitioner gives the target: the value in kcal/day, or a
 * difference in kcal/day from the estimated need.
 */
export const energyTargetEntries = ["value", "difference"] as const;

export type EnergyTargetEntry = (typeof energyTargetEntries)[number];

const isEnergyTargetEntry = (value: unknown): value is EnergyTargetEntry =>
  typeof value === "string" &&
  (energyTargetEntries as readonly string[]).includes(value);

/**
 * The limits of a typed calorie target and of a typed difference, in
 * kcal/day (REM-52). They are limits of plausibility for a typed value, not
 * clinical rules. Story 9 gives none: these are wide, and the practitioner
 * decides inside them.
 */
export const energyTargetBounds = {
  value: { min: 500, max: 6000 },
  difference: { min: -2000, max: 2000 },
} as const;

/** One field of the calorie target. `estimate` is not typed: REMI gives it. */
export type EnergyTargetField =
  | "estimate"
  | "goal"
  | "specialSituation"
  | "entry"
  | "amount";

/** What the practitioner gives for the target. Null is an empty field. */
export type EnergyTargetInput = {
  /** The estimated need of the row, in kcal/day, not rounded. REMI gives it. */
  estimateKcalPerDay: number | null;
  /** A key of `energyGoals`. */
  goal: string | null;
  /** A key of `specialSituations`. Null: not entered. */
  specialSituation: string | null;
  /** A key of `energyTargetEntries`. */
  entry: string | null;
  /** The typed number: the target, or the difference from the estimate. */
  amount: number | null;
};

/** The target that a validation writes, or the fields that are not valid. */
export type EnergyTarget =
  | { state: "invalid"; fields: EnergyTargetField[] }
  | {
      state: "computed";
      /** kcal/day, a whole number: the value that the validation writes. */
      value: number;
      /** kcal/day: the estimated need, rounded as the screen shows it. */
      estimatedNeed: number;
      /** kcal/day: the target minus the rounded estimate. */
      difference: number;
      goal: EnergyGoal;
      specialSituation: SpecialSituation | null;
      entry: EnergyTargetEntry;
    };

const wholeWithin = (
  value: number | null,
  range: { min: number; max: number },
): value is number =>
  value !== null &&
  Number.isInteger(value) &&
  value >= range.min &&
  value <= range.max;

/**
 * The calorie target from what the practitioner typed (story 9). A typed
 * value is the target. A typed difference is added to the estimated need,
 * rounded to the kcal as the screen shows it: − 300 against 2 300 gives 2 000.
 *
 * The goal and the special situation are kept with the target. They change no
 * number. An empty amount gives no target: REMI writes no target alone, and
 * applies no restriction from a goal or from the BMI. With no estimate there
 * is no target (D-30): the result names `estimate`.
 *
 * A field that is empty, unknown or out of its limits gives no value: the
 * result names each field.
 */
export const energyTarget = (input: EnergyTargetInput): EnergyTarget => {
  const { estimateKcalPerDay, goal, specialSituation, entry, amount } = input;
  const fields: EnergyTargetField[] = [];
  const estimate =
    estimateKcalPerDay !== null &&
    Number.isFinite(estimateKcalPerDay) &&
    estimateKcalPerDay > 0
      ? Math.round(estimateKcalPerDay)
      : null;
  if (estimate === null) {
    fields.push("estimate");
  }
  if (!isEnergyGoal(goal)) {
    fields.push("goal");
  }
  if (specialSituation !== null && !isSpecialSituation(specialSituation)) {
    fields.push("specialSituation");
  }
  if (!isEnergyTargetEntry(entry)) {
    fields.push("entry");
  }
  const amountValid =
    isEnergyTargetEntry(entry) && wholeWithin(amount, energyTargetBounds[entry]);
  if (!amountValid) {
    fields.push("amount");
  }
  if (
    estimate === null ||
    !isEnergyGoal(goal) ||
    (specialSituation !== null && !isSpecialSituation(specialSituation)) ||
    !isEnergyTargetEntry(entry) ||
    amount === null ||
    !amountValid
  ) {
    return { state: "invalid", fields };
  }
  const value = entry === "value" ? amount : estimate + amount;
  if (!wholeWithin(value, energyTargetBounds.value)) {
    return { state: "invalid", fields: ["amount"] };
  }
  return {
    state: "computed",
    value,
    estimatedNeed: estimate,
    difference: value - estimate,
    goal,
    specialSituation,
    entry,
  };
};

/** What the `energy` row keeps with its validated target (D-32). */
export type EnergyTargetParameters = {
  goal: EnergyGoal | null;
  specialSituation: SpecialSituation | null;
  entry: EnergyTargetEntry | null;
  /** kcal/day: the rounded estimate that the practitioner saw at « Valider ». */
  estimatedNeed: number | null;
  /** kcal/day: the target minus that estimate. */
  difference: number | null;
};

/**
 * Read the parameters of a validated calorie target. The column is free
 * JSON, so each field is checked: a field of the wrong type or with an
 * unknown key reads as null.
 */
export const energyTargetParameters = (
  parameters: Readonly<Record<string, unknown>> | null,
): EnergyTargetParameters => {
  const goal = parameters?.goal;
  const situation = parameters?.specialSituation;
  const entry = parameters?.entry;
  return {
    goal: isEnergyGoal(goal) ? goal : null,
    specialSituation: isSpecialSituation(situation) ? situation : null,
    entry: isEnergyTargetEntry(entry) ? entry : null,
    estimatedNeed: numberOrNull(parameters?.estimatedNeed),
    difference: numberOrNull(parameters?.difference),
  };
};

/** What the detail of the calorie target opens with. */
export type EnergyTargetDefaults = {
  goal: EnergyGoal | null;
  specialSituation: SpecialSituation | null;
  entry: EnergyTargetEntry;
  /** Null: the field opens empty. Never the estimate. */
  amount: number | null;
};

/**
 * The values that the detail of the calorie target opens with, from facts of
 * the row only (D-30). A validated target gives its goal, its situation and
 * what the practitioner typed: the value, or the difference. With no
 * validated target every field opens empty: the estimate is never offered as
 * a target.
 */
export const energyTargetDefaults = (
  row: {
    validatedValue: number | null;
    validationParameters: Readonly<Record<string, unknown>> | null;
  } | null,
): EnergyTargetDefaults => {
  if (!row || row.validatedValue === null) {
    return { goal: null, specialSituation: null, entry: "value", amount: null };
  }
  const stored = energyTargetParameters(row.validationParameters);
  const byDifference = stored.entry === "difference" && stored.difference !== null;
  return {
    goal: stored.goal,
    specialSituation: stored.specialSituation,
    entry: byDifference ? "difference" : "value",
    amount: byDifference ? stored.difference : row.validatedValue,
  };
};
