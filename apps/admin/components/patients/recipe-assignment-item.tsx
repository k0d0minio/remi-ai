"use client";

import { ArchiveRestore, ArchiveX, Pencil } from "lucide-react";
import NextLink from "next/link";
import { useState } from "react";
import { formatDate, type AssignedRecipe } from "@remi/services/shared";
import { Button } from "@remi/ui";
import { Badge, Field, Input, Typography } from "@remi/ui/server";
import {
  archiveRecipeAssignmentAction,
  removeRecipeAssignmentAction,
  updateRecipeAssignmentAction,
} from "@/lib/patients/actions";

type Props = {
  entry: AssignedRecipe;
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
 */
export const RecipeAssignmentItem = ({ entry }: Props) => {
  const [editing, setEditing] = useState(false);
  const [confirmingRemove, setConfirmingRemove] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { assignment, recipe } = entry;
  const archived = assignment.archivedAt !== null;

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
