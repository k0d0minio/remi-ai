import type {
  FileStatus,
  MandatoryQuestionnaireField,
} from "@remi/services/shared";

/**
 * The answers the questionnaire saves one at a time. The first eight are
 * profile columns (`savePatientProfileAnswers`), the rest questionnaire
 * columns (`savePatientQuestionnaire`). The two lists save through their own
 * action. Kept out of `actions.ts`: a "use server" file exports only actions.
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
  "diet",
  "dietNote",
  "pathologies",
  "celiacDisease",
  "geneticTest",
] as const;

export type AnswerField = (typeof answerFields)[number];

export type SaveError =
  | "required"
  | "invalid"
  | "height_range"
  | "weight_range"
  | "consent"
  | "signed_out"
  | "unavailable";

/**
 * A save's answer. On success it carries the file's status and the missing
 * mandatory fields after the write, so the header follows each change.
 */
export type SaveResult =
  | {
      ok: true;
      status: FileStatus;
      missing: MandatoryQuestionnaireField[];
    }
  | { ok: false; error: SaveError };
