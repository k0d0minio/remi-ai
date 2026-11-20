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
      /**
       * The ticket of the one second suggestion (REM-103). The server signs
       * it, and the page sends it back with « Une autre suggestion ». Null
       * when the answer shows no improvement.
       */
      retry: string | null;
    }
  | { status: "error"; error: PlanMealError };

/**
 * The result of « Une autre suggestion » (REM-103). `none`: the server gave no
 * second answer. The ticket was used, it is not valid, or a read failed.
 */
export type AnotherSuggestionState =
  | { status: "answered"; suggestion: MealSuggestion }
  | { status: "none" };

export const initialPlanMealState: PlanMealState = { status: "idle" };
