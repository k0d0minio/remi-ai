import type {
  activityLevels,
  allergenKinds,
  allergens,
  amy1aCategories,
  apoeGenotypes,
  diets,
  dio2Categories,
  geneticTestAnswers,
  intolerances,
  sexesForCalculation,
} from "../../shared/questionnaire";
import type { Entity, Id } from "../../types";

export type SexForCalculation = (typeof sexesForCalculation)[number];
export type ActivityLevel = (typeof activityLevels)[number];
export type Diet = (typeof diets)[number];
export type AllergenKind = (typeof allergenKinds)[number];
export type AllergenKey = (typeof allergens)[number];
export type IntoleranceKey = (typeof intolerances)[number];
export type GeneticTestAnswer = (typeof geneticTestAnswers)[number];
export type ApoeGenotype = (typeof apoeGenotypes)[number];
export type Dio2Category = (typeof dio2Categories)[number];
export type Amy1aCategory = (typeof amy1aCategories)[number];

/**
 * The questionnaire's answers on `patient_profiles` — story 4. Kept apart from
 * `PatientProfile` so the profile's create and update paths stay as they are
 * until `questionnaire-flow` reads these fields on a page.
 *
 * Every field is null until answered (D-30: REMI invents no answer). The two
 * « none known » flags are three states: `true` is the declared absence,
 * `false` is declared rows in `patient_allergens`, null is no answer.
 */
export type PatientQuestionnaire = {
  sexForCalculation: SexForCalculation | null;
  activityLevel: ActivityLevel | null;
  desiredWeightKg: number | null;
  consultationReason: string | null;
  /** `YYYY-MM-DD`. */
  consultationDate: string | null;
  diet: Diet | null;
  dietNote: string | null;
  pathologies: string | null;
  celiacDisease: boolean | null;
  geneticTest: GeneticTestAnswer | null;
  apoe: ApoeGenotype | null;
  dio2: Dio2Category | null;
  amy1a: Amy1aCategory | null;
  practitionerQuestionAnswer: string | null;
  /**
   * The practitioner's question as the patient read it when they last changed
   * the answer (REM-161). The service writes it, never a form.
   */
  practitionerQuestionText: string | null;
  noKnownAllergies: boolean | null;
  noKnownIntolerances: boolean | null;
};

/**
 * One checked box of the allergy or intolerance lists. `subKey` is a key of the
 * category's sub-list, or `all` for « Tous ». Null on a category that has a
 * sub-list excludes the whole category, by precaution.
 */
export type PatientAllergen = Entity & {
  patientId: Id;
  kind: AllergenKind;
  key: AllergenKey | IntoleranceKey;
  subKey: string | null;
  /** The « Autre » text. Null on every other row. */
  otherText: string | null;
};
