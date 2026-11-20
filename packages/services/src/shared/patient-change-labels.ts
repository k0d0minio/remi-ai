import { formatNumber } from "./format";
import type {
  PatientChangeValue,
  WatchedPatientField,
} from "./patient-changes";
import {
  ALL_SUB_KEY,
  activityLevelDetails,
  allergenLabels,
  allergenSubLabels,
  allSubKeyLabel,
  dietLabels,
  geneticTestAnswerLabels,
  intoleranceLabels,
  mandatoryQuestionnaireFieldLabels,
  optionalQuestionnaireFieldLabels,
  type QuestionnaireLabel,
} from "./questionnaire";

/**
 * How the console shows a patient change (story 21): the field in French, and
 * the old and the new value as the practitioner reads them. `patient_changes`
 * stores the stored value, never a label, so the reader formats it here.
 *
 * Isomorphic and pure: no I/O. The labels are the questionnaire's own, so a
 * field reads the same in the form and in the signal.
 */

/** The field's name: the questionnaire's label of the same key. */
export const watchedPatientFieldLabels = {
  heightCm: mandatoryQuestionnaireFieldLabels.heightCm,
  weightKg: mandatoryQuestionnaireFieldLabels.weightKg,
  desiredWeightKg: optionalQuestionnaireFieldLabels.desiredWeightKg,
  activityLevel: mandatoryQuestionnaireFieldLabels.activityLevel,
  diet: optionalQuestionnaireFieldLabels.diet,
  dietNote: optionalQuestionnaireFieldLabels.dietNote,
  medications: optionalQuestionnaireFieldLabels.medications,
  supplements: optionalQuestionnaireFieldLabels.supplements,
  geneticTest: optionalQuestionnaireFieldLabels.geneticTest,
  apoe: optionalQuestionnaireFieldLabels.apoe,
  dio2: optionalQuestionnaireFieldLabels.dio2,
  amy1a: optionalQuestionnaireFieldLabels.amy1a,
  allergies: mandatoryQuestionnaireFieldLabels.allergies,
  intolerances: mandatoryQuestionnaireFieldLabels.intolerances,
} as const satisfies Record<WatchedPatientField, QuestionnaireLabel>;

/**
 * The fields whose change touches food safety: an allergy, an intolerance or
 * the diet (story 30). The console shows their signals first, apart from the
 * others.
 */
export const safetyPatientFields = [
  "allergies",
  "intolerances",
  "diet",
  "dietNote",
] as const satisfies readonly WatchedPatientField[];

export const isSafetyPatientField = (field: WatchedPatientField) =>
  (safetyPatientFields as readonly WatchedPatientField[]).includes(field);

type LabelMap = Readonly<Record<string, QuestionnaireLabel>>;

const labelOf = (labels: LabelMap, key: string): string | null =>
  Object.hasOwn(labels, key) ? (labels[key]?.fr ?? null) : null;

/**
 * One entry of an allergy or intolerance list. The stored form is `key`,
 * `key/subKey`, and the « Autre » text after a colon. An entry that is not of
 * this form shows as it is stored: an unknown key never shows as a known one.
 */
const listEntryLabel = (
  field: "allergies" | "intolerances",
  entry: string,
): string => {
  const separator = entry.indexOf(": ");
  const name = separator === -1 ? entry : entry.slice(0, separator);
  const otherText = separator === -1 ? "" : entry.slice(separator + 2).trim();
  const [key = "", subKey] = name.split("/");
  const label = labelOf(
    field === "allergies" ? allergenLabels : intoleranceLabels,
    key,
  );
  if (label === null) {
    return entry;
  }
  const subLabels: LabelMap | undefined =
    field === "allergies" && Object.hasOwn(allergenSubLabels, key)
      ? (allergenSubLabels as Readonly<Record<string, LabelMap>>)[key]
      : undefined;
  const detail = !subKey
    ? ""
    : subKey === ALL_SUB_KEY
      ? allSubKeyLabel.fr.toLowerCase()
      : ((subLabels ? labelOf(subLabels, subKey) : null) ?? subKey);
  const named = detail ? `${label} (${detail})` : label;
  return otherText ? `${named} : ${otherText}` : named;
};

/**
 * The value as the practitioner reads it, or `null` for an empty answer. The
 * caller writes the words of the empty state.
 */
export const patientChangeValueLabel = (
  field: WatchedPatientField,
  value: PatientChangeValue,
): string | null => {
  if (value === null) {
    return null;
  }
  if (typeof value === "boolean") {
    return value ? "Oui" : "Non";
  }
  if (typeof value === "number") {
    const number = formatNumber(value, "fr-BE");
    if (field === "heightCm") {
      return `${number} cm`;
    }
    if (field === "weightKg" || field === "desiredWeightKg") {
      return `${number} kg`;
    }
    return number;
  }
  if (typeof value === "string") {
    if (field === "activityLevel") {
      return Object.hasOwn(activityLevelDetails, value)
        ? activityLevelDetails[value as keyof typeof activityLevelDetails].label
            .fr
        : value;
    }
    if (field === "diet") {
      return labelOf(dietLabels, value) ?? value;
    }
    if (field === "geneticTest") {
      return labelOf(geneticTestAnswerLabels, value) ?? value;
    }
    return value;
  }
  if (value.length === 0) {
    return null;
  }
  if (field === "allergies" || field === "intolerances") {
    return value.map((entry) => listEntryLabel(field, entry)).join(", ");
  }
  return value.join(", ");
};

/**
 * The order of the signals in the console: the safety fields first, then the
 * newest change first.
 */
export const comparePatientChangesForReview = (
  a: { fieldKey: WatchedPatientField; changedAt: Date },
  b: { fieldKey: WatchedPatientField; changedAt: Date },
): number => {
  const safety =
    Number(isSafetyPatientField(b.fieldKey)) -
    Number(isSafetyPatientField(a.fieldKey));
  return safety || b.changedAt.getTime() - a.changedAt.getTime();
};
