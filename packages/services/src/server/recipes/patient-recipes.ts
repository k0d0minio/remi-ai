/**
 * The recipes that a patient can read — REM-94, story 25, D-16, D-26 and D-30.
 *
 * Two sources, one rule. A recipe of the patient is a recipe that REMI
 * generated for them (`patient_recipes`), or a recipe of the library that the
 * practitioner gave them and has not archived (`patient_recipe_assignments`).
 * Each read checks the actor, so a recipe of another patient reads as missing.
 *
 * The compatibility gate reads each recipe for this patient at each read,
 * with the safety data of that moment: an allergy that the patient declares
 * today hides a recipe that was stored last week. Only `compatible` is shown.
 * A recipe with no structured content is a free text for the gate, and the
 * gate never confirms a free text.
 *
 * A failed read of the safety data is a failure. No recipe is then shown.
 */

import { z } from "zod";
import {
  checkCompatibility,
  mayBeShown,
  type PatientSafetyData,
} from "../../ai/compatibility";
import type { Actor } from "../../db/models/actor";
import type { GeneratedRecipe } from "../../db/models/generated-recipe";
import type { AssignedRecipe } from "../../db/models/recipe-assignment";
import {
  getGeneratedRecipe,
  listGeneratedRecipes,
} from "../../db/services/generated-recipes";
import { listPatientRecipes } from "../../db/services/recipe-assignments";
import { addDays, todayAtPractice } from "../../shared/format";
import type {
  PatientRecipeCard,
  PatientRecipeSource,
} from "../../shared/recipe-card";
import { err, ok, type Result } from "../../shared/result";
import {
  recipeGateItem,
  structuredRecipeOf,
  type StructuredRecipe,
} from "../../shared/structured-recipe";
import type { Id } from "../../types";
import { loadPatientSafety } from "../patient-safety";

/** A recipe of the patient before the gate. Never give one to a page. */
export type PatientRecipeCandidate = {
  id: Id;
  source: PatientRecipeSource;
  title: string;
  /** Null for a recipe of the old form: a title and a body of prose. */
  content: StructuredRecipe | null;
  /** The prose of a recipe with no structured content. */
  body: string;
  justification: string;
};

/**
 * `GeneratedRecipe` has no justification column (REM-90). The page shows a
 * justification when the recipe has one, thus a generated recipe has none
 * until the generation stores one.
 */
export const generatedCandidate = (
  recipe: GeneratedRecipe,
): PatientRecipeCandidate => ({
  id: recipe.id,
  source: "remi",
  title: recipe.title,
  content: recipe.content,
  body: "",
  justification: "",
});

/** The id is the assignment's: the assignment holds the patient. */
export const assignedCandidate = ({
  assignment,
  recipe,
}: AssignedRecipe): PatientRecipeCandidate => ({
  id: assignment.id,
  source: "practitioner",
  title: recipe.title,
  // The column is jsonb: the stored shape is never trusted.
  content: structuredRecipeOf(recipe.content),
  body: recipe.body,
  justification: assignment.note.trim(),
});

/**
 * The card of a recipe for this patient on the day `today`, or null when the
 * gate does not confirm the recipe. Pure: the caller gives the safety data
 * and the day.
 */
export const gatedRecipeCard = (
  candidate: PatientRecipeCandidate,
  safety: PatientSafetyData,
  today: string,
): PatientRecipeCard | null => {
  const { content } = candidate;
  const verdict = checkCompatibility(
    safety,
    content === null
      ? { kind: "text", text: candidate.body }
      : recipeGateItem(content),
    today,
  );
  if (content === null || !mayBeShown(verdict)) {
    return null;
  }
  return {
    id: candidate.id,
    source: candidate.source,
    title: candidate.title,
    content,
    justification: candidate.justification,
  };
};

export type PatientRecipeList = {
  cards: readonly PatientRecipeCard[];
  /** The number of recipes of the patient that the gate did not confirm. */
  withheld: number;
};

/** The recipes of the list, split by the gate. Pure. */
export const gatedRecipeList = (
  candidates: readonly PatientRecipeCandidate[],
  safety: PatientSafetyData,
  today: string,
): PatientRecipeList => {
  const cards = candidates.flatMap((candidate) => {
    const card = gatedRecipeCard(candidate, safety, today);
    return card ? [card] : [];
  });
  return { cards, withheld: candidates.length - cards.length };
};

/** The generated recipes that the list reads: 15 days each side of today. */
const LIST_DAYS_EACH_SIDE = 15;

/** Statuses and counts only: no title, no ingredient, no patient id. */
const log = (event: string, detail: Record<string, number | string>) => {
  console.info(JSON.stringify({ event, ...detail }));
};

/**
 * The recipes that the patient can read now: the generated recipes of the
 * days around today, newest day first, then the recipes that the practitioner
 * gave. `recipe-space/patient-recipes-today` (REM-92) replaces this list.
 */
export const listPatientRecipeCards = async (
  actor: Actor,
  patientId: Id,
  at: Date = new Date(),
): Promise<Result<PatientRecipeList>> => {
  const loaded = await loadPatientSafety(actor, patientId);
  if (!loaded.ok) {
    return loaded;
  }
  const today = todayAtPractice(at);
  const generated = await listGeneratedRecipes(actor, patientId, {
    from: addDays(today, -LIST_DAYS_EACH_SIDE),
    to: addDays(today, LIST_DAYS_EACH_SIDE),
  });
  const assigned = await listPatientRecipes(actor, patientId);
  const list = gatedRecipeList(
    [
      ...[...generated].reverse().map(generatedCandidate),
      ...assigned.map(assignedCandidate),
    ],
    loaded.data.safety,
    today,
  );
  log("patient.recipes.list", {
    shown: list.cards.length,
    withheld: list.withheld,
  });
  return ok(list);
};

export type PatientRecipeRead =
  | { status: "shown"; card: PatientRecipeCard }
  /** The recipe is the patient's, and the gate does not confirm it. */
  | { status: "withheld" };

const uuidSchema = z.uuid();

const noSuchRecipe = () => err("not_found", "no such recipe");

/**
 * One recipe of the patient, by the id of the address. `not_found` when the
 * recipe is not the patient's own: a recipe of another patient, an archived
 * assignment and an id that does not exist give the same answer.
 */
export const getPatientRecipeCard = async (
  actor: Actor,
  patientId: Id,
  id: Id,
  at: Date = new Date(),
): Promise<Result<PatientRecipeRead>> => {
  if (!uuidSchema.safeParse(id).success) {
    return noSuchRecipe();
  }
  const generated = await getGeneratedRecipe(actor, patientId, id);
  const assigned = generated.ok
    ? undefined
    : (await listPatientRecipes(actor, patientId)).find(
        ({ assignment }) => assignment.id === id,
      );
  const candidate = generated.ok
    ? generatedCandidate(generated.data)
    : assigned
      ? assignedCandidate(assigned)
      : null;
  if (candidate === null) {
    return noSuchRecipe();
  }
  const loaded = await loadPatientSafety(actor, patientId);
  if (!loaded.ok) {
    return loaded;
  }
  const card = gatedRecipeCard(
    candidate,
    loaded.data.safety,
    todayAtPractice(at),
  );
  log("patient.recipes.read", {
    status: card ? "shown" : "withheld",
    source: candidate.source,
  });
  return ok(card ? { status: "shown", card } : { status: "withheld" });
};
