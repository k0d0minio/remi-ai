import type { Entity, Id } from "../../types";
import type { Recipe } from "./recipe";

/**
 * One recipe given to one patient — the personal half of § I.
 *
 * The library holds the dish; this holds the giving. `note` is the
 * « pourquoi pour toi », and `assignedOn` is what makes the weekly refresh a
 * record rather than a state: each week's assignments, kept and dated, are the
 * WEEKLY_ADAPTATION history (§ 8).
 *
 * A patient may hold the same recipe again months later — a second row, its own
 * date, its own note. That is the trail, so nothing here is unique per pair.
 */
export type RecipeAssignment = Entity & {
  patientId: Id;
  recipeId: Id;
  /** Why this recipe, for this person, in her words. */
  note: string;
  /** The day she gave it, as a calendar date — `YYYY-MM-DD`. */
  assignedOn: string;
  /** Set when the recipe rotates out of this patient's current set. */
  archivedAt: Date | null;
};

/**
 * An assignment together with the recipe it points at.
 *
 * Nothing renders one without the other — the card shows the dish, her note and
 * the date as one thing — so every read of a patient's recipes returns this
 * pairing rather than leaving each call site to fetch the halves.
 */
export type AssignedRecipe = {
  assignment: RecipeAssignment;
  recipe: Recipe;
};
