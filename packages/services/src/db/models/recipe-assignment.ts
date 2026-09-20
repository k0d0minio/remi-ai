import type { RecipeResponse } from "../../shared/recipe";
import type { Entity, Id } from "../../types";
import type { WrittenBy } from "./meal-entry";
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
  /**
   * § 7's answer, as the patient gave it — null until they do, and null again
   * if they take it back.
   *
   * It lives on the giving rather than on the library recipe because the same
   * dish is « à refaire » for one person and « pas pour moi » for another, and
   * an archived row keeps its answer: that history is what the next
   * propositions read.
   */
  patientResponse: RecipeResponse | null;
  /** When they answered. Null exactly when `patientResponse` is. */
  respondedAt: Date | null;
  /**
   * Who last wrote this row. `practitioner` at the giving, `patient` once they
   * have answered on their link — including when the answer they wrote was to
   * clear the previous one. The row is shared between the two surfaces, so
   * without this the trail cannot say which of them touched it.
   */
  writtenBy: WrittenBy;
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
  /**
   * The recipe this one was adapted from, when it is a variant — just enough
   * to render « variante de … » and link to it. The whole origin is not
   * carried: the card shows the variant's own body, and the origin is a
   * destination, not content.
   */
  origin: { id: Id; title: string } | null;
};
