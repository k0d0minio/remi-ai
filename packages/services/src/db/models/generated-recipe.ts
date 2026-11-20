import type { MealSlot } from "../../shared/meal-configuration";
import type { StructuredRecipe } from "../../shared/structured-recipe";
import type { Entity, Id } from "../../types";

/**
 * One recipe that REMI generated for one patient — REM-90, story 24. A row of
 * `patient_recipes`. It is patient data: it goes with the patient.
 *
 * A patient has one recipe at most for one day and one meal. That pair is the
 * weekly plan: there is no separate plan table.
 *
 * It is not a `RecipeAssignment`: an assignment is a library recipe that the
 * practitioner gave by hand.
 */
export type GeneratedRecipe = Entity & {
  patientId: Id;
  /** The verified template of the library that the recipe started from (D-34). */
  templateId: Id;
  title: string;
  content: StructuredRecipe;
  /** The day the recipe is planned for, `YYYY-MM-DD` in Europe/Brussels. */
  plannedOn: string;
  meal: MealSlot;
  /** When REMI made the recipe. */
  generatedAt: Date;
};
