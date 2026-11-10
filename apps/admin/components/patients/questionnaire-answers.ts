import type {
  PatientAllergen,
  PatientQuestionnaire,
} from "@remi/services/shared";
import {
  ALL_SUB_KEY,
  allergenLabels,
  allergenSubLabels,
  allSubKeyLabel,
  intoleranceLabels,
  noneKnownLabels,
} from "@remi/services/shared";

/** The questionnaire as the console reads it: the answers and the checked boxes. */
export type QuestionnaireView = {
  answers: PatientQuestionnaire;
  allergens: readonly PatientAllergen[];
};

/** One box as it reads: « Poissons : Saumon », « Autre : kiwi ». */
const boxLabel = (row: PatientAllergen) => {
  const labels: Record<string, { fr: string }> =
    row.kind === "allergy" ? allergenLabels : intoleranceLabels;
  const name = labels[row.key]?.fr ?? row.key;
  if (row.subKey === null) {
    return row.otherText ? `${name} : ${row.otherText}` : name;
  }
  const subLabels = allergenSubLabels[
    row.key as keyof typeof allergenSubLabels
  ] as Record<string, { fr: string }> | undefined;
  const sub =
    row.subKey === ALL_SUB_KEY
      ? allSubKeyLabel.fr
      : (subLabels?.[row.subKey]?.fr ?? row.subKey);
  return row.otherText
    ? `${name} : ${sub} (${row.otherText})`
    : `${name} : ${sub}`;
};

/** A list's answer as one line, or null when the list has no answer. */
export const listAnswer = (
  kind: "allergy" | "intolerance",
  questionnaire: QuestionnaireView,
) => {
  const noneKnown =
    kind === "allergy"
      ? questionnaire.answers.noKnownAllergies
      : questionnaire.answers.noKnownIntolerances;
  if (noneKnown === true) {
    return noneKnownLabels[kind].fr;
  }
  const boxes = questionnaire.allergens.filter((row) => row.kind === kind);
  return boxes.length > 0 ? boxes.map(boxLabel).join(", ") : null;
};
