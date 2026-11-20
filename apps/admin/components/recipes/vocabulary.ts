import {
  formatRecipeQuantity,
  recipeUnitLabels,
  type RecipeIngredient,
} from "@remi/services/shared";

/** A cell with no value, in each table of the recipe library. */
const NO_VALUE = "—";

/** The quantity of an ingredient line, or a dash when the line gives none. */
export const quantityText = (ingredient: RecipeIngredient) =>
  ingredient.quantity === null
    ? NO_VALUE
    : formatRecipeQuantity(ingredient.quantity);

/** The unit of an ingredient line, in the singular or the plural. */
export const unitText = (ingredient: RecipeIngredient) => {
  if (ingredient.unit === null || ingredient.quantity === null) {
    return NO_VALUE;
  }
  const labels = recipeUnitLabels[ingredient.unit];
  return ingredient.quantity >= 2 ? labels.many : labels.one;
};
