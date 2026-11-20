/**
 * The energy and the macronutrients of a recipe, from CIQUAL — REM-191.
 *
 * The calculation is code. A model never gives a nutrient value (plan of
 * `.icm/docs/research/recipe-generation.md`, section 9). The result is an
 * « estimation » in the sense of D-30, and a screen shows it with that word.
 *
 * One rule holds everywhere in this module: a total is whole or it is absent.
 * If one ingredient has no CIQUAL code, no weight in grams, or no CIQUAL
 * value for a component, the result for that component is null (« Non
 * calculé »). The module never returns a partial total.
 *
 * DEBT — raw or cooked form. The grams of an ingredient are read as the
 * weight of the food in the form that its CIQUAL code names: « Riz blanc,
 * cru » counts the grams as raw rice, « Riz blanc, cuit » as cooked rice. A
 * recipe gives the weight of a food as it is bought, thus the code of an
 * ingredient must name the raw form, or the water is counted twice. The code
 * does not check that the form of the code agrees with the form of the
 * weight, and it applies no yield factor and no retention factor. The console
 * shows the CIQUAL name of each food, so that the practitioner reads the form.
 * Vitamins and minerals are out of scope for the same reason: they need
 * retention factors.
 *
 * The module is isomorphic. It reads no table and no clock.
 */

import type { FoodNutrient } from "../db/models/food";
import { formatNumber } from "./format";
import type { RecipeIngredient, StructuredRecipe } from "./structured-recipe";

/* ───────────────────────── vocabulary ───────────────────────── */

export const recipeNutrientKeys = [
  "energy",
  "protein",
  "carbohydrate",
  "fat",
  "fibre",
] as const;

export type RecipeNutrientKey = (typeof recipeNutrientKeys)[number];

type RecipeNutrientSource = {
  /** The French text that the practitioner reads. */
  label: string;
  unit: "kcal" | "g";
  /**
   * The CIQUAL component codes that carry the value for 100 g, the preferred
   * one first. The codes are those of the Ciqual 2025 `const` file.
   */
  codes: readonly string[];
};

export const recipeNutrientSources: Readonly<
  Record<RecipeNutrientKey, RecipeNutrientSource>
> = {
  // 328 is the energy of Regulation (EU) No 1169/2011 in kcal. 333 is the
  // energy with the Jones factor in kcal: the fallback when 328 is absent.
  energy: { label: "Énergie", unit: "kcal", codes: ["328", "333"] },
  // The same two codes, in the same order, as `nutrientComponents`.
  protein: { label: "Protéines", unit: "g", codes: ["25000", "25003"] },
  carbohydrate: { label: "Glucides", unit: "g", codes: ["31000"] },
  fat: { label: "Lipides", unit: "g", codes: ["40000"] },
  fibre: { label: "Fibres", unit: "g", codes: ["34100"] },
};

/* ───────────────────────── input ───────────────────────── */

/**
 * One ingredient as the calculation reads it. This type is the contract of
 * the module: REM-190 (quantities in grams) and REM-192 (the extended recipe
 * structure) give this shape, and the calculation does not change.
 */
export type NutrientIngredient = {
  /** The CIQUAL code of the food, or null when the food is not matched. */
  foodCode: string | null;
  /** The weight in grams, or null when the weight is not known. */
  grams: number | null;
};

/** The values of one food for 100 g. Null or absent: CIQUAL has no value. */
export type FoodNutrientValues = Readonly<
  Partial<Record<RecipeNutrientKey, number | null>>
>;

/** The values of each food of a recipe, by CIQUAL code. */
export type CiqualValues = ReadonlyMap<string, FoodNutrientValues>;

export type RecipeNutrientsInput = {
  ingredients: readonly NutrientIngredient[];
  values: CiqualValues;
  /** The number of portions that the quantities are written for. */
  portions: number;
};

/* ───────────────────────── result ───────────────────────── */

export type NutrientAmount = {
  /** For the whole recipe. Not rounded: `formatRecipeNutrient` rounds. */
  recipe: number;
  /** For one portion. */
  portion: number;
};

/** One amount for each component, or null when it is not computed. */
export type RecipeNutrients = Readonly<
  Record<RecipeNutrientKey, NutrientAmount | null>
>;

const NOT_COMPUTED: RecipeNutrients = {
  energy: null,
  protein: null,
  carbohydrate: null,
  fat: null,
  fibre: null,
};

/* ───────────────────────── the calculation ───────────────────────── */

const isAmount = (value: number | null | undefined): value is number =>
  typeof value === "number" && Number.isFinite(value) && value >= 0;

const isWeight = (grams: number | null): grams is number =>
  typeof grams === "number" && Number.isFinite(grams) && grams > 0;

/**
 * The sum of one component over all the ingredients, or null when one
 * ingredient has no value for it.
 */
const componentTotal = (
  key: RecipeNutrientKey,
  ingredients: readonly NutrientIngredient[],
  values: CiqualValues,
): number | null => {
  let total = 0;
  for (const { foodCode, grams } of ingredients) {
    if (foodCode === null || !isWeight(grams)) {
      return null;
    }
    const per100g = values.get(foodCode)?.[key];
    if (!isAmount(per100g)) {
      return null;
    }
    total += (per100g * grams) / 100;
  }
  return total;
};

/**
 * The energy (kcal), protein, carbohydrate, fat and fibre (g) of a recipe,
 * for the recipe and for one portion.
 *
 * A component is null when the recipe has no ingredient, when the number of
 * portions is not valid, or when one ingredient has no code, no grams or no
 * CIQUAL value for that component.
 */
export const computeRecipeNutrients = ({
  ingredients,
  values,
  portions,
}: RecipeNutrientsInput): RecipeNutrients => {
  if (
    ingredients.length === 0 ||
    !Number.isFinite(portions) ||
    portions <= 0
  ) {
    return NOT_COMPUTED;
  }
  const amountOf = (key: RecipeNutrientKey): NutrientAmount | null => {
    const recipe = componentTotal(key, ingredients, values);
    return recipe === null ? null : { recipe, portion: recipe / portions };
  };
  return {
    energy: amountOf("energy"),
    protein: amountOf("protein"),
    carbohydrate: amountOf("carbohydrate"),
    fat: amountOf("fat"),
    fibre: amountOf("fibre"),
  };
};

/* ───────────────────────── CIQUAL rows ───────────────────────── */

type NutrientRow = Pick<FoodNutrient, "componentCode" | "value" | "marker">;

/**
 * The value that a sum can use, or null.
 *
 * `exact` is a measurement. `traces` is a quantity too small to quantify: it
 * counts as 0. `less_than` is an upper limit, not a quantity, and
 * `not_determined` is no value: the two give null, thus « Non calculé ».
 *
 * DEBT — `less_than`. About 7 % of the cells of the table are « < x ». To
 * count such a cell as x, as x / 2 or as 0 is a decision for Morgane. Until
 * she decides, a food with such a cell blocks the component.
 */
const usableValue = (row: NutrientRow): number | null => {
  if (row.marker === "traces") {
    return 0;
  }
  return row.marker === "exact" ? row.value : null;
};

/**
 * The CIQUAL rows of one food as the values of the calculation. For each
 * component, the first code of `recipeNutrientSources` that has a usable
 * value wins.
 */
export const foodNutrientValuesOf = (
  rows: readonly NutrientRow[],
): FoodNutrientValues => {
  const byCode = new Map(
    rows.map((row) => [row.componentCode, usableValue(row)]),
  );
  const valueOf = (key: RecipeNutrientKey): number | null => {
    for (const code of recipeNutrientSources[key].codes) {
      const value = byCode.get(code);
      if (isAmount(value)) {
        return value;
      }
    }
    return null;
  };
  return {
    energy: valueOf("energy"),
    protein: valueOf("protein"),
    carbohydrate: valueOf("carbohydrate"),
    fat: valueOf("fat"),
    fibre: valueOf("fibre"),
  };
};

/* ───────────────────────── today's recipe ───────────────────────── */

/**
 * The weight in grams of an ingredient line of today's structure, or null.
 *
 * Only « g » and « kg » are a weight. A volume, a count and a kitchen unit
 * (« c. à s. », « gousse », « 2 œufs ») have no weight here, thus such a line
 * makes the result « Non calculé ». REM-190 stores each quantity in grams:
 * that ticket changes this one function, and nothing else in the module.
 */
export const recipeIngredientGrams = ({
  quantity,
  unit,
}: Pick<RecipeIngredient, "quantity" | "unit">): number | null => {
  if (quantity === null) {
    return null;
  }
  if (unit === "g") {
    return quantity;
  }
  return unit === "kg" ? quantity * 1000 : null;
};

/** The ingredients of today's structured recipe as the calculation reads them. */
export const nutrientIngredientsOf = (
  recipe: Pick<StructuredRecipe, "ingredients">,
): NutrientIngredient[] =>
  recipe.ingredients.map((ingredient) => ({
    foodCode: ingredient.foodCode,
    grams: recipeIngredientGrams(ingredient),
  }));

/* ───────────────────────── text ───────────────────────── */

const NO_BREAK_SPACE = " ";

/**
 * An amount as the practitioner reads it: « 462 kcal », « 13,8 g ». Energy has
 * no decimal. A weight has one.
 */
export const formatRecipeNutrient = (
  key: RecipeNutrientKey,
  value: number,
): string => {
  const { unit } = recipeNutrientSources[key];
  const digits = unit === "kcal" ? 0 : 1;
  return `${formatNumber(value, undefined, digits)}${NO_BREAK_SPACE}${unit}`;
};
