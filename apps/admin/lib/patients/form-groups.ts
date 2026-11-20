/**
 * The groups of the patient form, in the order the form shows them. The first
 * six are the sections of the patient's questionnaire, from
 * `shared/questionnaire.ts`: the two sides keep one structure. The last two
 * hold the fields that only the console has.
 *
 * Isomorphic and pure: it reads names and a `FormData`, nothing else.
 */

import {
  questionnaireSections,
  type QuestionnaireSection,
} from "@remi/services/shared";
import { allergenNames } from "@/lib/patients/questionnaire-form";

/** The groups after the questionnaire's six. */
export const consoleGroups = ["dossier", "suivi"] as const;

export type FormGroupKey = QuestionnaireSection | (typeof consoleGroups)[number];

export const formGroupKeys: readonly FormGroupKey[] = [
  ...questionnaireSections,
  ...consoleGroups,
];

/** The console's own titles. The patient's pages have theirs. */
export const formGroupTitles: Record<FormGroupKey, string> = {
  identite: "Identité",
  profil: "Profil",
  consultation: "Consultation",
  alimentation: "Alimentation",
  sante: "Santé",
  genetique: "Génétique",
  dossier: "Dossier dans la console",
  suivi: "Suivi en consultation",
};

/** The `id` of a group's section. The index links to it. */
export const groupAnchor = (key: FormGroupKey) => `groupe-${key}`;

/** The form field names of each group. The two allergen lists go by prefix. */
const fieldsOfGroup: Record<FormGroupKey, readonly string[]> = {
  identite: ["firstName", "lastName", "birthDate", "email", "phone"],
  profil: [
    "sexForCalculation",
    "heightCm",
    "weightKg",
    "activityLevel",
    "desiredWeightKg",
  ],
  consultation: ["consultationReason", "consultationDate"],
  alimentation: ["diet", "dietNote"],
  sante: ["celiacDisease", "pathologies", "medications", "supplements"],
  genetique: ["geneticTest", "apoe", "dio2", "amy1a"],
  dossier: ["pseudonym", "locale", "sex", "status"],
  suivi: [
    "practitionerQuestionAnswer",
    "referral",
    "constraints",
    "preferences",
    "likesCooking",
    "cookingTime",
    "foodBudget",
    "anamnesis",
  ],
};

const allergenPrefixes = (["allergy", "intolerance"] as const).flatMap(
  (kind) => {
    const names = allergenNames(kind);
    return [names.state, names.item, names.other("")];
  },
);

/** The group that shows a form field, or null for a name no group holds. */
export const groupOfField = (name: string): FormGroupKey | null => {
  if (allergenPrefixes.some((prefix) => name.startsWith(prefix))) {
    return "alimentation";
  }
  return (
    formGroupKeys.find((key) => fieldsOfGroup[key].includes(name)) ?? null
  );
};

/** What a form posts, as one text for each name. */
export type FormSnapshot = Readonly<Record<string, string>>;

/** A name with many values, such as the allergen boxes, joins them in order. */
export const snapshotOf = (formData: FormData): FormSnapshot => {
  const values: Record<string, string[]> = {};
  for (const [name, value] of formData.entries()) {
    if (typeof value === "string") {
      values[name] = [...(values[name] ?? []), value];
    }
  }
  return Object.fromEntries(
    Object.entries(values).map(([name, list]) => [
      name,
      [...list].sort().join("\n"),
    ]),
  );
};

/**
 * The groups that hold a difference between two posts, in the form's order.
 * A name that only one post has counts as a difference.
 */
export const changedGroups = (
  before: FormSnapshot,
  after: FormSnapshot,
): FormGroupKey[] => {
  const names = new Set([...Object.keys(before), ...Object.keys(after)]);
  const changed = new Set<FormGroupKey>();
  for (const name of names) {
    if (before[name] !== after[name]) {
      const group = groupOfField(name);
      if (group) {
        changed.add(group);
      }
    }
  }
  return formGroupKeys.filter((key) => changed.has(key));
};
