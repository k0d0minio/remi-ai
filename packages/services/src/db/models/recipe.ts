import type { StructuredRecipe } from "../../shared/structured-recipe";
import type { Entity, Id } from "../../types";

/**
 * One entry in the shared recipe library — brainstorm § I.
 *
 * A recipe has two forms. The old form is a title and a body of prose. The
 * structured form (REM-90, stories 24 and 25) is `content`: ingredients with
 * a quantity and a unit, ordered steps, the times, the portions and the meals.
 * A recipe of the old form has `content` null. It stays readable, and it can
 * never be verified.
 *
 * The library is the template base of the generation (D-34). Only a recipe
 * with `verifiedAt` set is a template that feeds the generation.
 */
export type Recipe = Entity & {
  title: string;
  /**
   * The recipe as prose. For a recipe of the old form, it is what the
   * practitioner typed. For a structured recipe, the service writes it from
   * `content`, so that each screen that shows a body stays readable.
   */
  body: string;
  /**
   * The structured recipe, or null for a recipe of the old form. Read it with
   * `structuredRecipeOf`: the column is jsonb.
   */
  content: StructuredRecipe | null;
  /**
   * When a practitioner marked the recipe « vérifiée », or null. Only an
   * explicit act sets it. An edit of the recipe sets it back to null.
   */
  verifiedAt: Date | null;
  /** The account that verified. No foreign key: the fact stays. */
  verifiedById: Id | null;
  /** The name of that account at the time, or `""`. */
  verifiedByName: string;
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
