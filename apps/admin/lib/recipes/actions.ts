"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  archiveRecipe,
  createRecipe,
  duplicateRecipe,
  getRecipe,
  setRecipeVerified,
  updateRecipe,
} from "@remi/services/server";
import {
  parseIngredientLines,
  parseStepLines,
  userMessage,
} from "@remi/services/shared";
import { audit } from "@/lib/audit";
import { requireOperator } from "@/lib/auth/session";

/**
 * The library's writes. Same shape as the patient actions next door: the
 * operator session is re-asserted per action because an action is an endpoint
 * of its own, validation stays in the service, and the audit row is written
 * after the success branch — a refused write is not an action to record.
 *
 * There is no delete action here and there is no service function to call: the
 * library archives, and a recipe patients hold cannot be removed from the
 * record at all.
 */

export type RecipeFormState = { error: string | null; saved: boolean };

const field = (formData: FormData, name: string) =>
  String(formData.get(name) ?? "");

/**
 * Tags arrive as one comma-separated box rather than a repeating field: it is
 * the fastest thing to type on a phone, and the service does the normalising,
 * so what the box splits on is the only decision left here.
 */
const tagsFrom = (formData: FormData) =>
  field(formData, "tags")
    .split(",")
    .map((tag) => tag.trim())
    .filter((tag) => tag !== "");

/** An empty box is « Non renseigné ». A text that is not a number is refused. */
const minutesFrom = (formData: FormData, name: string) => {
  const raw = field(formData, name).trim();
  return raw === "" ? null : Number(raw.replace(",", "."));
};

/** True when the practitioner typed an ingredient line or a step line. */
const hasStructuredLines = (formData: FormData) =>
  field(formData, "ingredients").trim() !== "" ||
  field(formData, "steps").trim() !== "";

/**
 * The structured recipe as the form posts it (REM-90). The two text boxes
 * hold one ingredient and one step for each line: the parsers of
 * `@remi/services/shared` read them, the same ones that draw the preview of
 * the form. The service checks the result with the schema.
 */
const contentFrom = (formData: FormData) => ({
  description: field(formData, "description"),
  prepMinutes: minutesFrom(formData, "prepMinutes"),
  cookMinutes: minutesFrom(formData, "cookMinutes"),
  portions: Number(field(formData, "portions").trim() || "NaN"),
  meals: formData.getAll("meals").map(String),
  seasons: formData.getAll("seasons").map(String),
  ingredients: parseIngredientLines(field(formData, "ingredients")),
  steps: parseStepLines(field(formData, "steps")),
});

const revalidateLibrary = (id?: string) => {
  revalidatePath("/recipes");
  if (id) {
    revalidatePath(`/recipes/${id}`);
  }
  // A recipe's title and body render inside every patient card holding it.
  revalidatePath("/patients", "layout");
};

/** Lands on the new recipe's own page: the next thing she does is assign it. */
export const createRecipeAction = async (
  _previous: RecipeFormState,
  formData: FormData,
): Promise<RecipeFormState> => {
  const operator = await requireOperator();
  const result = await createRecipe({
    title: field(formData, "title"),
    tags: tagsFrom(formData),
    content: contentFrom(formData),
  });
  if (!result.ok) {
    return { error: userMessage(result), saved: false };
  }
  await audit(operator, "recipe.created", {
    type: "recipe",
    id: result.data.id,
    label: result.data.title,
  });
  revalidateLibrary(result.data.id);
  redirect(`/recipes/${result.data.id}`);
};

export const updateRecipeAction = async (
  _previous: RecipeFormState,
  formData: FormData,
): Promise<RecipeFormState> => {
  const operator = await requireOperator();
  const id = field(formData, "id");
  const existing = await getRecipe(id);
  if (!existing.ok) {
    return { error: userMessage(existing), saved: false };
  }
  // A recipe of the old prose form stays a prose recipe until the
  // practitioner types its lines. A structured recipe stays structured.
  const structured =
    existing.data.content !== null || hasStructuredLines(formData);
  const result = await updateRecipe(
    id,
    {
      title: field(formData, "title"),
      body: field(formData, "body"),
      tags: tagsFrom(formData),
      ...(structured ? { content: contentFrom(formData) } : {}),
    },
    // An edit of a verified recipe removes the mark: the event names who.
    { id: operator.id, email: operator.email, name: operator.name },
  );
  if (!result.ok) {
    return { error: userMessage(result), saved: false };
  }
  await audit(operator, "recipe.updated", {
    type: "recipe",
    id,
    label: result.data.title,
  });
  revalidateLibrary(id);
  return { error: null, saved: true };
};

export const archiveRecipeAction = async (formData: FormData) => {
  const operator = await requireOperator();
  const id = field(formData, "id");
  const archived = field(formData, "archived") === "true";
  const result = await archiveRecipe(id, archived);
  if (result.ok) {
    await audit(operator, archived ? "recipe.archived" : "recipe.restored", {
      type: "recipe",
      id,
      label: result.data.title,
    });
  }
  revalidateLibrary(id);
};

/**
 * The library's half of « dupliquer en variante ». No patient is in context
 * here, so nothing is assigned: this is a copy opened for editing, and the
 * giving happens from a patient's page as it always has.
 */
export const duplicateRecipeAction = async (formData: FormData) => {
  const operator = await requireOperator();
  const result = await duplicateRecipe(field(formData, "id"));
  if (!result.ok) {
    return;
  }
  await audit(operator, "recipe.duplicated_as_variant", {
    type: "recipe",
    id: result.data.id,
    label: result.data.title,
    detail: `variante de ${field(formData, "title")}`,
  });
  revalidateLibrary(result.data.id);
  redirect(`/recipes/${result.data.id}`);
};

export type VerifyRecipeState = { error: string | null };

/**
 * The one act that marks a recipe « vérifiée », and the act that removes the
 * mark (D-34). The service checks the recipe and writes the audit event with
 * the account: this action writes no second event.
 */
export const setRecipeVerifiedAction = async (
  _previous: VerifyRecipeState,
  formData: FormData,
): Promise<VerifyRecipeState> => {
  const operator = await requireOperator();
  const id = field(formData, "id");
  const verified = field(formData, "verified") === "true";
  // The tick is the deliberate part of the act. A post without it is refused.
  if (verified && field(formData, "reviewed") !== "true") {
    return {
      error: "Cochez la case pour confirmer que vous avez relu la recette.",
    };
  }
  const result = await setRecipeVerified(
    id,
    { id: operator.id, email: operator.email, name: operator.name },
    verified,
  );
  if (!result.ok) {
    return { error: userMessage(result) };
  }
  revalidateLibrary(id);
  return { error: null };
};
