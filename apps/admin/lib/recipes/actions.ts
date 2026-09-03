"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  archiveRecipe,
  createRecipe,
  updateRecipe,
} from "@remi/services/server";
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
    body: field(formData, "body"),
    tags: tagsFrom(formData),
  });
  if (!result.ok) {
    return { error: result.message, saved: false };
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
  const result = await updateRecipe(id, {
    title: field(formData, "title"),
    body: field(formData, "body"),
    tags: tagsFrom(formData),
  });
  if (!result.ok) {
    return { error: result.message, saved: false };
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
