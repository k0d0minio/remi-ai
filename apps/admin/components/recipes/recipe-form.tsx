"use client";

import { Plus, Save } from "lucide-react";
import { useActionState } from "react";
import type { Recipe } from "@remi/services/shared";
import { Button } from "@remi/ui";
import { Field, Input, Textarea, Typography } from "@remi/ui/server";
import {
  createRecipeAction,
  updateRecipeAction,
  type RecipeFormState,
} from "@/lib/recipes/actions";

const initial: RecipeFormState = { error: null, saved: false };

type Props = {
  /** Present when editing; absent on the library's create form. */
  recipe?: Recipe;
};

/**
 * Three fields, and § 7 is the reason there are not more: a title, the recipe
 * as prose, and the tags she filters on. No minutes, no servings, no separate
 * ingredient rows — she writes the whole thing the way she already writes it in
 * chat, and pastes.
 */
export const RecipeForm = ({ recipe }: Props) => {
  const [state, action, pending] = useActionState(
    recipe ? updateRecipeAction : createRecipeAction,
    initial,
  );

  return (
    <form action={action} className="flex flex-col gap-4">
      {recipe ? <input type="hidden" name="id" value={recipe.id} /> : null}

      <Field id="recipe-title" label="Titre">
        <Input
          id="recipe-title"
          name="title"
          required
          maxLength={140}
          defaultValue={recipe?.title}
          placeholder="ex. Tartine de sardines"
        />
      </Field>

      <Field
        id="recipe-body"
        label="La recette"
        hint="Ingrédients et étapes, comme vous les écrivez déjà — un seul champ, en texte libre."
      >
        <Textarea
          id="recipe-body"
          name="body"
          required
          rows={12}
          maxLength={4000}
          defaultValue={recipe?.body}
        />
      </Field>

      <Field
        id="recipe-tags"
        label="Étiquettes"
        optional
        hint="Séparées par des virgules — « hiver, végétarien ». Six au maximum, et vous choisissez lesquelles."
      >
        <Input
          id="recipe-tags"
          name="tags"
          defaultValue={recipe?.tags.join(", ")}
          placeholder="hiver, végétarien"
        />
      </Field>

      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" disabled={pending} size="sm">
          {recipe ? <Save aria-hidden="true" /> : <Plus aria-hidden="true" />}
          {pending
            ? "Enregistrement…"
            : recipe
              ? "Enregistrer"
              : "Créer la recette"}
        </Button>
        {state.error ? (
          <Typography size="sm" className="text-error-text" role="alert">
            {state.error}
          </Typography>
        ) : null}
        {state.saved && !state.error ? (
          <Typography size="sm" tone="muted" role="status">
            Enregistré.
          </Typography>
        ) : null}
      </div>
    </form>
  );
};
