"use client";

import { ArchiveRestore, ArchiveX, Pencil } from "lucide-react";
import { useState } from "react";
import type { PatientObservation } from "@remi/services/shared";
import { Field, Input, Textarea, Typography } from "@remi/ui/server";
import { Button } from "@remi/ui";
import {
  archiveObservationAction,
  deleteObservationAction,
  updateObservationAction,
} from "@/lib/patients/actions";

type Props = {
  observation: PatientObservation;
};

/**
 * The controls on a standalone observation, rendered by the learnings view
 * beneath the line itself.
 *
 * A per-entry learning has no equivalent here on purpose: it is edited on its
 * meal, where the thing it was noticed about is on screen. Splitting that edit
 * across two places would let the two drift.
 */
export const ObservationItem = ({ observation }: Props) => {
  const [editing, setEditing] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const archived = observation.archivedAt !== null;

  if (editing) {
    return (
      <form
        action={async (formData: FormData) => {
          const result = await updateObservationAction(
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
        <input type="hidden" name="id" value={observation.id} />
        <input type="hidden" name="patientId" value={observation.patientId} />

        <div className="grid gap-4 sm:grid-cols-[12rem_1fr]">
          <Field id={`observation-date-${observation.id}`} label="Jour">
            <Input
              id={`observation-date-${observation.id}`}
              name="observedOn"
              type="date"
              required
              defaultValue={observation.observedOn}
            />
          </Field>

          <Field id={`observation-body-${observation.id}`} label="Observation">
            <Textarea
              id={`observation-body-${observation.id}`}
              name="body"
              required
              rows={2}
              maxLength={1000}
              defaultValue={observation.body}
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
    );
  }

  return (
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

      <form action={archiveObservationAction}>
        <input type="hidden" name="id" value={observation.id} />
        <input type="hidden" name="patientId" value={observation.patientId} />
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
          {archived ? "Réactiver" : "Archiver"}
        </Button>
      </form>

      {confirmingDelete ? (
        <>
          <form action={deleteObservationAction}>
            <input type="hidden" name="id" value={observation.id} />
            <input
              type="hidden"
              name="patientId"
              value={observation.patientId}
            />
            <input type="hidden" name="body" value={observation.body} />
            <Button type="submit" size="sm" variant="error">
              Supprimer définitivement
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
  );
};
