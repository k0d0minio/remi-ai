/**
 * The questionnaire block of the patient form, as names and as a parser. One
 * module for both, so the inputs the form renders and the fields the action
 * reads cannot drift apart. Isomorphic: it reads a `FormData` and nothing else,
 * so the client form imports the names and the server action the parser.
 *
 * It imports nothing from `@remi/services/server`, so the client form can
 * import it. The two answer shapes below match the service's `AllergenAnswer`
 * and `QuestionnaireInput` by structure, and the action passes them on as is.
 */

import type { QuestionnaireCompleteness } from "@remi/services/shared";

/** One checked box. The service's `AllergenSelection`. */
export type AllergenSelection = {
  key: string;
  subKey: string | null;
  otherText: string | null;
};

/** One list's answer. The service's `AllergenAnswer`. */
export type AllergenAnswer =
  | { state: "unanswered" }
  | { state: "none_known" }
  | { state: "declared"; items: AllergenSelection[] };

/** The answers a form posted, before the service checks them. */
export type QuestionnaireFormInput = Record<string, unknown>;

/** The three answers to one allergen list, as the form's radio posts them. */
export const allergenStates = ["unanswered", "none_known", "declared"] as const;

export type AllergenState = (typeof allergenStates)[number];

/** The list a name belongs to: `allergy` or `intolerance`. */
type Kind = "allergy" | "intolerance";

export const allergenNames = (kind: Kind) => ({
  /** The radio: one of `allergenStates`. */
  state: `${kind}State`,
  /** One checkbox per box: `key`, or `key/subKey` for a sub-list box. */
  item: `${kind}Item`,
  /** The « Autre » text of the box `key`, or of the sub-list of `key`. */
  other: (key: string) => `${kind}Other:${key}`,
});

/** The three genotype choices. Locked without the genetic consent. */
export const genotypeFields = ["apoe", "dio2", "amy1a"] as const;

const text = (formData: FormData, name: string) =>
  formData.has(name) ? String(formData.get(name) ?? "") : undefined;

/**
 * A choice among a few. The form posts `""` for an unanswered question, and
 * `""` clears the column. Anything else goes as is.
 */
const choice = text;

/** `""` clears the number. Anything else goes to the service as a number. */
const amount = (formData: FormData, name: string) => {
  const value = text(formData, name);
  if (value === undefined) {
    return undefined;
  }
  return value.trim() === "" ? "" : Number(value.replace(",", "."));
};

/** « Oui », « Non » or « Non renseigné ». */
const yesNo = (formData: FormData, name: string) => {
  const value = text(formData, name);
  if (value === undefined) {
    return undefined;
  }
  return value === "yes" ? true : value === "no" ? false : null;
};

/**
 * The answers the form posted. A field the form did not render is absent, so
 * the service leaves its column as it is. The genotype is read only when
 * `withGenotype` is true: the action decides that from the consent.
 */
export const questionnaireInputFrom = (
  formData: FormData,
  withGenotype: boolean,
): QuestionnaireFormInput => {
  const input: Record<string, unknown> = {
    sexForCalculation: choice(formData, "sexForCalculation"),
    activityLevel: choice(formData, "activityLevel"),
    desiredWeightKg: amount(formData, "desiredWeightKg"),
    consultationReason: text(formData, "consultationReason"),
    consultationDate: text(formData, "consultationDate"),
    diet: choice(formData, "diet"),
    dietNote: text(formData, "dietNote"),
    pathologies: text(formData, "pathologies"),
    celiacDisease: yesNo(formData, "celiacDisease"),
    geneticTest: choice(formData, "geneticTest"),
    practitionerQuestionAnswer: text(formData, "practitionerQuestionAnswer"),
  };
  if (withGenotype) {
    for (const field of genotypeFields) {
      input[field] = choice(formData, field);
    }
  }
  // An absent field stays absent: the service schema is strict about keys,
  // and `undefined` would read as a value.
  for (const [key, value] of Object.entries(input)) {
    if (value === undefined) {
      delete input[key];
    }
  }
  return input;
};

/** True when the form posted any genotype value, a cleared one included. */
export const postsGenotype = (formData: FormData) =>
  genotypeFields.some((field) => formData.has(field));

/**
 * One list's answer, or `undefined` when the form did not render the list.
 * A declared list with no box checked goes to the service as it is: the
 * service refuses it with its own message.
 */
export const allergenAnswerFrom = (
  formData: FormData,
  kind: Kind,
): AllergenAnswer | undefined => {
  const names = allergenNames(kind);
  const state = text(formData, names.state);
  if (state === undefined) {
    return undefined;
  }
  if (state === "none_known") {
    return { state: "none_known" };
  }
  if (state !== "declared") {
    return { state: "unanswered" };
  }
  const items: AllergenSelection[] = formData
    .getAll(names.item)
    .map((value) => {
      const [key = "", subKey] = String(value).split("/");
      const takesText = subKey === "other" || (key === "other" && !subKey);
      const otherText = takesText
        ? String(formData.get(names.other(key)) ?? "")
        : null;
      return { key, subKey: subKey ?? null, otherText };
    });
  return { state: "declared", items };
};

/** A number field as the completeness check reads it. Empty or no number is null. */
const filledNumber = (formData: FormData, name: string) => {
  const value = (text(formData, name) ?? "").trim().replace(",", ".");
  const parsed = Number(value);
  return value !== "" && Number.isFinite(parsed) ? parsed : null;
};

/**
 * What the form holds now, as `missingMandatoryFields` reads it. The form uses
 * it to show the missing mandatory answers before and after a save. The
 * service decides again on the stored file: this is the form's view only.
 */
export const completenessFrom = (
  formData: FormData,
): QuestionnaireCompleteness => {
  const list = (kind: Kind) => {
    const names = allergenNames(kind);
    const state = text(formData, names.state);
    return {
      noneKnown:
        state === "none_known" ? true : state === "declared" ? false : null,
      count: state === "declared" ? formData.getAll(names.item).length : 0,
    };
  };
  const allergy = list("allergy");
  const intolerance = list("intolerance");
  return {
    sexForCalculation: text(formData, "sexForCalculation") || null,
    heightCm: filledNumber(formData, "heightCm"),
    weightKg: filledNumber(formData, "weightKg"),
    activityLevel: text(formData, "activityLevel") || null,
    consultationReason: text(formData, "consultationReason") ?? null,
    consultationDate: text(formData, "consultationDate") || null,
    noKnownAllergies: allergy.noneKnown,
    noKnownIntolerances: intolerance.noneKnown,
    allergyCount: allergy.count,
    intoleranceCount: intolerance.count,
  };
};
