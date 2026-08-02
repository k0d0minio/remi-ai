import type { Entity, Id } from "../../types";

export type MealSlot = "breakfast" | "lunch" | "dinner" | "snack";

export type MealStatus = "suggested" | "accepted" | "cooked" | "skipped";

/**
 * A recipe placed in a person's week. The separation from `Recipe` is what lets
 * the same recipe be suggested to many people while each keeps their own record
 * of whether they actually cooked it — which is the signal the practitioner sees.
 */
export type Meal = Entity & {
  personId: Id;
  planId: Id;
  recipeId: Id;
  slot: MealSlot;
  servedOn: Date;
  status: MealStatus;
};
