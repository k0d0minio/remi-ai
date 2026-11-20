/**
 * The quantity of an ingredient line, between the text that a person types
 * and the weight in grams that REMI stores — REM-190 and REM-192.
 *
 * One rule: the stored quantity is a weight in grams. This module gives the
 * weight that a typed line means, when the confirmed units of the food make
 * it certain, and the text that a person reads for a stored weight. It is
 * pure: no table, no clock. It invents no weight (D-30).
 */

import {
  genericKitchenUnits,
  genericKitchenUnitTable,
  kitchenQuantityToGrams,
  toKitchenQuantity,
  type FoodKitchenUnits,
  type GenericKitchenUnit,
  type KitchenUnitRef,
} from "./kitchen-units";
import { normaliseNutritionText } from "./nutrition";
import { recipeIngredientAmount } from "./recipe-card";
import type {
  IngredientLink,
  RecipeIngredient,
  RecipeUnit,
} from "./structured-recipe";

/** The volume in millilitres of the units of a line that are a volume. */
const LINE_VOLUME_ML: Readonly<Partial<Record<RecipeUnit, number>>> = {
  ml: 1,
  cl: 10,
  l: 1000,
};

/** The units of a line that are a generic kitchen unit, with a fixed volume. */
const LINE_GENERIC: Readonly<Partial<Record<RecipeUnit, GenericKitchenUnit>>> =
  {
    tbsp: "tbsp",
    tsp: "tsp",
    pinch: "pinch",
    glass: "glass",
  };

/** One CIQUAL food as the recipe form offers it for an ingredient line. */
export type IngredientFood = {
  /** The CIQUAL code. */
  code: string;
  /** The CIQUAL name, which states the raw or cooked form. */
  name: string;
  /** True when a person confirmed the record of the food as « cuisinable ». */
  cookable: boolean;
  /** The kitchen units that a person confirmed, or null. */
  units: FoodKitchenUnits | null;
};

const roundGrams = (grams: number) => Math.round(grams * 10) / 10;

/**
 * The weight in grams that a typed line means, or null when the line does not
 * give one for certain.
 *
 * - « g » and « kg » are a weight.
 * - A volume (« ml », « cl », « l ») and a generic kitchen unit (« c. à s. »,
 *   « c. à c. », « pincée », « verre ») are a weight only with the confirmed
 *   density of the food.
 * - Each other line (« 2 œufs », « 1 gousse ») gives null: the person chooses
 *   the unit of the food and the form computes the weight.
 */
export const ingredientLineGrams = (
  { quantity, unit }: Pick<RecipeIngredient, "quantity" | "unit">,
  units: FoodKitchenUnits | null,
): number | null => {
  if (quantity === null || unit === null) {
    return null;
  }
  if (unit === "g") {
    return quantity;
  }
  if (unit === "kg") {
    return quantity * 1000;
  }
  const generic = LINE_GENERIC[unit];
  const ml =
    LINE_VOLUME_ML[unit] ??
    (generic === undefined ? undefined : genericKitchenUnitTable[generic].ml);
  const density = units?.densityGPerMl ?? null;
  if (ml === undefined || density === null || !(density > 0)) {
    return null;
  }
  return roundGrams(quantity * ml * density);
};

/* ───────────────────────── what a person enters in the form ───────────────────────── */

/**
 * The quantity that a person types for one ingredient in the recipe form: a
 * count, as typed, and the unit of the count. The unit is `g`, `own:<name>`
 * for a unit of the food (« own:œuf ») or `generic:<key>` for a spoon, a
 * glass, a cup or a pinch.
 */
export type IngredientEntry = { count: string; unit: string };

const GRAM_UNIT = "g";
const OWN_PREFIX = "own:";
const GENERIC_PREFIX = "generic:";

/**
 * The units that the form offers for a food: grams, then the confirmed units
 * of the food, then the generic units when the food has a confirmed density.
 * With no confirmed unit (`units` null) the list is grams alone.
 */
export const ingredientUnitOptions = (
  units: FoodKitchenUnits | null,
): { value: string; label: string }[] => [
  { value: GRAM_UNIT, label: "g" },
  ...(units?.units ?? []).map((unit) => ({
    value: `${OWN_PREFIX}${unit.one}`,
    label: unit.one,
  })),
  ...(units !== null && units.densityGPerMl !== null && units.densityGPerMl > 0
    ? genericKitchenUnits.map((key) => ({
        value: `${GENERIC_PREFIX}${key}`,
        label: genericKitchenUnitTable[key].one,
      }))
    : []),
];

const unitRefOf = (unit: string): KitchenUnitRef | null => {
  if (unit === GRAM_UNIT) {
    return { kind: "gram" };
  }
  if (unit.startsWith(OWN_PREFIX)) {
    return { kind: "own", one: unit.slice(OWN_PREFIX.length) };
  }
  const key = genericKitchenUnits.find(
    (generic) => unit === `${GENERIC_PREFIX}${generic}`,
  );
  return key === undefined ? null : { kind: "generic", unit: key };
};

/**
 * The weight in grams of a typed quantity, or null. A count that is not a
 * positive number, a unit that the food does not have and a spoon of a food
 * with no density give null: no weight is invented.
 */
export const ingredientEntryGrams = (
  entry: IngredientEntry,
  units: FoodKitchenUnits | null,
): number | null => {
  const text = entry.count.trim().replace(",", ".");
  const ref = unitRefOf(entry.unit);
  if (text === "" || ref === null) {
    return null;
  }
  const grams = kitchenQuantityToGrams(Number(text), ref, units);
  return grams === null ? null : roundGrams(grams);
};

/**
 * The quantity that the form proposes when a person chooses a food for a line
 * that is a count with no unit (« 2 œufs ») and the food has a unit of its
 * own: the count of the line, in the first unit of the food. The person sees
 * the weight that it gives and can change it. Null for each other line: the
 * weight comes from the text of the line, or the person types it.
 */
export const defaultIngredientEntry = (
  { quantity, unit }: Pick<RecipeIngredient, "quantity" | "unit">,
  units: FoodKitchenUnits | null,
): IngredientEntry | null => {
  const own = units?.units[0];
  return quantity !== null && unit === null && own
    ? {
        count: String(quantity).replace(".", ","),
        unit: `${OWN_PREFIX}${own.one}`,
      }
    : null;
};

/**
 * The food and the weight of one ingredient line, as the form posts them
 * (`linkIngredientFoods`). Null with no food. The typed quantity wins. With
 * none, the weight is the one that the text of the line gives for certain.
 */
export const ingredientLinkOf = (
  ingredient: Pick<RecipeIngredient, "quantity" | "unit">,
  food: Pick<IngredientFood, "code" | "units"> | undefined,
  entry: IngredientEntry | undefined,
): IngredientLink | null =>
  food === undefined
    ? null
    : {
        foodCode: food.code,
        grams: entry
          ? ingredientEntryGrams(entry, food.units)
          : ingredientLineGrams(ingredient, food.units),
      };

const sameWord = (a: string, b: string) =>
  normaliseNutritionText(a) === normaliseNutritionText(b);

/**
 * The quantity of an ingredient line as a person reads it in a kitchen.
 *
 * - A line with a stored weight shows through the kitchen units of its food:
 *   « 2 œufs », « 1 c. à soupe ». With no confirmed unit (`units` null) it
 *   shows in grams: « 150 g ».
 * - A line with no stored weight, of before REM-192, shows the quantity and
 *   the unit of its text, as before.
 *
 * When the unit of the food is the name of the line (« œufs » for the line
 * « œufs »), the amount is the count alone, so that the reader does not read
 * « 2 œufs œufs ».
 */
export const ingredientAmountText = (
  ingredient: Pick<RecipeIngredient, "quantity" | "unit" | "name" | "grams">,
  units: FoodKitchenUnits | null,
): string | null => {
  if (ingredient.grams === undefined) {
    return recipeIngredientAmount(ingredient);
  }
  const shown = toKitchenQuantity(ingredient.grams, units);
  if (shown === null) {
    return recipeIngredientAmount(ingredient);
  }
  if (shown.unit.kind === "own") {
    const { one } = shown.unit;
    const own = units?.units.find((unit) => unit.one === one);
    if (
      own &&
      (sameWord(own.one, ingredient.name) ||
        sameWord(own.many, ingredient.name))
    ) {
      return shown.text.slice(
        0,
        shown.text.length - (shown.count >= 2 ? own.many : own.one).length - 1,
      );
    }
  }
  return shown.text;
};

/**
 * The texts that the food search tries for an ingredient name, in order: the
 * whole name, then its first word, then that word with no plural mark.
 * « œufs frais » gives « oeufs frais », « oeufs », « oeuf ». CIQUAL names a
 * food in the singular, and a person types the plural.
 */
export const ingredientFoodQueries = (name: string): string[] => {
  const whole = normaliseNutritionText(name).trim();
  if (whole === "") {
    return [];
  }
  const first = whole.split(/\s+/u)[0] ?? "";
  const singular =
    first.length > 3 && /[sx]$/u.test(first) ? first.slice(0, -1) : first;
  return [...new Set([whole, first, singular])].filter((text) => text !== "");
};
