import type { PlannedMealTextError } from "@remi/services/shared";

/**
 * The meal as the home page shows it after a save. The suggestion of the next
 * ticket (`meal-improvement/meal-suggestion`) joins this type. Kept out of
 * `actions.ts`: a "use server" file exports only actions.
 */
export type PlannedMeal = {
  id: string;
  description: string;
};

export type PlanMealError =
  | PlannedMealTextError
  /** The patient reached the limit of meals for the day. */
  | "daily_limit"
  | "unavailable";

export type PlanMealState =
  | { status: "idle" }
  | { status: "saved"; meal: PlannedMeal }
  | { status: "error"; error: PlanMealError };

export const initialPlanMealState: PlanMealState = { status: "idle" };
