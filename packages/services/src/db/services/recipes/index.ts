import { z } from "zod";
import type { MealSlot } from "../../../shared/meal-configuration";
import { variantTitle } from "../../../shared/recipe";
import { err, ok, type Result } from "../../../shared/result";
import {
  structuredRecipeOf,
  structuredRecipeSchema,
  structuredRecipeText,
  type StructuredRecipe,
} from "../../../shared/structured-recipe";
import type { Id } from "../../../types";
import { getDatabase, type DatabaseClient } from "../../client";
import type { Recipe } from "../../models/recipe";
import type { RecipeAssignment } from "../../models/recipe-assignment";
import { recordAuditEvent, type OperatorActor } from "../audit";

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
 *
 * Since REM-90 a recipe can carry `content`, the structured recipe, and the
 * mark « vérifiée » (D-34). Three rules, and no caller can go around them:
 * - Only `setRecipeVerified` sets the mark. No create and no edit sets it.
 * - An edit that changes a verified recipe removes the mark.
 * - Only `listVerifiedTemplates` gives the generation its templates.
 * Each change of the mark writes an audit event (D-32).
 */

/**
 * The client is a parameter so a gesture spanning both tables can pass the one
 * `transaction()` handed it, instead of each write reaching for the global and
 * landing outside the unit. Every single-table function below keeps the
 * default and reads exactly as it did.
 */
const library = (db: DatabaseClient = getDatabase()) =>
  db.collection<Recipe>("recipes");

const assignments = (db: DatabaseClient = getDatabase()) =>
  db.collection<RecipeAssignment>("patient_recipe_assignments");

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

export const recipeFields = z.object({
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
  /**
   * The structured recipe, as `structuredRecipeSchema` reads it. Absent: the
   * write does not touch the structured form. A write cannot remove it.
   */
  content?: unknown;
};

const NOT_VERIFIED = {
  verifiedAt: null,
  verifiedById: null,
  verifiedByName: "",
} as const;

type ParsedContent =
  | { ok: true; content: StructuredRecipe | undefined }
  | { ok: false; message: string };

const parseContent = (value: unknown): ParsedContent => {
  if (value === undefined) {
    return { ok: true, content: undefined };
  }
  const parsed = structuredRecipeSchema.safeParse(value);
  return parsed.success
    ? { ok: true, content: parsed.data }
    : {
        ok: false,
        message: parsed.error.issues[0]?.message ?? "that recipe is not valid",
      };
};

/** A blank body is no body: the schema then does not see it. */
const withoutBlankBody = (input: RecipeInput): RecipeInput =>
  input.body === undefined || input.body.trim() === ""
    ? { ...input, body: undefined }
    : input;

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
  db?: DatabaseClient,
): Promise<Result<Recipe>> => {
  const structured = parseContent(input.content);
  if (!structured.ok) {
    return err("invalid_input", structured.message);
  }
  const { content } = structured;
  // A structured recipe needs no typed body: the service writes it.
  const parsed = content
    ? recipeFields
        .partial({ tags: true, body: true })
        .safeParse(withoutBlankBody(input))
    : recipeFields.partial({ tags: true }).safeParse(input);
  if (!parsed.success) {
    return err("invalid_input", parsed.error.issues[0].message);
  }
  return ok(
    await library(db).insert({
      title: parsed.data.title,
      body:
        parsed.data.body ?? (content ? structuredRecipeText(content) : ""),
      tags: parsed.data.tags ?? [],
      archivedAt: null,
      variantOfId: null,
      content: content ?? null,
      // A new recipe is never verified: only `setRecipeVerified` sets the mark.
      ...NOT_VERIFIED,
    }),
  );
};

/**
 * A variant — the answer to "adapt this for one person" that `updateRecipe`
 * cannot give, because an edit there reaches everyone holding the recipe.
 *
 * It is a full library row, not a fork of an assignment, so the origin's
 * holder count is unchanged by it and every other holder keeps the recipe they
 * were given. The link back is `variantOfId`, set here and never again.
 */
export const duplicateRecipe = async (
  id: Id,
  /**
   * What she changed before saving. The copy is opened for editing, so the
   * adapted title and body are written by the insert itself rather than by an
   * update chasing it — one row, one write, nothing half-adapted in between.
   */
  overrides?: RecipeInput,
  db?: DatabaseClient,
): Promise<Result<Recipe>> => {
  if (!uuidSchema.safeParse(id).success) {
    return err("not_found", "no such recipe");
  }
  const origin = await library(db).findById(id);
  if (!origin) {
    return err("not_found", "no such recipe");
  }
  const parsed = recipeFields.partial().safeParse({
    title: overrides?.title ?? variantTitle(origin.title),
    // The body of the origin is not checked again: only a typed body is.
    body: overrides?.body,
  });
  if (!parsed.success) {
    return err("invalid_input", parsed.error.issues[0].message);
  }
  const body = parsed.data.body ?? origin.body;
  return ok(
    await library(db).insert({
      title: parsed.data.title ?? variantTitle(origin.title),
      body,
      // A variant with the body of its origin keeps the structured form. A
      // variant that the practitioner adapted as prose is a prose recipe: the
      // structured form of the origin does not describe it.
      content: body === origin.body ? origin.content : null,
      // A variant is a new recipe. It is never verified by its origin.
      ...NOT_VERIFIED,
      // Tags come from the origin and are not editable in the gesture: a
      // variant of a winter recipe is still a winter recipe.
      tags: [...origin.tags],
      // A variant of an archived recipe is itself active: she is adapting it
      // now, whatever the state of what she adapted.
      archivedAt: null,
      variantOfId: origin.id,
    }),
  );
};

/**
 * An edit here changes the recipe for every patient holding it. That is the
 * point of a shared library and the cost of one — whether Morgane wants a
 * "duplicate to variant" escape hatch is hers to answer, and until she does the
 * console states the holder count beside this form rather than guessing for
 * her.
 *
 * The structured form (REM-90):
 * 1. `content` absent: the edit does not touch the structured form.
 * 2. `content` present: the service checks it and stores it. The body then
 *    follows it, unless the body is prose that the practitioner typed: that
 *    prose stays as it is.
 * 3. An edit that changes the title, the body, the tags or the content of a
 *    verified recipe removes the mark, and writes `recipe.verification_removed`
 *    with the detail `edit`. A save that changes nothing keeps the mark.
 */
export const updateRecipe = async (
  id: Id,
  input: RecipeInput,
  /** Who edits. The audit event of a removed mark names this account. */
  operator: OperatorActor | null = null,
): Promise<Result<Recipe>> => {
  if (!uuidSchema.safeParse(id).success) {
    return err("not_found", "no such recipe");
  }
  const existing = await library().findById(id);
  if (!existing) {
    return err("not_found", "no such recipe");
  }
  const structured = parseContent(input.content);
  if (!structured.ok) {
    return err("invalid_input", structured.message);
  }
  const { content } = structured;
  const stored = structuredRecipeOf(existing.content);
  const storedText = stored ? structuredRecipeText(stored) : null;

  // The body that the service wrote from the old content is not prose that
  // the practitioner typed: it follows the new content.
  const typedBody = input.body?.trim() ?? "";
  const keepsProse = typedBody !== "" && typedBody !== storedText;
  const parsed = recipeFields
    .partial()
    .safeParse(content && !keepsProse ? { ...input, body: undefined } : input);
  if (!parsed.success) {
    return err("invalid_input", parsed.error.issues[0].message);
  }

  const next = {
    title: parsed.data.title ?? existing.title,
    body:
      content && !keepsProse
        ? structuredRecipeText(content)
        : (parsed.data.body ?? existing.body),
    tags: parsed.data.tags ?? existing.tags,
    content: content ?? existing.content,
  };
  const changed =
    next.title !== existing.title ||
    next.body !== existing.body ||
    JSON.stringify(next.tags) !== JSON.stringify(existing.tags) ||
    (content !== undefined &&
      JSON.stringify(content) !== JSON.stringify(stored));
  const losesMark = existing.verifiedAt !== null && changed;

  const updated = await library().update(id, {
    ...next,
    ...(losesMark ? NOT_VERIFIED : {}),
  });
  if (!updated) {
    return err("not_found", "no such recipe");
  }
  if (losesMark) {
    await recordAuditEvent({
      actor: operator,
      action: "recipe.verification_removed",
      targetType: "recipe",
      targetId: id,
      targetLabel: updated.title,
      detail: "edit",
    });
  }
  return ok(updated);
};

/**
 * Set or remove the mark « vérifiée » (D-34). This is the only function that
 * sets it, and the practitioner calls it with one explicit act.
 *
 * 1. Only a structured recipe that the schema accepts can be verified. A
 *    recipe of the old prose form is refused.
 * 2. An archived recipe is refused.
 * 3. Each change of the mark writes one audit event with the account (D-32).
 *    A call that changes nothing writes no event.
 */
export const setRecipeVerified = async (
  id: Id,
  operator: OperatorActor,
  verified: boolean,
): Promise<Result<Recipe>> => {
  if (!uuidSchema.safeParse(id).success) {
    return err("not_found", "no such recipe");
  }
  const existing = await library().findById(id);
  if (!existing) {
    return err("not_found", "no such recipe");
  }
  if (verified === (existing.verifiedAt !== null)) {
    return ok(existing);
  }
  if (verified) {
    if (existing.archivedAt !== null) {
      return err("conflict", "an archived recipe cannot be verified");
    }
    if (structuredRecipeOf(existing.content) === null) {
      return err("invalid_input", "only a structured recipe can be verified");
    }
  }
  const updated = await library().update(
    id,
    verified
      ? {
          verifiedAt: new Date(),
          verifiedById: operator.id,
          verifiedByName: operator.name,
        }
      : NOT_VERIFIED,
  );
  if (!updated) {
    return err("not_found", "no such recipe");
  }
  await recordAuditEvent({
    actor: operator,
    action: verified ? "recipe.verified" : "recipe.verification_removed",
    targetType: "recipe",
    targetId: id,
    targetLabel: updated.title,
    detail: verified ? "" : "explicit",
  });
  return ok(updated);
};

/** A template that the generation can start from (D-34). */
export type VerifiedTemplate = {
  id: Id;
  title: string;
  tags: readonly string[];
  content: StructuredRecipe;
  verifiedAt: Date;
};

/**
 * The verified templates of the library, by title. This is the only source of
 * templates for the generation: a recipe that is not verified, that is
 * archived, or whose stored content the schema refuses is never in the list.
 * `meal` keeps the templates that suit that meal.
 */
export const listVerifiedTemplates = async (filter?: {
  meal?: MealSlot;
}): Promise<readonly VerifiedTemplate[]> =>
  (await all())
    .flatMap((recipe): VerifiedTemplate[] => {
      const content = structuredRecipeOf(recipe.content);
      return recipe.verifiedAt !== null &&
        recipe.archivedAt === null &&
        content !== null
        ? [
            {
              id: recipe.id,
              title: recipe.title,
              tags: recipe.tags,
              content,
              verifiedAt: recipe.verifiedAt,
            },
          ]
        : [];
    })
    .filter(
      (template) =>
        filter?.meal === undefined ||
        template.content.meals.includes(filter.meal),
    )
    .sort((a, b) => a.title.localeCompare(b.title, "fr"));

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
