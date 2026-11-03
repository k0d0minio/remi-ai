import type { MandatoryQuestionnaireField } from "@remi/services/shared";

/**
 * The questionnaire's sections, in the order the patient meets them (story 4).
 * The key is the URL's `?section=` value. « Question du praticien » joins with
 * `practitioner-free-question`.
 */
export const questionnaireSections = [
  "identite",
  "profil",
  "consultation",
  "alimentation",
  "sante",
  "genetique",
] as const;

export type QuestionnaireSection = (typeof questionnaireSections)[number];

/** Where each mandatory field is asked. */
export const sectionOfField = {
  sexForCalculation: "profil",
  heightCm: "profil",
  weightKg: "profil",
  activityLevel: "profil",
  consultationReason: "consultation",
  allergies: "alimentation",
  intolerances: "alimentation",
} as const satisfies Record<MandatoryQuestionnaireField, QuestionnaireSection>;

export const isQuestionnaireSection = (
  value: unknown,
): value is QuestionnaireSection =>
  typeof value === "string" &&
  (questionnaireSections as readonly string[]).includes(value);

/**
 * Where the questionnaire reopens: the first section that holds a missing
 * mandatory field. A complete questionnaire reopens on Identité, and every
 * section stays open to the patient.
 */
export const resumeSection = (
  missing: readonly MandatoryQuestionnaireField[],
): QuestionnaireSection =>
  questionnaireSections.find((section) =>
    missing.some((field) => sectionOfField[field] === section),
  ) ?? "identite";
