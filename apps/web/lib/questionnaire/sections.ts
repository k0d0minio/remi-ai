import {
  mandatoryQuestionnaireFields,
  questionnaireSections,
  sectionOfMandatoryField,
  type MandatoryQuestionnaireField,
  type QuestionnaireSection,
} from "@remi/services/shared";

/**
 * The sections and the place of each mandatory field have one home,
 * `shared/questionnaire.ts`: the console's form reads the same list. The key
 * is the URL's `?section=` value. « Question du praticien » joins with
 * `practitioner-free-question`.
 */
export { questionnaireSections, type QuestionnaireSection };

/** Where each mandatory field is asked. */
export const sectionOfField = sectionOfMandatoryField;

export const isQuestionnaireSection = (
  value: unknown,
): value is QuestionnaireSection =>
  typeof value === "string" &&
  (questionnaireSections as readonly string[]).includes(value);

/**
 * The `?section=` value of the end screen (REM-168). It is a step of the
 * journey, but not a section: it asks no question.
 */
export const END_STEP = "fin";

/** What the page can show: one of the six sections, or the end screen. */
export type QuestionnaireStep = QuestionnaireSection | typeof END_STEP;

export const isQuestionnaireStep = (
  value: unknown,
): value is QuestionnaireStep =>
  value === END_STEP || isQuestionnaireSection(value);

/**
 * The cookie that keeps the last step the patient looked at (REM-156,
 * REM-167). It holds a step key only, never an answer. The page reads it on
 * the server, so the questionnaire reopens on that step with no flash.
 */
export const STEP_COOKIE = "remi-questionnaire-step";

/** The element a link of the end screen scrolls to, for each mandatory field. */
export const anchorOfField = {
  sexForCalculation: "questionnaire-sexForCalculation",
  heightCm: "questionnaire-heightCm",
  weightKg: "questionnaire-weightKg",
  activityLevel: "questionnaire-activityLevel",
  consultationReason: "questionnaire-consultationReason",
  consultationDate: "questionnaire-consultationDate",
  allergies: "questionnaire-allergy",
  intolerances: "questionnaire-intolerance",
} as const satisfies Record<MandatoryQuestionnaireField, string>;

/** True when the section asks at least one mandatory question. */
export const hasMandatoryField = (section: QuestionnaireSection) =>
  (Object.values(sectionOfField) as readonly QuestionnaireSection[]).includes(
    section,
  );

/**
 * The first section that holds a missing mandatory field. Identité when
 * nothing is missing.
 */
export const resumeSection = (
  missing: readonly MandatoryQuestionnaireField[],
): QuestionnaireSection =>
  questionnaireSections.find((section) =>
    missing.some((field) => sectionOfField[field] === section),
  ) ?? "identite";

/**
 * Where the questionnaire opens. The URL wins, then the last step the patient
 * looked at. With neither: a complete questionnaire opens on the end screen, a
 * questionnaire with no mandatory answer opens on the first step, and any
 * other opens on the first step that still misses a mandatory answer.
 */
export const startStep = (
  fromUrl: unknown,
  stored: unknown,
  missing: readonly MandatoryQuestionnaireField[],
): QuestionnaireStep => {
  if (isQuestionnaireStep(fromUrl)) {
    return fromUrl;
  }
  if (isQuestionnaireStep(stored)) {
    return stored;
  }
  if (missing.length === 0) {
    return END_STEP;
  }
  return missing.length === mandatoryQuestionnaireFields.length
    ? questionnaireSections[0]
    : resumeSection(missing);
};
