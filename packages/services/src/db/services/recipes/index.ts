import { z } from "zod";
import { err, ok, type Result } from "../../../shared/result";
import type { Id } from "../../../types";
import { getDatabase } from "../../client";
import type { Recipe } from "../../models/recipe";
import type { RecipeAssignment } from "../../models/recipe-assignment";

/**
 * The shared recipe library — brainstorm § I, the half that belongs to nobody.
 *
 * There is no delete here, and that is the whole shape of the thing: a recipe a
 * patient holds is part of that patient's history, so the library archives.
 * The `on delete restrict` from `patient_recipe_assignments` is the same rule
 * expressed in the database, which is what keeps it true when someone reaches
 * past this file.
 *
 * Tags carry no taxonomy. They are normalised — trimmed, lowercased, deduped —
 * so "Hiver" and "hiver" are one tag rather than two, and then left alone:
 * which tags matter is Morgane's to answer by using them, and `listRecipeTags`
 * reports what she actually used.
 */

const library = () => getDatabase().collection<Recipe>("recipes");

const assignments = () =>
  getDatabase().collection<RecipeAssignment>("patient_recipe_assignments");

const uuidSchema = z.uuid();

const MAX_TAGS = 6;

/**
 * Normalising in the schema rather than at the call sites is what makes the
 * cap meaningful: six tags means six distinct tags, counted after the dedupe.
 */
const tagsSchema = z
  .array(z.string())
  .transform((tags) => [
    ...new Set(
      tags.map((tag) => tag.trim().toLowerCase()).filter((tag) => tag !== ""),
    ),
  ])
  .refine((tags) => tags.length <= MAX_TAGS, `at most ${MAX_TAGS} tags`)
  .refine(
    (tags) => tags.every((tag) => tag.length <= 32),
    "a tag is at most 32 characters",
  );

const recipeFields = z.object({
  title: z.string().trim().min(1, "a title is required").max(140),
  body: z
    .string()
    .trim()
    .min(1, "a recipe needs its ingredients and steps")
    .max(4000),
  tags: tagsSchema,
});

export type RecipeInput = {
  title?: string;
  body?: string;
  tags?: readonly string[];
};

/** Most recently changed first — she edits what she is about to hand out. */
const byRecency = (a: Recipe, b: Recipe) =>
  b.updatedAt.getTime() - a.updatedAt.getTime();

const all = async (): Promise<readonly Recipe[]> => {
  const page = await library().findMany({}, { limit: 500 });
  return [...page.items];
};

/**
 * The library in force. `tag` and `search` filter in this service rather than
 * at the seam: the seam speaks equality-and-limit, the library is tens of rows,
 * and pushing an array-contains down would tie every adapter to Postgres.
 */
export const listRecipes = async (filter?: {
  tag?: string;
  search?: string;
}): Promise<readonly Recipe[]> => {
  const tag = filter?.tag?.trim().toLowerCase() ?? "";
  const search = filter?.search?.trim().toLowerCase() ?? "";
  return (await all())
    .filter((recipe) => recipe.archivedAt === null)
    .filter((recipe) => tag === "" || recipe.tags.includes(tag))
    .filter(
      (recipe) => search === "" || recipe.title.toLowerCase().includes(search),
    )
    .sort(byRecency);
};

/** What left the library, newest archive first. */
export const listArchivedRecipes = async (): Promise<readonly Recipe[]> =>
  (await all())
    .filter((recipe) => recipe.archivedAt !== null)
    .sort(
      (a, b) => (b.archivedAt?.getTime() ?? 0) - (a.archivedAt?.getTime() ?? 0),
    );

/**
 * Every tag in use across the active library, alphabetical.
 *
 * The filter is built from this rather than from a stored vocabulary, so a tag
 * exists exactly as long as a recipe carries it — nothing to prune, and no
 * empty taxonomy to maintain.
 */
export const listRecipeTags = async (): Promise<readonly string[]> => {
  const active = await listRecipes();
  return [...new Set(active.flatMap((recipe) => recipe.tags))].sort();
};

export const getRecipe = async (id: Id): Promise<Result<Recipe>> => {
  if (!uuidSchema.safeParse(id).success) {
    return err("not_found", "no such recipe");
  }
  const recipe = await library().findById(id);
  return recipe ? ok(recipe) : err("not_found", "no such recipe");
};

export const createRecipe = async (
  input: RecipeInput,
): Promise<Result<Recipe>> => {
  const parsed = recipeFields.partial({ tags: true }).safeParse(input);
  if (!parsed.success) {
    return err("invalid_input", parsed.error.issues[0].message);
  }
  return ok(
    await library().insert({
      title: parsed.data.title,
      body: parsed.data.body,
      tags: parsed.data.tags ?? [],
      archivedAt: null,
    }),
  );
};

/**
 * An edit here changes the recipe for every patient holding it. That is the
 * point of a shared library and the cost of one — whether Morgane wants a
 * "duplicate to variant" escape hatch is hers to answer, and until she does the
 * console states the holder count beside this form rather than guessing for
 * her.
 */
export const updateRecipe = async (
  id: Id,
  input: RecipeInput,
): Promise<Result<Recipe>> => {
  if (!uuidSchema.safeParse(id).success) {
    return err("not_found", "no such recipe");
  }
  const parsed = recipeFields.partial().safeParse(input);
  if (!parsed.success) {
    return err("invalid_input", parsed.error.issues[0].message);
  }
  const updated = await library().update(id, { ...parsed.data });
  return updated ? ok(updated) : err("not_found", "no such recipe");
};

/**
 * Out of the library and out of the picker, without touching the assignments
 * that already point at it: what a patient was given stays what they were
 * given. There is no delete counterpart on purpose.
 */
export const archiveRecipe = async (
  id: Id,
  archived: boolean,
): Promise<Result<Recipe>> => {
  if (!uuidSchema.safeParse(id).success) {
    return err("not_found", "no such recipe");
  }
  const updated = await library().update(id, {
    archivedAt: archived ? new Date() : null,
  });
  return updated ? ok(updated) : err("not_found", "no such recipe");
};

/** How many patients hold this recipe right now — the blast radius of an edit. */
export const countRecipeAssignments = async (id: Id): Promise<number> => {
  if (!uuidSchema.safeParse(id).success) {
    return 0;
  }
  const page = await assignments().findMany({ recipeId: id }, { limit: 500 });
  return page.items.filter((assignment) => assignment.archivedAt === null)
    .length;
};
