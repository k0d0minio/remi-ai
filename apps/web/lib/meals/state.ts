import type {
  MealSuggestion,
  PlannedMealTextError,
} from "@remi/services/shared";

/**
 * The meal as the home page shows it after a save. Kept out of `actions.ts`:
 * a "use server" file exports only actions.
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
  | {
      status: "saved";
      meal: PlannedMeal;
      /**
       * REMI's answer (REM-102). Null when the patient's safety data could not
       * be read: the page then shows no answer, and the meal stays recorded.
       */
      suggestion: MealSuggestion | null;
    }
  | { status: "error"; error: PlanMealError };

export const initialPlanMealState: PlanMealState = { status: "idle" };
