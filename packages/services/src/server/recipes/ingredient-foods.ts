/**
 * The CIQUAL foods that the recipe form offers for an ingredient — REM-192.
 *
 * The form lets a practitioner choose any CIQUAL food: the nutrient values
 * exist for each one. The foods with a confirmed « cuisinable » record come
 * first, because they are the foods that the compatibility gate reads by
 * their record and that a generation can use. `cookable` says which is which:
 * it is a fact of the record, never a statement that the food is safe for a
 * patient (D-30).
 *
 * CIQUAL and the food records are reference data: the read has no actor and
 * no scope. The console action checks the session.
 */

import {
  confirmedKitchenUnits,
  listConfirmedCookableFoods,
  listFoodRecords,
} from "../../db/services/food-records";
import { getFoodsByCode, searchFoods } from "../../db/services/foods";
import type { Food } from "../../db/models/food";
import type { FoodRecord } from "../../db/models/food-record";
import {
  ingredientFoodQueries,
  type IngredientFood,
} from "../../shared/recipe-quantities";

/** The form shows a short list: a person refines the text to see more. */
const SEARCH_LIMIT = 12;

const ingredientFoodOf = (
  food: Food,
  record: FoodRecord | undefined,
  cookable: boolean,
): IngredientFood => ({
  code: food.code,
  name: food.nameFr,
  cookable,
  units: confirmedKitchenUnits(record ?? null),
});

/**
 * The CIQUAL foods for a typed text: the confirmed « cuisinable » foods first,
 * then each other food of the table, the short names first. The texts of
 * `ingredientFoodQueries` are tried in order, and the first one that finds a
 * food wins. An empty text gives an empty list.
 */
export const searchIngredientFoods = async (
  text: string,
): Promise<readonly IngredientFood[]> => {
  const queries = ingredientFoodQueries(text);
  if (queries.length === 0) {
    return [];
  }
  const [cookable, records] = await Promise.all([
    listConfirmedCookableFoods(),
    listFoodRecords(),
  ]);
  const cookableCodes = new Set(cookable.map(({ food }) => food.code));
  for (const query of queries) {
    const first = cookable
      .map(({ food }) => food)
      .filter((food) => food.searchName.includes(query))
      .sort((a, b) => a.nameFr.length - b.nameFr.length);
    const others = (
      await searchFoods({ query, limit: SEARCH_LIMIT + cookableCodes.size })
    ).filter((food) => !cookableCodes.has(food.code));
    const found = [...first, ...others].slice(0, SEARCH_LIMIT);
    if (found.length > 0) {
      return found.map((food) =>
        ingredientFoodOf(
          food,
          records.get(food.code),
          cookableCodes.has(food.code),
        ),
      );
    }
  }
  return [];
};

/**
 * The foods of the CIQUAL codes that a stored recipe names, for the form. A
 * code that CIQUAL does not have is left out: the form then shows the line
 * with no food.
 */
export const ingredientFoodsByCode = async (
  codes: readonly string[],
): Promise<readonly IngredientFood[]> => {
  const unique = [...new Set(codes)];
  if (unique.length === 0) {
    return [];
  }
  const [foods, cookable, records] = await Promise.all([
    getFoodsByCode(unique),
    listConfirmedCookableFoods(),
    listFoodRecords(),
  ]);
  const cookableCodes = new Set(cookable.map(({ food }) => food.code));
  return unique.flatMap((code) => {
    const food = foods.get(code);
    return food
      ? [ingredientFoodOf(food, records.get(code), cookableCodes.has(code))]
      : [];
  });
};
