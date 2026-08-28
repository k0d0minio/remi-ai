"use client";

import { Pencil, Plus } from "lucide-react";
import { useActionState, useState } from "react";
import type { PatientNote } from "@remi/services/shared";
import { formatDate } from "@remi/services/shared";
import { Button } from "@remi/ui";
import { Field, Input, Textarea, Typography } from "@remi/ui/server";
import {
  addNoteAction,
  deleteNoteAction,
  updateNoteAction,
  type NoteFormState,
} from "@/lib/patients/actions";

const initial: NoteFormState = { error: null };

type Props = {
  patientId: string;
  notes: readonly PatientNote[];
  /** `YYYY-MM-DD`, computed on the server so the default is not the browser's clock. */
  today: string;
};

/**
 * The consultation history — one dated note per session, newest first.
 *
 * The date is a field rather than the moment of writing, because Morgane writes
 * these up after the fact and the timeline has to read in the order the
 * consultations happened. Nothing here reaches the patient link: these are her
 * working notes, written in clinical shorthand for herself.
 */
export const NoteTimeline = ({ patientId, notes, today }: Props) => {
  const [state, action, pending] = useActionState(addNoteAction, initial);
  const [adding, setAdding] = useState(false);

  return (
    <div className="flex flex-col gap-6">
      {adding ? (
        <form
          action={action}
          className="border-border flex flex-col gap-4 rounded-lg border p-4"
        >
          <input type="hidden" name="patientId" value={patientId} />

          <div className="grid gap-4 sm:grid-cols-[12rem_1fr]">
            <Field id="note-date" label="Date de la consultation">
              <Input
                id="note-date"
                name="occurredAt"
                type="date"
                required
                defaultValue={today}
              />
            </Field>

            <Field id="note-title" label="Intitulé" optional>
              <Input
                id="note-title"
                name="title"
                placeholder="ex. Deuxième consultation"
              />
            </Field>
          </div>

          <Field id="note-body" label="Notes" optional>
            <Textarea id="note-body" name="body" rows={6} />
          </Field>

          <div className="flex flex-wrap items-center gap-2">
            <Button type="submit" size="sm" disabled={pending}>
              {pending ? "Enregistrement…" : "Enregistrer la note"}
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => setAdding(false)}
            >
              Annuler
            </Button>
            {state.error ? (
              <Typography size="sm" className="text-error-text" role="alert">
                {state.error}
              </Typography>
            ) : null}
          </div>
        </form>
      ) : (
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="w-fit"
          onClick={() => setAdding(true)}
        >
          <Plus aria-hidden="true" />
          Ajouter une note
        </Button>
      )}

      {notes.length === 0 ? (
        <Typography size="sm" tone="muted">
          Aucune consultation notée pour le moment.
        </Typography>
      ) : (
        <ol className="flex flex-col gap-3">
          {notes.map((note) => (
            <NoteItem key={note.id} note={note} />
          ))}
        </ol>
      )}
    </div>
  );
};

const NoteItem = ({ note }: { note: PatientNote }) => {
  const [editing, setEditing] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (editing) {
    return (
      <li className="border-border flex flex-col gap-4 rounded-lg border p-4">
        <form
          action={async (formData: FormData) => {
            const result = await updateNoteAction({ error: null }, formData);
            setError(result.error);
            if (!result.error) {
              setEditing(false);
            }
          }}
          className="flex flex-col gap-4"
        >
          <input type="hidden" name="id" value={note.id} />
          <input type="hidden" name="patientId" value={note.patientId} />

          <div className="grid gap-4 sm:grid-cols-[12rem_1fr]">
            <Field id={`date-${note.id}`} label="Date de la consultation">
              <Input
                id={`date-${note.id}`}
                name="occurredAt"
                type="date"
                required
                defaultValue={note.occurredAt}
              />
            </Field>

            <Field id={`title-${note.id}`} label="Intitulé" optional>
              <Input
                id={`title-${note.id}`}
                name="title"
                defaultValue={note.title}
              />
            </Field>
          </div>

          <Field id={`body-${note.id}`} label="Notes" optional>
            <Textarea
              id={`body-${note.id}`}
              name="body"
              rows={6}
              defaultValue={note.body}
            />
          </Field>

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
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <Typography as="h4" size="sm" weight="medium">
          {formatDate(note.occurredAt)}
        </Typography>
        {note.title ? (
          <Typography as="span" size="sm">
            {note.title}
          </Typography>
        ) : null}
        {note.authorName ? (
          <Typography as="span" size="xs" tone="muted" className="ml-auto">
            {note.authorName}
          </Typography>
        ) : null}
      </div>

      {note.body ? (
        <Typography size="sm" tone="muted" className="whitespace-pre-line">
          {note.body}
        </Typography>
      ) : null}

      <div className="flex flex-wrap items-center gap-1">
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={() => setEditing(true)}
        >
          <Pencil aria-hidden="true" />
          Modifier
        </Button>

        {confirmingDelete ? (
          <>
            <form action={deleteNoteAction}>
              <input type="hidden" name="id" value={note.id} />
              <input type="hidden" name="patientId" value={note.patientId} />
              <input type="hidden" name="occurredAt" value={note.occurredAt} />
              <Button type="submit" size="sm" variant="error">
                Confirmer la suppression
              </Button>
            </form>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => setConfirmingDelete(false)}
            >
              Annuler
            </Button>
          </>
        ) : (
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={() => setConfirmingDelete(true)}
          >
            Supprimer
          </Button>
        )}
      </div>
    </li>
  );
};
