import type { Entity, Id } from "../../types";

/**
 * One entry in the shared recipe library — brainstorm § I.
 *
 * Light on purpose. § 7 bans the dozen-field recipe form outright, so a recipe
 * is a title and a body of prose: the ingredients and the steps as Morgane
 * already writes them in chat, in one field, with no structure imposed on her.
 *
 * The v1 model this replaces carried `minutes`, `servings`, `Ingredient[]`,
 * `method[]` and `honours[]`. It belonged to the rigid weekly meal plan that
 * V2 deliberately replaced, and it is gone rather than renamed — two things
 * called `Recipe` is how a vocabulary rots.
 */
export type Recipe = Entity & {
  title: string;
  /** Ingredients and steps as prose. One field, no structure imposed. */
  body: string;
  /**
   * Free text, normalised to lowercase and de-duplicated on write. No
   * taxonomy is defined anywhere: the library filters on the tags that exist,
   * so which ones matter is answered by use rather than by a guess.
   */
  tags: readonly string[];
  /** Set when the recipe leaves the library without leaving the record. */
  archivedAt: Date | null;
  /**
   * The recipe this one was duplicated from, when it was. Set once, on the
   * duplicate, and never afterwards: it records where a variant came from, not
   * a relationship that can be re-pointed.
   *
   * A variant is a full library row rather than a fork of an assignment, so
   * adapting a recipe for one person leaves every other holder of the original
   * untouched — and this is the only thread back, which is why it could not be
   * added later: provenance for rows written before the column cannot be
   * recovered.
   */
  variantOfId: Id | null;
};
