"use client";

import { NotebookPen, Plus, X } from "lucide-react";
import { useState } from "react";
import type { Recipe } from "@remi/services/shared";
import { Button, Checkbox } from "@remi/ui";
import { Field, Input, Textarea, Typography } from "@remi/ui/server";
import {
  assignRecipesAction,
  createAndAssignRecipeAction,
  type AssignmentFormState,
} from "@/lib/patients/actions";
import { CopyFromPatient } from "@/components/patients/copy-from-patient";

const initial: AssignmentFormState = { error: null };

type Props = {
  patientId: string;
  /** The active library only — an archived recipe is not offered again. */
  recipes: readonly Recipe[];
  /** Today, resolved on the server so a date input never disagrees with it. */
  today: string;
};

/**
 * Giving recipes: pick several, say why for this person, date them — or write
 * a new one here and hand it over in the same save.
 *
 * Two gestures, one surface, because they answer the same question at the same
 * moment. The multi-select is the bulk principle applied to the section that
 * needed it most: a week's inspirations are chosen together, so they are given
 * together, with one note and one date rather than four round-trips through
 * these same three fields.
 *
 * « Proposer une recette » is offered whether or not the library has anything
 * in it. It used to say go and write one in « Recettes » and stop there, which
 * is a dead end in the middle of a consultation.
 */
export const AssignRecipeForm = ({ patientId, recipes, today }: Props) => {
  const [writing, setWriting] = useState(false);

  return writing ? (
    <RecipeInPlaceForm
      patientId={patientId}
      today={today}
      onDone={() => setWriting(false)}
    />
  ) : (
    <div className="flex flex-col gap-4">
      {recipes.length === 0 ? (
        <Typography size="sm" tone="muted">
          La bibliothèque est vide — écrivez la première recette ici.
        </Typography>
      ) : (
        <AssignExistingForm
          patientId={patientId}
          recipes={recipes}
          today={today}
        />
      )}

      <div>
        <Button
          type="button"
          size="sm"
          variant={recipes.length === 0 ? "primary" : "ghost"}
          onClick={() => setWriting(true)}
        >
          <NotebookPen aria-hidden="true" />
          Proposer une recette
        </Button>
      </div>
    </div>
  );
};

/**
 * The selection is held here rather than read off the form on submit: the
 * button's count and its disabled state both need it before anything is
 * posted. The checkboxes still carry the values — one `recipeId` per ticked
 * row — so the action reads a list, not this state.
 */
const AssignExistingForm = ({ patientId, recipes, today }: Props) => {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [chosen, setChosen] = useState<readonly string[]>([]);

  const toggle = (id: string, checked: boolean) => {
    setChosen((current) =>
      checked ? [...current, id] : current.filter((entry) => entry !== id),
    );
  };

  /**
   * Reusing another patient's set ticks the same recipes here, unsaved: this
   * selection *is* this section's grid, so « Reprendre de … » lands in it
   * exactly as a copied row lands in a protocol grid. The note stays blank and
   * the date stays today — the giving is what is personal, and it is written
   * for this patient or not at all.
   */
  const reuse = (recipeIds: readonly string[]) => {
    const known = recipeIds.filter((id) =>
      recipes.some((recipe) => recipe.id === id),
    );
    setChosen((current) => [
      ...current,
      ...known.filter((id) => !current.includes(id)),
    ]);
  };

  const titles = recipes
    .filter((recipe) => chosen.includes(recipe.id))
    .map((recipe) => recipe.title)
    .join(", ");

  return (
    <form
      action={async (formData: FormData) => {
        setPending(true);
        try {
          const result = await assignRecipesAction(initial, formData);
          setError(result.error);
          // Clearing the ticks is part of the save, not cosmetics: React resets
          // the form's own fields, so a selection left ticked would post a
          // different set than the one on screen.
          if (!result.error) {
            setChosen([]);
          }
        } finally {
          setPending(false);
        }
      }}
      className="flex flex-col gap-4"
    >
      <input type="hidden" name="patientId" value={patientId} />
      <input type="hidden" name="titles" value={titles} />

      <CopyFromPatient
        patientId={patientId}
        kind="recipe"
        emptyLabel="aucune recette en cours"
        onTaken={(taken) => reuse(taken.recipeIds)}
      />

      <fieldset className="flex flex-col gap-2">
        <Typography as="legend" size="sm" weight="medium" className="mb-2">
          Recettes
        </Typography>
        <div className="border-border max-h-64 overflow-y-auto rounded-lg border">
          {recipes.map((recipe) => (
            <label
              key={recipe.id}
              className="hover:bg-muted/50 border-border flex cursor-pointer items-center gap-3 border-b p-3 last:border-b-0"
            >
              <Checkbox
                name="recipeId"
                value={recipe.id}
                checked={chosen.includes(recipe.id)}
                onCheckedChange={(checked) =>
                  toggle(recipe.id, checked === true)
                }
              />
              <Typography size="sm">{recipe.title}</Typography>
            </label>
          ))}
        </div>
      </fieldset>

      <Field id="assign-date" label="Date">
        <Input
          id="assign-date"
          name="assignedOn"
          type="date"
          required
          defaultValue={today}
          className="sm:max-w-[10rem]"
        />
      </Field>

      <Field
        id="assign-note"
        label="Pourquoi pour cette personne"
        optional
        hint="Une phrase — « pour tes oméga-3, et tu aimes déjà ça ». Elle vaut pour toutes les recettes cochées."
      >
        <Input id="assign-note" name="note" maxLength={500} />
      </Field>

      <div className="flex flex-wrap items-center gap-3">
        <Button
          type="submit"
          size="sm"
          disabled={pending || chosen.length === 0}
        >
          <Plus aria-hidden="true" />
          {pending
            ? "Attribution…"
            : chosen.length > 1
              ? `Attribuer ${chosen.length} recettes`
              : "Attribuer"}
        </Button>
        {error ? (
          <Typography size="sm" className="text-error-text" role="alert">
            {error}
          </Typography>
        ) : null}
      </div>
    </form>
  );
};

type InPlaceProps = {
  patientId: string;
  today: string;
  onDone: () => void;
};

/**
 * The recipe form, here, on the patient's page — § 7's « attribuer au patient
 * directement lors de la création ».
 *
 * No tags field: this is the fast path, and a recipe written between two
 * sentences of a consultation gets tagged later from « Recettes », or never.
 * The row still lands in the shared library — this is a quicker way in, not a
 * private copy per patient.
 */
const RecipeInPlaceForm = ({ patientId, today, onDone }: InPlaceProps) => {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  return (
    <form
      action={async (formData: FormData) => {
        setPending(true);
        try {
          const result = await createAndAssignRecipeAction(initial, formData);
          setError(result.error);
          if (!result.error) {
            onDone();
          }
        } finally {
          // Without this the form stays disabled at "Enregistrement…" on a
          // throw, and the only way out discards what she just typed.
          setPending(false);
        }
      }}
      className="border-border flex flex-col gap-4 rounded-lg border p-4"
    >
      <input type="hidden" name="patientId" value={patientId} />

      <Typography as="h4" size="sm" weight="medium">
        Nouvelle recette
      </Typography>

      <Field id="in-place-title" label="Titre">
        <Input
          id="in-place-title"
          name="title"
          required
          maxLength={140}
          placeholder="ex. Tartine de sardines"
        />
      </Field>

      <Field
        id="in-place-body"
        label="La recette"
        hint="Ingrédients et étapes, comme vous les écrivez déjà."
      >
        <Textarea
          id="in-place-body"
          name="body"
          required
          rows={8}
          maxLength={4000}
        />
      </Field>

      <div className="grid gap-4 sm:grid-cols-[1fr_10rem]">
        <Field
          id="in-place-note"
          label="Pourquoi pour cette personne"
          optional
          hint="Une phrase."
        >
          <Input id="in-place-note" name="note" maxLength={500} />
        </Field>

        <Field id="in-place-date" label="Date">
          <Input
            id="in-place-date"
            name="assignedOn"
            type="date"
            required
            defaultValue={today}
          />
        </Field>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Button type="submit" size="sm" disabled={pending}>
          <Plus aria-hidden="true" />
          {pending ? "Enregistrement…" : "Créer et attribuer"}
        </Button>
        <Button type="button" size="sm" variant="ghost" onClick={onDone}>
          <X aria-hidden="true" />
          Annuler
        </Button>
        {error ? (
          <Typography size="sm" className="text-error-text" role="alert">
            {error}
          </Typography>
        ) : null}
      </div>
    </form>
  );
};
