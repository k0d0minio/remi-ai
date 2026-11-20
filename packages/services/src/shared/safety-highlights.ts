import {
  ALL_SUB_KEY,
  allergenLabels,
  allergens,
  allergenSubLabels,
  allergenSubLists,
  allSubKeyLabel,
  intoleranceLabels,
  intolerances,
  type QuestionnaireLabel,
} from "./questionnaire";

type Locale = keyof QuestionnaireLabel;

/** The part of a checked box that the highlight reads. */
export type SafetyBox = {
  kind: "allergy" | "intolerance";
  key: string;
  subKey: string | null;
  otherText: string | null;
};

/**
 * One list of the « Sécurité » block. `not_entered` is no answer at all.
 * `none_known` is the patient's own declaration. They are never the same
 * state (D-30): a missing answer is not a safe answer.
 */
export type SafetyList =
  | { state: "not_entered" }
  | { state: "none_known" }
  | { state: "listed"; items: string[] };

/** The line that coeliac disease adds: gluten is out, traces included. */
export const strictGlutenLabel: QuestionnaireLabel = {
  fr: "Gluten — exclusion stricte, contaminations croisées comprises (maladie cœliaque)",
  en: "Gluten — strict exclusion, cross-contamination included (coeliac disease)",
};

const position = (order: readonly string[], key: string) => {
  const index = order.indexOf(key);
  return index === -1 ? order.length : index;
};

const subLabel = (key: string, box: SafetyBox, locale: Locale) => {
  if (box.subKey === null) {
    return box.otherText;
  }
  if (box.subKey === ALL_SUB_KEY) {
    return allSubKeyLabel[locale].toLowerCase();
  }
  const labels = (
    allergenSubLabels as Record<
      string,
      Record<string, QuestionnaireLabel> | undefined
    >
  )[key];
  const label = labels?.[box.subKey]?.[locale] ?? box.subKey;
  return box.otherText ? `${label} (${box.otherText})` : label;
};

/**
 * The allergies or the intolerances as the « Sécurité » block reads them: one
 * item for each family, with its sub-choices after a dash, in the order of the
 * questionnaire. « Fruits à coque — tous », « Poissons — Saumon, Thon »,
 * « Autre — kiwi ».
 *
 * A checked box wins over the flag « aucune connue ». The service does not
 * store the two together. If the data has the two, the block shows the boxes:
 * the error that hides an allergy is the one that must not occur.
 */
export const safetyList = (
  kind: SafetyBox["kind"],
  noneKnown: boolean | null,
  boxes: readonly SafetyBox[],
  locale: Locale = "fr",
): SafetyList => {
  const checked = boxes.filter((box) => box.kind === kind);
  if (checked.length === 0) {
    return noneKnown === true
      ? { state: "none_known" }
      : { state: "not_entered" };
  }
  const families: readonly string[] =
    kind === "allergy" ? allergens : intolerances;
  const familyLabels: Record<string, QuestionnaireLabel | undefined> =
    kind === "allergy" ? allergenLabels : intoleranceLabels;
  const keys = [...new Set(checked.map((box) => box.key))].sort(
    (a, b) => position(families, a) - position(families, b),
  );
  const items = keys.map((key) => {
    const subOrder: readonly string[] =
      (allergenSubLists as Record<string, readonly string[] | undefined>)[
        key
      ] ?? [];
    const subs = checked
      .filter((box) => box.key === key)
      .sort(
        (a, b) =>
          position(subOrder, a.subKey ?? "") -
          position(subOrder, b.subKey ?? ""),
      )
      .map((box) => subLabel(key, box, locale))
      .filter((label): label is string => label !== null && label !== "");
    const name = familyLabels[key]?.[locale] ?? key;
    return subs.length > 0 ? `${name} — ${subs.join(", ")}` : name;
  });
  return { state: "listed", items };
};
