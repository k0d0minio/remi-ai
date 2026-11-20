/**
 * The boxes of the two allergen lists, as the patient's questionnaire and the
 * console's form show them (REM-163, REM-164). The stored rows keep their
 * shape, `key` and `subKey` of `patient_allergens`: this module changes what a
 * box is, never what a row is.
 *
 * A wheat allergy is not a gluten restriction (REM-164). So the family
 * `gluten` shows no box of its own in the allergy list. Each cereal of its
 * sub-list is a box: « Blé » stores `gluten/wheat`, as before.
 *
 * A stored row that no box holds is never dropped and never hidden
 * (`uncategorisedAllergenRows`): the forms show it as declared, and a save
 * sends it again as it is.
 *
 * Isomorphic and pure: no I/O.
 */

import {
  ALL_SUB_KEY,
  allergenLabels,
  allergens,
  allergenSubLabels,
  allergenSubLists,
  intoleranceDescriptions,
  intoleranceLabels,
  intolerances,
  type QuestionnaireLabel,
} from "./questionnaire";
import { safetyList } from "./safety-highlights";

type Kind = "allergy" | "intolerance";

type LabelMap = Readonly<Record<string, QuestionnaireLabel | undefined>>;

/** The part of a stored row that this module reads. */
type Row = { key: string; subKey: string | null };

export type AllergenOption = {
  /** `key`, or `key/subKey` for a member of a split family. Unique in its list. */
  id: string;
  key: string;
  /** Set when the box is one member of a family: the row is `key/subKey`. */
  subKey: string | null;
  label: QuestionnaireLabel;
  /** A short explanation under the label, or null. */
  description: QuestionnaireLabel | null;
  /** The sub-list that opens under the box, without « Tous ». Empty for none. */
  subList: readonly { key: string; label: QuestionnaireLabel }[];
};

/** The families whose members are separate boxes, with no box of their own. */
const splitFamilies: readonly string[] = ["gluten"];

const subKeysOf = (key: string): readonly string[] =>
  (allergenSubLists as Readonly<Record<string, readonly string[] | undefined>>)[
    key
  ] ?? [];

const subLabelsOf = (key: string): LabelMap =>
  (allergenSubLabels as Readonly<Record<string, LabelMap | undefined>>)[key] ??
  {};

const subListOf = (key: string): AllergenOption["subList"] =>
  subKeysOf(key).map((subKey) => ({
    key: subKey,
    label: subLabelsOf(key)[subKey] ?? { fr: subKey },
  }));

const allergyOptions: readonly AllergenOption[] = allergens.flatMap(
  (key): AllergenOption[] =>
    splitFamilies.includes(key)
      ? subListOf(key).map((sub) => ({
          id: `${key}/${sub.key}`,
          key,
          subKey: sub.key,
          label: sub.label,
          description: null,
          subList: [],
        }))
      : [
          {
            id: key,
            key,
            subKey: null,
            label: allergenLabels[key],
            description: null,
            subList: subListOf(key),
          },
        ],
);

const intoleranceOptions: readonly AllergenOption[] = intolerances.map(
  (key) => ({
    id: key,
    key,
    subKey: null,
    label: intoleranceLabels[key],
    description: (intoleranceDescriptions as LabelMap)[key] ?? null,
    subList: [],
  }),
);

/** The boxes of one list, in the order the forms show them. « Autre » is last. */
export const allergenOptions = (kind: Kind): readonly AllergenOption[] =>
  kind === "allergy" ? allergyOptions : intoleranceOptions;

/**
 * The box that holds a stored row, or null when no box does. A family box
 * holds its bare row, its « Tous » row and the rows of its sub-list. A member
 * box holds its one row.
 */
export const allergenOptionOfRow = (
  kind: Kind,
  row: Row,
): AllergenOption | null =>
  allergenOptions(kind).find((option) => {
    if (option.key !== row.key) {
      return false;
    }
    if (option.subKey !== null) {
      return option.subKey === row.subKey;
    }
    if (row.subKey === null) {
      return true;
    }
    return (
      option.subList.length > 0 &&
      (row.subKey === ALL_SUB_KEY ||
        option.subList.some((sub) => sub.key === row.subKey))
    );
  }) ?? null;

/**
 * The stored rows that no box holds, in their order: the whole family
 * `gluten` of before REM-164, or a key that left the lists. A form shows each
 * one as declared.
 */
export const uncategorisedAllergenRows = <T extends Row>(
  kind: Kind,
  rows: readonly T[],
): T[] => rows.filter((row) => allergenOptionOfRow(kind, row) === null);

/**
 * One stored row as a person reads it: « Céréales contenant du gluten —
 * tous », « Poissons — Saumon ». The words of the « Sécurité » block, so a
 * row reads the same in all places. An unknown key shows as stored.
 */
export const allergenRowLabel = (
  kind: Kind,
  row: Row & { otherText: string | null },
): string => {
  const list = safetyList(kind, false, [{ ...row, kind }]);
  return list.state === "listed" ? (list.items[0] ?? row.key) : row.key;
};
