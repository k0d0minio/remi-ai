import { z } from "zod";
import { err, ok, type Result } from "../../../shared/result";
import type { Id } from "../../../types";
import { getDatabase } from "../../client";
import type { Recipe } from "../../models/recipe";
import type {
  AssignedRecipe,
  RecipeAssignment,
} from "../../models/recipe-assignment";
import { getPatient, touchPatient } from "../patients";

/**
 * Recipes given to a patient — the personal half of § I, and the weekly record.
 *
 * Two rules carry the design. A recipe may be assigned to the same patient
 * again months later, because the dated rows *are* the WEEKLY_ADAPTATION trail
 * (§ 8) and a second giving is history rather than a duplicate. But holding the
 * same recipe twice at once is not a refresh, it is a mistake, so a second
 * *active* assignment comes back as `conflict`.
 *
 * Every read joins its recipe, because nothing renders an assignment without
 * the dish: the card shows the title, the body and her note together.
 */

const assignments = () =>
  getDatabase().collection<RecipeAssignment>("patient_recipe_assignments");

const library = () => getDatabase().collection<Recipe>("recipes");

const uuidSchema = z.uuid();

/** Same shape as the consultation date next door: a day, not an instant. */
const isoDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "a date is required")
  .refine(
    (value) => !Number.isNaN(new Date(`${value}T00:00:00Z`).getTime()),
    "that date is not valid",
  );

const assignmentFields = z.object({
  note: z.string().trim().max(500),
  assignedOn: isoDate,
});

export type AssignmentInput = {
  note?: string;
  assignedOn?: string;
};

const forPatient = async (
  patientId: Id,
): Promise<readonly RecipeAssignment[]> => {
  if (!uuidSchema.safeParse(patientId).success) {
    return [];
  }
  const page = await assignments().findMany({ patientId }, { limit: 500 });
  return page.items;
};

/**
 * Drops an assignment whose recipe has vanished rather than rendering a hole.
 * The restrict constraint means that cannot happen through this package; it can
 * still happen to a database edited by hand, and a card is not the place to
 * find out.
 */
const withRecipes = async (
  rows: readonly RecipeAssignment[],
): Promise<readonly AssignedRecipe[]> => {
  const joined = await Promise.all(
    rows.map(async (assignment) => {
      const recipe = await library().findById(assignment.recipeId);
      return recipe ? { assignment, recipe } : null;
    }),
  );
  return joined.filter((entry) => entry !== null);
};

/** What the patient currently holds — newest giving first. */
export const listPatientRecipes = async (
  patientId: Id,
): Promise<readonly AssignedRecipe[]> =>
  withRecipes(
    [...(await forPatient(patientId))]
      .filter((assignment) => assignment.archivedAt === null)
      .sort((a, b) => b.assignedOn.localeCompare(a.assignedOn)),
  );

/** What rotated out, newest archive first — the weeks before this one. */
export const listArchivedPatientRecipes = async (
  patientId: Id,
): Promise<readonly AssignedRecipe[]> =>
  withRecipes(
    [...(await forPatient(patientId))]
      .filter((assignment) => assignment.archivedAt !== null)
      .sort(
        (a, b) =>
          (b.archivedAt?.getTime() ?? 0) - (a.archivedAt?.getTime() ?? 0),
      ),
  );

export const assignRecipe = async (
  patientId: Id,
  recipeId: Id,
  input: AssignmentInput,
): Promise<Result<RecipeAssignment>> => {
  if (!uuidSchema.safeParse(patientId).success) {
    return err("not_found", "no such patient");
  }
  if (!uuidSchema.safeParse(recipeId).success) {
    return err("not_found", "no such recipe");
  }
  const parsed = assignmentFields.partial({ note: true }).safeParse(input);
  if (!parsed.success) {
    return err("invalid_input", parsed.error.issues[0].message);
  }
  // Both sides are checked before the insert rather than after the FK
  // violation: a constraint error is not something a form can render.
  if (!(await getPatient(patientId)).ok) {
    return err("not_found", "no such patient");
  }
  if (!(await library().findById(recipeId))) {
    return err("not_found", "no such recipe");
  }

  const held = (await forPatient(patientId)).some(
    (assignment) =>
      assignment.recipeId === recipeId && assignment.archivedAt === null,
  );
  if (held) {
    return err("conflict", "this patient already has that recipe");
  }

  const created = await assignments().insert({
    patientId,
    recipeId,
    note: parsed.data.note ?? "",
    assignedOn: parsed.data.assignedOn,
    archivedAt: null,
  });
  await touchPatient(patientId);
  return ok(created);
};

/** The note and the date — the recipe itself is the library's to change. */
export const updateRecipeAssignment = async (
  id: Id,
  input: AssignmentInput,
): Promise<Result<RecipeAssignment>> => {
  if (!uuidSchema.safeParse(id).success) {
    return err("not_found", "no such assignment");
  }
  const parsed = assignmentFields.partial().safeParse(input);
  if (!parsed.success) {
    return err("invalid_input", parsed.error.issues[0].message);
  }
  const updated = await assignments().update(id, { ...parsed.data });
  if (!updated) {
    return err("not_found", "no such assignment");
  }
  await touchPatient(updated.patientId);
  return ok(updated);
};

/**
 * The weekly refresh: what rotates out is archived, not deleted, so "what did
 * she give in September" is answered by rows rather than by memory.
 */
export const archiveRecipeAssignment = async (
  id: Id,
  archived: boolean,
): Promise<Result<RecipeAssignment>> => {
  if (!uuidSchema.safeParse(id).success) {
    return err("not_found", "no such assignment");
  }
  const updated = await assignments().update(id, {
    archivedAt: archived ? new Date() : null,
  });
  if (!updated) {
    return err("not_found", "no such assignment");
  }
  await touchPatient(updated.patientId);
  return ok(updated);
};

/**
 * The permanent one, for the assignment that should never have been written —
 * the wrong patient, caught immediately. Archiving is the everyday move.
 */
export const removeRecipeAssignment = async (id: Id): Promise<Result<true>> => {
  if (!uuidSchema.safeParse(id).success) {
    return err("not_found", "no such assignment");
  }
  const existing = await assignments().findById(id);
  const removed = await assignments().remove(id);
  if (!removed) {
    return err("not_found", "no such assignment");
  }
  if (existing) {
    await touchPatient(existing.patientId);
  }
  return ok(true);
};
