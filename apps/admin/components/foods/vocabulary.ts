import { allergenLabels, allergenSubLabels } from "@remi/services/shared";

/**
 * The French words of a food record, in one place: a status and a tag must
 * read the same on the list, in the queue and on the page of a food.
 *
 * The tags themselves come from the compatibility gate (`gateTags()`). This
 * file only names them.
 */

const otherFamilyLabels: Record<string, string> = {
  lactose: "Lactose",
  meat: "Viande",
  honey: "Miel",
  carb: "Riche en glucides (exclu en alimentation cétogène)",
  alcohol: "Alcool",
};

const meatLabels: Record<string, string> = {
  beef: "Bœuf",
  chicken: "Poulet",
  duck: "Canard",
  lamb: "Agneau",
  pork: "Porc",
  rabbit: "Lapin",
  turkey: "Dinde",
  veal: "Veau",
};

const own = <Value>(record: Record<string, Value>, key: string) =>
  Object.hasOwn(record, key) ? record[key] : undefined;

const familyLabel = (family: string) =>
  own(allergenLabels as Record<string, { fr: string }>, family)?.fr ??
  own(otherFamilyLabels, family) ??
  family;

const subLabel = (family: string, sub: string) => {
  const subLabels: Record<string, { fr: string }> | undefined = own(
    allergenSubLabels as Record<string, Record<string, { fr: string }>>,
    family,
  );
  const allergenSub = subLabels ? own(subLabels, sub)?.fr : undefined;
  const meat = family === "meat" ? own(meatLabels, sub) : undefined;
  return allergenSub ?? meat ?? sub;
};

/** « Fruits à coque », or « Fruits à coque : amande ». */
export const tagLabel = (tag: string) => {
  const [family = "", sub] = tag.split(":");
  return sub === undefined
    ? familyLabel(family)
    : `${familyLabel(family)} : ${subLabel(family, sub).toLowerCase()}`;
};

export type TagGroup = {
  family: string;
  label: string;
  /** The tag of the whole family first, then its sub-keys. */
  tags: readonly { tag: string; label: string }[];
};

/** The tags of the gate, one group for each family, in the gate's order. */
export const tagGroups = (tags: readonly string[]): TagGroup[] => {
  const groups = new Map<string, { tag: string; label: string }[]>();
  for (const tag of tags) {
    const [family = "", sub] = tag.split(":");
    const group = groups.get(family) ?? [];
    groups.set(family, group);
    group.push({
      tag,
      label:
        sub === undefined
          ? "Toute la famille, ou espèce inconnue"
          : subLabel(family, sub),
    });
  }
  return [...groups.entries()].map(([family, entries]) => ({
    family,
    label: familyLabel(family),
    tags: entries,
  }));
};

export const NO_AI_MESSAGE =
  "REMI ne peut rien proposer : la passerelle d'IA n'est pas configurée sur cet environnement.";
