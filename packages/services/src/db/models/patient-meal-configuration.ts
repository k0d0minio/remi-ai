import type {
  MealFasting,
  MealOrientation,
} from "../../shared/meal-configuration";
import type { Entity, Id } from "../../types";

/**
 * The meal configuration of a patient file — REM-68 and REM-70, stories 11
 * and 12. One row for each patient. Each value is null until the practitioner
 * enters it: REMI enters none.
 *
 * `mealConfigurationOf` in the service gives the row as a `MealConfiguration`.
 * A reader uses that shape, not the columns.
 */
export type PatientMealConfiguration = Entity & {
  patientId: Id;
  breakfastEnabled: boolean | null;
  breakfastOrientation: MealOrientation | null;
  lunchEnabled: boolean | null;
  lunchOrientation: MealOrientation | null;
  snackEnabled: boolean | null;
  snackOrientation: MealOrientation | null;
  dinnerEnabled: boolean | null;
  dinnerOrientation: MealOrientation | null;
  fasting: MealFasting | null;
};
