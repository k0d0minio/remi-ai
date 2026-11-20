/**
 * The recipe page of the patient — REM-94, story 25, decisions D-26 and D-30.
 *
 * The shape that the page reads, and the small texts that it writes from a
 * structured recipe. The module is isomorphic: it reads no table and no clock.
 *
 * A `PatientRecipeCard` exists only for a recipe that the compatibility gate
 * confirmed for this patient (`server/recipes/patient-recipes`). No other code
 * builds one for a page.
 */

import type { Id } from "../types";
import {
  formatRecipeMinutes,
  formatRecipeQuantity,
  recipeTotalMinutes,
  recipeUnitLabels,
  type RecipeIngredient,
  type RecipeStep,
  type StructuredRecipe,
} from "./structured-recipe";

/**
 * Where the recipe comes from: `remi` is a recipe that REMI generated for the
 * patient, `practitioner` is a recipe of the library that the practitioner
 * gave by hand.
 */
export type PatientRecipeSource = "remi" | "practitioner";

export type PatientRecipeCard = {
  /** The id in the address: the generated recipe's, or the assignment's. */
  id: Id;
  source: PatientRecipeSource;
  title: string;
  content: StructuredRecipe;
  /** Why this recipe for this patient. Empty when the recipe has none. */
  justification: string;
};

/** One line of the list of « Recettes ». */
export type PatientRecipeSummary = {
  id: Id;
  source: PatientRecipeSource;
  title: string;
  description: string;
  /** Preparation and cooking together, or null when both are unknown. */
  totalMinutes: number | null;
};

export const recipeSummaryOf = (
  card: PatientRecipeCard,
): PatientRecipeSummary => ({
  id: card.id,
  source: card.source,
  title: card.title,
  description: card.content.description,
  totalMinutes: recipeTotalMinutes(card.content),
});

/**
 * The quantity and the unit of an ingredient line: « 200 g », « 1/2 c. à s. »,
 * « 2 ». Null when the recipe gives no quantity (« sel »).
 */
export const recipeIngredientAmount = (
  ingredient: Pick<RecipeIngredient, "quantity" | "unit">,
): string | null => {
  if (ingredient.quantity === null) {
    return null;
  }
  const quantity = formatRecipeQuantity(ingredient.quantity);
  if (ingredient.unit === null) {
    return quantity;
  }
  const labels = recipeUnitLabels[ingredient.unit];
  return `${quantity} ${ingredient.quantity >= 2 ? labels.many : labels.one}`;
};

/**
 * The temperature and the duration of a step, in that order: « 180 °C »,
 * « 20 min ». Empty when the step has none. A value that the recipe does not
 * give is never written (D-30).
 */
export const recipeStepDetails = (
  step: Pick<RecipeStep, "temperatureC" | "durationMinutes">,
): string[] => [
  ...(step.temperatureC === null ? [] : [`${step.temperatureC} °C`]),
  ...(step.durationMinutes === null
    ? []
    : [formatRecipeMinutes(step.durationMinutes)]),
];
