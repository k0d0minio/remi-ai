"use client";

import { Plus } from "lucide-react";
import { useActionState, useState } from "react";
import type { Recipe } from "@remi/services/shared";
import {
  Button,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@remi/ui";
import { Field, Input, Typography } from "@remi/ui/server";
import {
  assignRecipeAction,
  type AssignmentFormState,
} from "@/lib/patients/actions";

const initial: AssignmentFormState = { error: null };

type Props = {
  patientId: string;
  /** The active library only — an archived recipe is not offered again. */
  recipes: readonly Recipe[];
  /** Today, resolved on the server so a date input never disagrees with it. */
  today: string;
};

/**
 * Giving a recipe: pick it, say why for this person, date it.
 *
 * The date is the point of the weekly rhythm — § I's "new inspirations each
 * week" is recorded as dated assignments rather than as a week entity, because
 * nobody has asked for one. It defaults to today and stays editable, so a
 * consultation typed up on Thursday can carry Tuesday's date.
 */
export const AssignRecipeForm = ({ patientId, recipes, today }: Props) => {
  const [state, action, pending] = useActionState(assignRecipeAction, initial);
  const [recipeId, setRecipeId] = useState("");
  const chosen = recipes.find((recipe) => recipe.id === recipeId);

  if (recipes.length === 0) {
    return (
      <Typography size="sm" tone="muted">
        La bibliothèque est vide — écrivez une recette dans « Recettes » pour
        pouvoir l&apos;attribuer.
      </Typography>
    );
  }

  return (
    <form action={action} className="flex flex-col gap-4">
      <input type="hidden" name="patientId" value={patientId} />
      <input type="hidden" name="recipeId" value={recipeId} />
      <input type="hidden" name="title" value={chosen?.title ?? ""} />

      <div className="grid gap-4 sm:grid-cols-[1fr_10rem]">
        <Field id="assign-recipe" label="Recette">
          <Select value={recipeId} onValueChange={setRecipeId}>
            <SelectTrigger id="assign-recipe">
              <SelectValue placeholder="Choisir dans la bibliothèque" />
            </SelectTrigger>
            <SelectContent>
              {recipes.map((recipe) => (
                <SelectItem key={recipe.id} value={recipe.id}>
                  {recipe.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        <Field id="assign-date" label="Date">
          <Input
            id="assign-date"
            name="assignedOn"
            type="date"
            required
            defaultValue={today}
          />
        </Field>
      </div>

      <Field
        id="assign-note"
        label="Pourquoi pour cette personne"
        optional
        hint="Une phrase — « pour tes oméga-3, et tu aimes déjà ça »."
      >
        <Input id="assign-note" name="note" maxLength={500} />
      </Field>

      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" size="sm" disabled={pending || recipeId === ""}>
          <Plus aria-hidden="true" />
          {pending ? "Attribution…" : "Attribuer"}
        </Button>
        {state.error ? (
          <Typography size="sm" className="text-error-text" role="alert">
            {state.error}
          </Typography>
        ) : null}
      </div>
    </form>
  );
};
