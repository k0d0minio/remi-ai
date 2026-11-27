import type {
  FileStatus,
  MandatoryQuestionnaireField,
} from "@remi/services/shared";

/**
 * The answers the questionnaire saves one at a time. The first eight are
 * profile columns (`savePatientProfileAnswers`), the rest questionnaire
 * columns (`savePatientQuestionnaire`). The two lists and the diet save
 * through their own actions. Kept out of `actions.ts`: a "use server" file
 * exports only actions.
 */
export const answerFields = [
  "firstName",
  "lastName",
  "birthDate",
  "phone",
  "heightCm",
  "weightKg",
  "medications",
  "supplements",
  "sexForCalculation",
  "activityLevel",
  "desiredWeightKg",
  "consultationReason",
  "consultationDate",
  "practitionerQuestionAnswer",
  "pathologies",
  "geneticTest",
  "apoe",
  "dio2",
  "amy1a",
] as const;

export type AnswerField = (typeof answerFields)[number];

export type SaveError =
  | "required"
  | "invalid"
  | "phone"
  | "height_range"
  | "weight_range"
  | "consent"
  | "genetic_consent"
  | "signed_out"
  | "unavailable"
  | "minor"
  | "before_today";

/**
 * A save's answer. On success it carries the file's status and the missing
 * mandatory fields after the write, so the header follows each change.
 */
/** The patient's answer on the genetic consent screen. */
export type GeneticConsentDecision = "given" | "refused";

/** A consent decision's answer: the decision now in force, or why it failed. */
export type GeneticConsentResult =
  | { ok: true; decision: GeneticConsentDecision }
  | { ok: false; error: "signed_out" | "unavailable" };

export type SaveResult =
  | {
      ok: true;
      status: FileStatus;
      missing: MandatoryQuestionnaireField[];
    }
  | { ok: false; error: SaveError };
