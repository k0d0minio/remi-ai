import type { Entity } from "../../types";

export type Ingredient = {
  name: string;
  quantity: string;
  /** Groups the shopping list the way a shop is laid out, not the way a recipe is. */
  aisle: string;
};

export type Recipe = Entity & {
  title: string;
  summary: string;
  minutes: number;
  servings: number;
  ingredients: readonly Ingredient[];
  method: readonly string[];
  /**
   * Which of the practitioner's recommendations this recipe honours, in plain
   * words. It is what lets a person see that a suggestion came from their own
   * consultation rather than from nowhere.
   */
  honours: readonly string[];
};
