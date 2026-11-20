import {
  computeRecipeNutrients,
  foodNutrientValuesOf,
  nutrientIngredientsOf,
  type FoodNutrientValues,
  type RecipeNutrients,
} from "../../../shared/recipe-nutrients";
import type { StructuredRecipe } from "../../../shared/structured-recipe";
import { getFood, getFoodNutrients } from "./index";

/**
 * The nutrients of a recipe, read from CIQUAL — REM-191.
 *
 * The service reads the CIQUAL rows of the foods of the recipe and gives them
 * to `computeRecipeNutrients`. It does no arithmetic of its own. CIQUAL is
 * reference data, not patient data: the read has no actor and no scope.
 */

/** One ingredient line as the calculation read it, for the practitioner. */
export type RecipeNutrientLine = {
  /** The food name of the recipe line. */
  name: string;
  /** The weight that the calculation used, or null when the line has none. */
  grams: number | null;
  /** The CIQUAL code of the line, or null. */
  foodCode: string | null;
  /**
   * The CIQUAL name of the food, which states the raw or cooked form. Null
   * when the line has no code, or when CIQUAL has no food with that code.
   */
  foodName: string | null;
};

export type RecipeNutrientEstimate = {
  nutrients: RecipeNutrients;
  /** One line for each ingredient, in the order of the recipe. */
  lines: readonly RecipeNutrientLine[];
};

/**
 * The energy and the macronutrients of a structured recipe, with the lines
 * that the calculation read. A component that cannot be computed is null.
 */
export const estimateRecipeNutrients = async (
  recipe: Pick<StructuredRecipe, "ingredients" | "portions">,
): Promise<RecipeNutrientEstimate> => {
  const ingredients = nutrientIngredientsOf(recipe);
  const codes = [
    ...new Set(
      ingredients.flatMap(({ foodCode }) =>
        foodCode === null ? [] : [foodCode],
      ),
    ),
  ];

  const foods = await Promise.all(
    codes.map(async (code) => {
      const [food, rows] = await Promise.all([
        getFood(code),
        getFoodNutrients(code),
      ]);
      return {
        code,
        name: food.ok ? food.data.nameFr : null,
        values: foodNutrientValuesOf(rows),
      };
    }),
  );

  // A code that CIQUAL does not know has no name. Its rows are not trusted.
  const values = new Map<string, FoodNutrientValues>(
    foods.flatMap((food) =>
      food.name === null ? [] : [[food.code, food.values] as const],
    ),
  );
  const names = new Map(foods.map((food) => [food.code, food.name]));

  return {
    nutrients: computeRecipeNutrients({
      ingredients,
      values,
      portions: recipe.portions,
    }),
    lines: recipe.ingredients.map((ingredient, index) => {
      const foodCode = ingredient.foodCode;
      return {
        name: ingredient.name,
        grams: ingredients[index]?.grams ?? null,
        foodCode,
        foodName: foodCode === null ? null : (names.get(foodCode) ?? null),
      };
    }),
  };
};
