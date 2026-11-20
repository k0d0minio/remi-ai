import { z } from "zod";
import type { CompatibilityResult } from "../../../ai/compatibility";
import { addDays } from "../../../shared/format";
import { mealSlots, type MealSlot } from "../../../shared/meal-configuration";
import { err, ok, type Result } from "../../../shared/result";
import {
  structuredRecipeOf,
  structuredRecipeSchema,
} from "../../../shared/structured-recipe";
import type { Id } from "../../../types";
import { getDatabase, type DatabaseClient } from "../../client";
import type { GeneratedRecipe } from "../../models/generated-recipe";
import type { PatientProfile } from "../../models/patient-profile";
import { byPatient, noSuchPatient } from "../access";
import { listVerifiedTemplates } from "../recipes";

/**
 * The recipes that REMI generated for a patient — REM-90, story 24. The table
 * is `patient_recipes`. A row is patient data: each function takes the actor
 * first, and `db/services/access` checks it (D-26, D-27). A refused call
 * answers as a missing file.
 *
 * The rules of a write, and no caller can go around them:
 * - A recipe starts from a verified template of the library (D-34).
 * - A recipe that the compatibility gate did not confirm is not stored
 *   (D-30). The caller runs the gate and gives its status.
 * - A patient has one recipe at most for one day and one meal. A write for a
 *   day and a meal that have a recipe replaces that recipe.
 *
 * This service calls no model and runs no gate: the generation does.
 */

const generated = (db: DatabaseClient = getDatabase()) =>
  db.collection<GeneratedRecipe>("patient_recipes");

const uuidSchema = z.uuid();

const daySchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "that date is not valid")
  .refine(
    (value) => !Number.isNaN(new Date(`${value}T00:00:00Z`).getTime()),
    "that date is not valid",
  );

const inputSchema = z.object({
  templateId: z.uuid("a generated recipe starts from a verified template"),
  title: z.string().trim().min(1, "a title is required").max(140),
  content: structuredRecipeSchema,
  plannedOn: daySchema,
  meal: z.enum(mealSlots),
});

/** One recipe to store. `content` is read with `structuredRecipeSchema`. */
export type GeneratedRecipeInput = {
  /** The verified template that the recipe started from. */
  templateId: Id;
  title: string;
  content: unknown;
  /** The day in Europe/Brussels, `YYYY-MM-DD`. */
  plannedOn: string;
  meal: MealSlot;
  /** The status that `checkCompatibility` gave for this recipe and patient. */
  gateStatus: CompatibilityResult["status"];
};

/** The longest range that one read covers. */
export const GENERATED_RECIPES_MAX_DAYS = 31;

const mealOrder = (meal: MealSlot) => mealSlots.indexOf(meal);

/** A stored row whose content the schema refuses is never given to a reader. */
const readable = (row: GeneratedRecipe): GeneratedRecipe[] => {
  const content = structuredRecipeOf(row.content);
  return content ? [{ ...row, content }] : [];
};

/**
 * Store the recipes of a patient. All the recipes are stored, or none is.
 *
 * 1. Each recipe is checked: the title, the content, the day and the meal.
 * 2. A recipe with a gate status other than `compatible` refuses the write.
 * 3. A template that is not a verified, active recipe of the library refuses
 *    the write.
 * 4. Two recipes for the same day and meal in one call refuse the write.
 * 5. A recipe replaces the recipe that the patient has for that day and meal.
 *    The row keeps its id.
 */
const unscopedWriteGeneratedRecipes = async (
  patientId: Id,
  recipes: readonly GeneratedRecipeInput[],
): Promise<Result<readonly GeneratedRecipe[]>> => {
  if (!uuidSchema.safeParse(patientId).success) {
    return noSuchPatient();
  }
  const file = await getDatabase()
    .collection<PatientProfile>("patient_profiles")
    .findById(patientId);
  if (!file) {
    return noSuchPatient();
  }
  if (recipes.some((recipe) => recipe.gateStatus !== "compatible")) {
    return err(
      "invalid_input",
      "only a recipe that the gate confirmed is stored",
    );
  }
  const parsed = recipes.map((recipe) => inputSchema.safeParse(recipe));
  const failure = parsed.find((result) => !result.success);
  if (failure && !failure.success) {
    return err(
      "invalid_input",
      failure.error.issues[0]?.message ?? "that recipe is not valid",
    );
  }
  const rows = parsed.flatMap((result) => (result.success ? [result.data] : []));

  const slots = new Set(rows.map((row) => `${row.plannedOn}/${row.meal}`));
  if (slots.size !== rows.length) {
    return err("invalid_input", "one recipe for each day and meal");
  }
  const templateIds = new Set(
    (await listVerifiedTemplates()).map((template) => template.id),
  );
  if (rows.some((row) => !templateIds.has(row.templateId))) {
    return err(
      "invalid_input",
      "a generated recipe starts from a verified template",
    );
  }

  const generatedAt = new Date();
  const written = await getDatabase().transaction(async (tx) => {
    const result: GeneratedRecipe[] = [];
    for (const row of rows) {
      const existing = (
        await generated(tx).findMany(
          { patientId, plannedOn: row.plannedOn, meal: row.meal },
          { limit: 1 },
        )
      ).items[0];
      const values = { ...row, generatedAt };
      const saved = existing
        ? await generated(tx).update(existing.id, values)
        : await generated(tx).insert({ patientId, ...values });
      if (saved) {
        result.push(saved);
      }
    }
    return result;
  });
  return ok(written);
};

/**
 * The recipes of a patient from `from` to `to`, the two days included, by day
 * and then by meal. A range longer than `GENERATED_RECIPES_MAX_DAYS` stops at
 * that number of days. A day that is not valid gives an empty list.
 */
const unscopedListGeneratedRecipes = async (
  patientId: Id,
  range: { from: string; to: string },
): Promise<readonly GeneratedRecipe[]> => {
  if (
    !uuidSchema.safeParse(patientId).success ||
    !daySchema.safeParse(range.from).success ||
    !daySchema.safeParse(range.to).success
  ) {
    return [];
  }
  const days: string[] = [];
  for (
    let day = range.from;
    day <= range.to && days.length < GENERATED_RECIPES_MAX_DAYS;
    day = addDays(day, 1)
  ) {
    days.push(day);
  }
  const pages = await Promise.all(
    days.map((plannedOn) =>
      generated().findMany({ patientId, plannedOn }, { limit: 10 }),
    ),
  );
  return pages
    .flatMap((page) => page.items)
    .flatMap(readable)
    .sort(
      (a, b) =>
        a.plannedOn.localeCompare(b.plannedOn) ||
        mealOrder(a.meal) - mealOrder(b.meal),
    );
};

const noSuchGeneratedRecipe = () => err("not_found", "no such recipe");

/** One recipe of the patient. A recipe of another patient reads as missing. */
const unscopedGetGeneratedRecipe = async (
  patientId: Id,
  id: Id,
): Promise<Result<GeneratedRecipe>> => {
  if (!uuidSchema.safeParse(id).success) {
    return noSuchGeneratedRecipe();
  }
  const row = await generated().findById(id);
  const [recipe] = row && row.patientId === patientId ? readable(row) : [];
  return recipe ? ok(recipe) : noSuchGeneratedRecipe();
};

/**
 * The scoped surface (D-26, D-27). The actor comes first: `patientActor(id)`
 * with the id of the session for the patient, `operatorActor(...)` for the
 * practitioner, `systemActor` for REMI's own scheduled work.
 */
export const writeGeneratedRecipes = byPatient(
  "write",
  unscopedWriteGeneratedRecipes,
  noSuchPatient,
);
export const listGeneratedRecipes = byPatient(
  "read",
  unscopedListGeneratedRecipes,
  () => [],
);
export const getGeneratedRecipe = byPatient(
  "read",
  unscopedGetGeneratedRecipe,
  noSuchGeneratedRecipe,
);
