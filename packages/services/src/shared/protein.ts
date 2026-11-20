/**
 * The protein estimate of the file — story 8. The need is a reference weight
 * times a coefficient. The default is the current weight times 0.83 g/kg/day,
 * the EFSA reference.
 *
 * REMI proposes adaptations and the practitioner confirms them. The gram
 * additions of pregnancy and lactation are part of the estimate (Morgane's
 * question 1, default accepted). REMI applies no other coefficient and no
 * other reference weight alone. The result is an estimate until the
 * practitioner validates it (D-30).
 *
 * Isomorphic: no I/O and no clock. The caller gives the age.
 */

import {
  bmiIndicator,
  missingCalculationInputs,
  type CalculationInput,
  type SpecialSituation,
} from "./calculations";
import type { Locale } from "./i18n";
import { weightKgRange } from "./questionnaire";

/** The EFSA reference, in g/kg/day. */
export const defaultProteinCoefficient = 0.83;

/** From this age, REMI proposes the coefficient range below. */
export const seniorProteinAge = 65;

/** The range proposed from `seniorProteinAge`, in g/kg/day. Never applied alone. */
export const seniorProteinCoefficientRange = { min: 1, max: 1.2 } as const;

/** The grams per day that a pregnancy trimester or a lactation period adds. */
export const proteinAdditions = {
  pregnancy_1: 1,
  pregnancy_2: 9,
  pregnancy_3: 28,
  lactation_first_6_months: 19,
  lactation_after_6_months: 13,
} as const satisfies Partial<Record<SpecialSituation, number>>;

/** The situations that make the practitioner's validation mandatory. */
export const proteinValidationSituations = [
  "pathology",
  "malnutrition",
  "other",
] as const satisfies readonly SpecialSituation[];

type AdditionSituation = keyof typeof proteinAdditions;
type ValidationSituation = (typeof proteinValidationSituations)[number];

/** One adaptation that REMI proposes. The practitioner confirms each one. */
export type ProteinAdaptation =
  | "age_65_plus"
  | AdditionSituation
  | ValidationSituation
  | "reference_weight_review";

/** The text of each adaptation. The reference-weight note is Morgane's wording. */
export const proteinAdaptationLabels = {
  age_65_plus: {
    fr: "65 ans ou plus : coefficient de 1 à 1,2 g/kg/jour proposé, non appliqué sans votre confirmation",
    en: "65 and over: a coefficient of 1 to 1.2 g/kg/day is proposed, not applied without your confirmation",
  },
  pregnancy_1: {
    fr: "Grossesse, 1er trimestre : + 1 g/jour, ajouté à l'estimation",
    en: "Pregnancy, 1st trimester: + 1 g/day, added to the estimate",
  },
  pregnancy_2: {
    fr: "Grossesse, 2e trimestre : + 9 g/jour, ajouté à l'estimation",
    en: "Pregnancy, 2nd trimester: + 9 g/day, added to the estimate",
  },
  pregnancy_3: {
    fr: "Grossesse, 3e trimestre : + 28 g/jour, ajouté à l'estimation",
    en: "Pregnancy, 3rd trimester: + 28 g/day, added to the estimate",
  },
  lactation_first_6_months: {
    fr: "Allaitement, 6 premiers mois : + 19 g/jour, ajouté à l'estimation",
    en: "Lactation, first 6 months: + 19 g/day, added to the estimate",
  },
  lactation_after_6_months: {
    fr: "Allaitement, après 6 mois : + 13 g/jour, ajouté à l'estimation",
    en: "Lactation, after 6 months: + 13 g/day, added to the estimate",
  },
  pathology: {
    fr: "Pathologie : validation obligatoire",
    en: "Pathology: validation is mandatory",
  },
  malnutrition: {
    fr: "Dénutrition : validation obligatoire",
    en: "Malnutrition: validation is mandatory",
  },
  other: {
    fr: "Situation particulière : validation obligatoire",
    en: "Special situation: validation is mandatory",
  },
  reference_weight_review: {
    fr: "Un poids de référence protéique différent peut devoir être évalué",
    en: "A different protein reference weight may need to be evaluated",
  },
} as const satisfies Record<
  ProteinAdaptation,
  Readonly<Record<Locale, string>>
>;

const isAdditionSituation = (value: string): value is AdditionSituation =>
  Object.hasOwn(proteinAdditions, value);

const isValidationSituation = (value: string): value is ValidationSituation =>
  (proteinValidationSituations as readonly string[]).includes(value);

const isProteinAdaptation = (value: unknown): value is ProteinAdaptation =>
  typeof value === "string" && Object.hasOwn(proteinAdaptationLabels, value);

/**
 * The need in whole grams per day (Morgane's question 3, default accepted).
 * The product is rounded to the milligram first, so that binary noise does
 * not move a half: 50 × 0.83 is 41.5 and gives 42.
 */
export const proteinNeed = ({
  referenceWeightKg,
  coefficient,
}: {
  referenceWeightKg: number;
  coefficient: number;
}) => Math.round(Math.round(referenceWeightKg * coefficient * 1000) / 1000);

/** The file's data that the proposal reads. Null is « Non renseigné ». */
export type ProteinProfile = {
  weightKg: number | null;
  /** Read for the BMI note only. */
  heightCm: number | null;
  /** Whole years on the day of the calculation. Never stored. */
  age: number | null;
  /** A key of `specialSituations`. Null until the practitioner enters it. */
  specialSituation: string | null;
};

/** What the file can say about the protein need. */
export type ProteinProposal =
  | { state: "missing"; inputs: CalculationInput[] }
  | { state: "out_of_range"; inputs: CalculationInput[] }
  | {
      state: "computed";
      /** g/day: the base need plus the addition. */
      value: number;
      referenceWeightKg: number;
      coefficient: number;
      additionGramsPerDay: number;
      adaptations: ProteinAdaptation[];
      validationRequired: boolean;
    };

/**
 * The protein estimate of a file with the adaptations proposed (story 8).
 * It computes only when the current weight is present and plausible. Else it
 * names the datum and gives no value (D-30).
 *
 * The reference weight is the current weight and the coefficient is the
 * default: the age and the BMI change neither. They add a proposal only.
 * A BMI that cannot be computed adds no note.
 */
export const proteinProposal = (profile: ProteinProfile): ProteinProposal => {
  const { weightKg, heightCm, age, specialSituation } = profile;
  const missing = missingCalculationInputs("protein", {
    sexForCalculation: null,
    birthDate: null,
    heightCm,
    weightKg,
    activityLevel: null,
  });
  if (weightKg === null || missing.length > 0) {
    return { state: "missing", inputs: missing };
  }
  if (weightKg < weightKgRange.min || weightKg > weightKgRange.max) {
    return { state: "out_of_range", inputs: ["weightKg"] };
  }

  const adaptations: ProteinAdaptation[] = [];
  if (age !== null && age >= seniorProteinAge) {
    adaptations.push("age_65_plus");
  }
  let additionGramsPerDay = 0;
  let validationRequired = false;
  if (specialSituation !== null && isAdditionSituation(specialSituation)) {
    additionGramsPerDay = proteinAdditions[specialSituation];
    adaptations.push(specialSituation);
  }
  if (specialSituation !== null && isValidationSituation(specialSituation)) {
    validationRequired = true;
    adaptations.push(specialSituation);
  }
  const indicator = bmiIndicator({ heightCm, weightKg });
  if (indicator.state === "computed" && indicator.needsReview) {
    adaptations.push("reference_weight_review");
  }

  const coefficient = defaultProteinCoefficient;
  return {
    state: "computed",
    value:
      proteinNeed({ referenceWeightKg: weightKg, coefficient }) +
      additionGramsPerDay,
    referenceWeightKg: weightKg,
    coefficient,
    additionGramsPerDay,
    adaptations,
    validationRequired,
  };
};

/** What the `protein` row keeps with its estimate (D-32). */
export type ProteinEstimateParameters = {
  referenceWeightKg: number | null;
  coefficient: number | null;
  additionGramsPerDay: number;
  adaptations: ProteinAdaptation[];
  validationRequired: boolean;
};

const numberOrNull = (value: unknown) =>
  typeof value === "number" && Number.isFinite(value) ? value : null;

/**
 * Read the parameters of a stored protein estimate. The column is free JSON,
 * so each field is checked: an unknown adaptation is dropped, and a field
 * that is not a number reads as null. The mandatory validation comes from the
 * adaptations, not from a stored flag.
 */
export const proteinEstimateParameters = (
  parameters: Readonly<Record<string, unknown>> | null,
): ProteinEstimateParameters => {
  const stored = parameters?.adaptations;
  const adaptations = Array.isArray(stored)
    ? stored.filter(isProteinAdaptation)
    : [];
  return {
    referenceWeightKg: numberOrNull(parameters?.referenceWeightKg),
    coefficient: numberOrNull(parameters?.coefficient),
    additionGramsPerDay: numberOrNull(parameters?.additionGramsPerDay) ?? 0,
    adaptations,
    validationRequired: adaptations.some(isValidationSituation),
  };
};
