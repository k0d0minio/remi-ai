import { z } from "zod";
import { err, ok, type Result } from "../../../shared/result";
import type { Id } from "../../../types";
import { getDatabase, type DatabaseClient } from "../../client";
import type { Recipe } from "../../models/recipe";
import type {
  AssignedRecipe,
  RecipeAssignment,
} from "../../models/recipe-assignment";
import { getPatient, touchPatient } from "../patients";
import {
  createRecipe,
  duplicateRecipe,
  recipeFields,
  type RecipeInput,
} from "../recipes";

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

/**
 * Both collections take the client, so the gestures at the bottom of this file
 * — the ones that write a recipe and its assignment as one unit — can hand
 * every write the client `transaction()` gave them rather than reaching for
 * the global and landing outside the unit.
 */
const assignments = (db: DatabaseClient = getDatabase()) =>
  db.collection<RecipeAssignment>("patient_recipe_assignments");

const library = (db: DatabaseClient = getDatabase()) =>
  db.collection<Recipe>("recipes");

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
  db?: DatabaseClient,
): Promise<readonly RecipeAssignment[]> => {
  if (!uuidSchema.safeParse(patientId).success) {
    return [];
  }
  const page = await assignments(db).findMany({ patientId }, { limit: 500 });
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
      if (!recipe) {
        return null;
      }
      // Read through the same tolerance as the recipe above: a variant whose
      // origin has vanished renders as an ordinary recipe rather than as a
      // broken link.
      const origin = recipe.variantOfId
        ? await library().findById(recipe.variantOfId)
        : null;
      return {
        assignment,
        recipe,
        origin: origin ? { id: origin.id, title: origin.title } : null,
      };
    }),
  );
  return joined.filter((entry) => entry !== null);
};

/**
 * Newest giving first, and within one date the order she chose them in.
 *
 * The tiebreak is not cosmetic. A bulk assignment writes several rows under one
 * `assignedOn`, so sorting on the date alone leaves their order to whatever the
 * adapter happens to return — which is not the same between the HTTP driver and
 * the in-memory test client, and so would be a list that reorders itself
 * between test and production. `createdAt` ascending is the selection order.
 */
const byGiving = (a: RecipeAssignment, b: RecipeAssignment) =>
  b.assignedOn.localeCompare(a.assignedOn) ||
  a.createdAt.getTime() - b.createdAt.getTime();

/** What the patient currently holds — newest giving first. */
export const listPatientRecipes = async (
  patientId: Id,
): Promise<readonly AssignedRecipe[]> =>
  withRecipes(
    [...(await forPatient(patientId))]
      .filter((assignment) => assignment.archivedAt === null)
      .sort(byGiving),
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

/**
 * Give several recipes at once — one note, one date, one submit.
 *
 * The bulk shape is the only one, because a week's inspirations are given
 * together and the single-recipe version was four round-trips through the same
 * three fields. Passing one id is the old gesture and costs nothing extra.
 *
 * All-or-nothing on purpose: a batch that half-lands leaves her to work out
 * which half, which is worse than a refusal naming the recipe at fault.
 */
export const assignRecipes = async (
  patientId: Id,
  recipeIds: readonly Id[],
  input: AssignmentInput,
): Promise<Result<readonly RecipeAssignment[]>> => {
  if (!uuidSchema.safeParse(patientId).success) {
    return err("not_found", "no such patient");
  }
  // Choosing the same recipe twice in one selection is a slip, not a request
  // for two rows.
  const ids = [...new Set(recipeIds)];
  if (ids.length === 0) {
    return err("invalid_input", "choose at least one recipe");
  }
  if (!ids.every((id) => uuidSchema.safeParse(id).success)) {
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

  const chosen = await Promise.all(ids.map((id) => library().findById(id)));
  const missing = chosen.findIndex((recipe) => recipe === null);
  if (missing !== -1) {
    return err("not_found", "no such recipe");
  }

  const active = (await forPatient(patientId)).filter(
    (assignment) => assignment.archivedAt === null,
  );
  const held = chosen.find((recipe) =>
    active.some((assignment) => assignment.recipeId === recipe?.id),
  );
  if (held) {
    // Named, because "already has that recipe" is unanswerable when she
    // selected six of them.
    return err(
      "conflict",
      `this patient already has « ${held.title} » — remove it from the selection`,
    );
  }

  const created = await getDatabase().transaction(async (tx) => {
    // Sequential rather than Promise.all: these writes share one transaction,
    // and a transaction is a single connection.
    const rows: RecipeAssignment[] = [];
    for (const id of ids) {
      rows.push(
        await assignments(tx).insert({
          patientId,
          recipeId: id,
          note: parsed.data.note ?? "",
          assignedOn: parsed.data.assignedOn,
          archivedAt: null,
        }),
      );
    }
    return rows;
  });
  await touchPatient(patientId);
  return ok(created);
};

/** The library row and the giving, which these gestures write as one thing. */
export type GivenRecipe = {
  recipe: Recipe;
  assignment: RecipeAssignment;
};

/**
 * Write a recipe and hand it over in the same save — § 7's « attribuer au
 * patient directement lors de la création », which until now meant a trip to
 * `/recipes` and back.
 *
 * The recipe still lands in the shared library: this is a faster way in, not a
 * private copy per patient.
 */
export const createAndAssignRecipe = async (
  patientId: Id,
  recipe: RecipeInput,
  input: AssignmentInput,
): Promise<Result<GivenRecipe>> => {
  if (!uuidSchema.safeParse(patientId).success) {
    return err("not_found", "no such patient");
  }
  // Both halves are validated before anything is written, so a bad title never
  // costs an insert that the assignment then has to undo.
  const fields = recipeFields.partial({ tags: true }).safeParse(recipe);
  if (!fields.success) {
    return err("invalid_input", fields.error.issues[0].message);
  }
  const parsed = assignmentFields.partial({ note: true }).safeParse(input);
  if (!parsed.success) {
    return err("invalid_input", parsed.error.issues[0].message);
  }
  if (!(await getPatient(patientId)).ok) {
    return err("not_found", "no such patient");
  }

  const written = await getDatabase().transaction(async (tx) => {
    const created = await createRecipe(recipe, tx);
    if (!created.ok) {
      return created;
    }
    const assignment = await assignments(tx).insert({
      patientId,
      recipeId: created.data.id,
      note: parsed.data.note ?? "",
      assignedOn: parsed.data.assignedOn,
      archivedAt: null,
    });
    return ok({ recipe: created.data, assignment });
  });
  if (!written.ok) {
    return written;
  }
  await touchPatient(patientId);
  return written;
};

/**
 * Adapt a recipe for one person: copy it, give the copy, and retire what it
 * replaces — all in the save she already makes.
 *
 * Archiving the origin's assignment is the point of the gesture rather than a
 * side effect. She is not giving a second nearly-identical dish; she is
 * replacing one with the version she just adapted. The archived row stays as
 * the record of what that person held before.
 */
export const duplicateAndAssignRecipe = async (
  patientId: Id,
  recipeId: Id,
  /** The title and body as she edited them before saving; empty means as-is. */
  recipe: RecipeInput,
  input: AssignmentInput,
): Promise<Result<GivenRecipe>> => {
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
  if (!(await getPatient(patientId)).ok) {
    return err("not_found", "no such patient");
  }
  if (!(await library().findById(recipeId))) {
    return err("not_found", "no such recipe");
  }

  // Only this patient's holding of the origin retires. Everyone else keeps it:
  // that is the whole difference between a variant and an edit.
  const superseded = (await forPatient(patientId)).find(
    (assignment) =>
      assignment.recipeId === recipeId && assignment.archivedAt === null,
  );

  const written = await getDatabase().transaction(async (tx) => {
    const variant = await duplicateRecipe(recipeId, recipe, tx);
    if (!variant.ok) {
      return variant;
    }
    const assignment = await assignments(tx).insert({
      patientId,
      recipeId: variant.data.id,
      note: parsed.data.note ?? "",
      assignedOn: parsed.data.assignedOn,
      archivedAt: null,
    });
    if (superseded) {
      await assignments(tx).update(superseded.id, { archivedAt: new Date() });
    }
    return ok({ recipe: variant.data, assignment });
  });
  if (!written.ok) {
    return written;
  }
  await touchPatient(patientId);
  return written;
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
