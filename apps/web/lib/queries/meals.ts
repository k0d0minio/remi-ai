import type { Id, Ingredient, Meal, Recipe } from "@remi/services/shared";
import { meals, recipes } from "@/lib/fixtures/meals";

/**
 * A meal in the week together with the recipe it points at. `Meal` and `Recipe`
 * are separate models so one recipe can be suggested to many people while each
 * keeps their own record of it — but no screen wants half the pair, so the join
 * happens once, here.
 */
export type PlannedMeal = {
  meal: Meal;
  recipe: Recipe;
};

export type ShoppingGroup = {
  aisle: string;
  items: readonly Ingredient[];
};

/** Reads for the person's surface. See the note in `./clients.ts`. */
export const listPlannedMeals = async (planId: Id): Promise<PlannedMeal[]> =>
  meals
    .filter((meal) => meal.planId === planId)
    .sort((a, b) => a.servedOn.getTime() - b.servedOn.getTime())
    .flatMap((meal) => {
      const recipe = recipes.find(
        (candidate) => candidate.id === meal.recipeId,
      );
      return recipe ? [{ meal, recipe }] : [];
    });

/** "200 g" → 200 and "g". Free text ("a few sprigs") returns null. */
const parseQuantity = (quantity: string) => {
  const match = /^(\d+(?:[.,]\d+)?)\s*(.*)$/.exec(quantity.trim());

  if (!match) {
    return null;
  }

  return {
    amount: Number(match[1].replace(",", ".")),
    unit: match[2].trim(),
  };
};

/**
 * Adds up the same ingredient across recipes when the units agree, and falls
 * back to listing them side by side when they do not — guessing that "a few
 * sprigs" plus "2 tbsp" is some third thing would put a wrong number on a
 * shopping list, which is worse than a slightly long one.
 */
const mergeQuantities = (quantities: readonly string[]): string => {
  const parsed = quantities.map(parseQuantity);
  const unit = parsed[0]?.unit;

  if (
    unit === undefined ||
    parsed.some((entry) => entry === null || entry.unit !== unit)
  ) {
    return quantities.join(" + ");
  }

  const total = parsed.reduce(
    (sum, entry) => sum + (entry === null ? 0 : entry.amount),
    0,
  );

  return `${total} ${unit}`.trim();
};

/**
 * Derived from the week's recipes rather than stored alongside them. A written
 * list is a second source of truth: change a recipe and the two disagree, and
 * the person finds out at the shop.
 */
export const getShoppingList = async (planId: Id): Promise<ShoppingGroup[]> => {
  const planned = await listPlannedMeals(planId);
  // Insertion order is the output order — aisles and items come out in the
  // order the week's recipes first mention them.
  const aisles = new Map<string, Map<string, string[]>>();

  for (const { recipe } of planned) {
    for (const ingredient of recipe.ingredients) {
      const byName =
        aisles.get(ingredient.aisle) ?? new Map<string, string[]>();
      byName.set(ingredient.name, [
        ...(byName.get(ingredient.name) ?? []),
        ingredient.quantity,
      ]);
      aisles.set(ingredient.aisle, byName);
    }
  }

  return [...aisles].map(([aisle, byName]) => ({
    aisle,
    items: [...byName].map(([name, quantities]) => ({
      name,
      quantity: mergeQuantities(quantities),
      aisle,
    })),
  }));
};
