"use client";

import { ArchiveRestore, ArchiveX, Copy, Pencil, X } from "lucide-react";
import NextLink from "next/link";
import { useState } from "react";
import {
  formatDate,
  variantTitle,
  type AssignedRecipe,
} from "@remi/services/shared";
import { Button } from "@remi/ui";
import { Badge, Field, Input, Textarea, Typography } from "@remi/ui/server";
import {
  archiveRecipeAssignmentAction,
  duplicateAndAssignRecipeAction,
  removeRecipeAssignmentAction,
  updateRecipeAssignmentAction,
} from "@/lib/patients/actions";

type Props = {
  entry: AssignedRecipe;
  /** Today, resolved on the server so a date input never disagrees with it. */
  today: string;
};

/**
 * One recipe this person holds: the dish, her note, the date it was given.
 *
 * What is editable here is the giving — the note and the date. The recipe
 * itself is the library's, and the title links there, because editing it from a
 * patient's page would quietly change it for everyone else holding it.
 *
 * Archiving is the prominent control: it is how a recipe rotates out at the
 * weekly refresh, and the dated row it leaves behind is the record of what she
 * gave and when.
 *
 * « Dupliquer en variante » is the other way out of that constraint: rather
 * than editing what everyone holds, it copies the recipe, gives the copy to
 * this person, and retires this row — all in one save.
 */
export const RecipeAssignmentItem = ({ entry, today }: Props) => {
  const [editing, setEditing] = useState(false);
  const [duplicating, setDuplicating] = useState(false);
  const [confirmingRemove, setConfirmingRemove] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { assignment, recipe, origin } = entry;
  const archived = assignment.archivedAt !== null;

  if (duplicating) {
    return (
      <li className="border-border flex flex-col gap-4 rounded-lg border p-4">
        <form
          action={async (formData: FormData) => {
            const result = await duplicateAndAssignRecipeAction(
              { error: null },
              formData,
            );
            setError(result.error);
            if (!result.error) {
              setDuplicating(false);
            }
          }}
          className="flex flex-col gap-4"
        >
          <input type="hidden" name="patientId" value={assignment.patientId} />
          <input type="hidden" name="recipeId" value={recipe.id} />
          <input type="hidden" name="originTitle" value={recipe.title} />

          <div className="flex flex-col gap-1">
            <Typography as="h4" size="sm" weight="medium">
              Adapter pour cette personne
            </Typography>
            <Typography size="sm" tone="muted">
              Une copie part dans la bibliothèque et remplace « {recipe.title} »
              ici. Les autres personnes qui l&apos;ont gardent la version
              d&apos;origine.
            </Typography>
          </div>

          <Field id={`variant-title-${assignment.id}`} label="Titre">
            <Input
              id={`variant-title-${assignment.id}`}
              name="title"
              required
              maxLength={140}
              defaultValue={variantTitle(recipe.title)}
            />
          </Field>

          <Field id={`variant-body-${assignment.id}`} label="La recette">
            <Textarea
              id={`variant-body-${assignment.id}`}
              name="body"
              required
              rows={10}
              maxLength={4000}
              defaultValue={recipe.body}
            />
          </Field>

          <div className="grid gap-4 sm:grid-cols-[1fr_10rem]">
            <Field
              id={`variant-note-${assignment.id}`}
              label="Pourquoi pour cette personne"
              optional
            >
              <Input
                id={`variant-note-${assignment.id}`}
                name="note"
                maxLength={500}
                defaultValue={assignment.note}
              />
            </Field>

            <Field id={`variant-date-${assignment.id}`} label="Date">
              <Input
                id={`variant-date-${assignment.id}`}
                name="assignedOn"
                type="date"
                required
                defaultValue={today}
              />
            </Field>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button type="submit" size="sm">
              <Copy aria-hidden="true" />
              Créer la variante et attribuer
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => {
                setDuplicating(false);
                setError(null);
              }}
            >
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
      </li>
    );
  }

  if (editing) {
    return (
      <li className="border-border flex flex-col gap-4 rounded-lg border p-4">
        <form
          action={async (formData: FormData) => {
            const result = await updateRecipeAssignmentAction(
              { error: null },
              formData,
            );
            setError(result.error);
            if (!result.error) {
              setEditing(false);
            }
          }}
          className="flex flex-col gap-4"
        >
          <input type="hidden" name="id" value={assignment.id} />
          <input type="hidden" name="patientId" value={assignment.patientId} />
          <input type="hidden" name="title" value={recipe.title} />

          <Typography as="h4" size="sm" weight="medium">
            {recipe.title}
          </Typography>

          <div className="grid gap-4 sm:grid-cols-[1fr_10rem]">
            <Field id={`note-${assignment.id}`} label="Pourquoi" optional>
              <Input
                id={`note-${assignment.id}`}
                name="note"
                maxLength={500}
                defaultValue={assignment.note}
              />
            </Field>

            <Field id={`date-${assignment.id}`} label="Date">
              <Input
                id={`date-${assignment.id}`}
                name="assignedOn"
                type="date"
                required
                defaultValue={assignment.assignedOn}
              />
            </Field>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button type="submit" size="sm">
              Enregistrer
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => {
                setEditing(false);
                setError(null);
              }}
            >
              Annuler
            </Button>
            {error ? (
              <Typography size="sm" className="text-error-text" role="alert">
                {error}
              </Typography>
            ) : null}
          </div>
        </form>
      </li>
    );
  }

  return (
    <li className="border-border flex flex-col gap-2 rounded-lg border p-4">
      <div className="flex flex-wrap items-center gap-2">
        <NextLink
          href={`/recipes/${recipe.id}`}
          className="focus-visible:ring-ring/40 rounded-sm focus-visible:outline-none focus-visible:ring-[3px]"
        >
          <Typography as="h4" size="sm" weight="medium">
            {recipe.title}
          </Typography>
        </NextLink>
        <Badge variant="neutral" tone="subtle" size="sm">
          {formatDate(assignment.assignedOn)}
        </Badge>
        {archived ? (
          <Badge variant="neutral" tone="subtle" size="sm">
            archivée
          </Badge>
        ) : null}
      </div>

      {origin ? (
        <Typography size="sm" tone="muted">
          variante de{" "}
          <NextLink
            href={`/recipes/${origin.id}`}
            className="hover:text-foreground underline underline-offset-2"
          >
            {origin.title}
          </NextLink>
        </Typography>
      ) : null}

      {assignment.note ? (
        <Typography size="sm" tone="muted">
          {assignment.note}
        </Typography>
      ) : null}

      <Typography size="sm" className="whitespace-pre-line">
        {recipe.body}
      </Typography>

      <div className="flex flex-wrap items-center gap-1">
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={() => setEditing(true)}
        >
          <Pencil aria-hidden="true" />
          Modifier le mot
        </Button>

        {archived ? null : (
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={() => setDuplicating(true)}
          >
            <Copy aria-hidden="true" />
            Dupliquer en variante
          </Button>
        )}

        <form action={archiveRecipeAssignmentAction}>
          <input type="hidden" name="id" value={assignment.id} />
          <input type="hidden" name="patientId" value={assignment.patientId} />
          <input type="hidden" name="title" value={recipe.title} />
          <input
            type="hidden"
            name="archived"
            value={archived ? "false" : "true"}
          />
          <Button type="submit" size="sm" variant="ghost">
            {archived ? (
              <ArchiveRestore aria-hidden="true" />
            ) : (
              <ArchiveX aria-hidden="true" />
            )}
            {archived ? "Réattribuer" : "Archiver"}
          </Button>
        </form>

        {confirmingRemove ? (
          <>
            <form action={removeRecipeAssignmentAction}>
              <input type="hidden" name="id" value={assignment.id} />
              <input
                type="hidden"
                name="patientId"
                value={assignment.patientId}
              />
              <input type="hidden" name="title" value={recipe.title} />
              <Button type="submit" size="sm" variant="error">
                Supprimer définitivement
              </Button>
            </form>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => setConfirmingRemove(false)}
            >
              Annuler
            </Button>
          </>
        ) : (
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={() => setConfirmingRemove(true)}
          >
            Supprimer
          </Button>
        )}
      </div>
    </li>
  );
};
