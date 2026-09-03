"use client";

import { Plus } from "lucide-react";
import { useActionState, useState } from "react";
import { Button } from "@remi/ui";
import { Field, Input, Textarea, Typography } from "@remi/ui/server";
import {
  addObservationAction,
  type ObservationFormState,
} from "@/lib/patients/actions";

const initial: ObservationFormState = { error: null };

type Props = {
  patientId: string;
  /** `YYYY-MM-DD`, resolved server-side. */
  today: string;
};

/**
 * Adding a learning that belongs to the patient rather than to one meal.
 *
 * Behind a button rather than always on screen, unlike the journal's quick-add:
 * this is the end-of-week pass, not the thing typed twenty times a week, and an
 * open form here would compete for the space the list itself needs.
 */
export const ObservationAddForm = ({ patientId, today }: Props) => {
  const [state, action, pending] = useActionState(
    addObservationAction,
    initial,
  );
  const [adding, setAdding] = useState(false);

  if (!adding) {
    return (
      <Button
        type="button"
        size="sm"
        variant="outline"
        className="w-fit"
        onClick={() => setAdding(true)}
      >
        <Plus aria-hidden="true" />
        Ajouter une observation
      </Button>
    );
  }

  return (
    <form
      action={action}
      className="border-border flex flex-col gap-4 rounded-lg border p-4"
    >
      <input type="hidden" name="patientId" value={patientId} />

      <div className="grid gap-4 sm:grid-cols-[12rem_1fr]">
        <Field id="new-observation-date" label="Jour">
          <Input
            id="new-observation-date"
            name="observedOn"
            type="date"
            required
            defaultValue={today}
          />
        </Field>

        <Field
          id="new-observation-body"
          label="Observation"
          hint="Ce que la semaine vous apprend et qui ne tient pas à un repas en particulier."
        >
          <Textarea
            id="new-observation-body"
            name="body"
            required
            rows={2}
            maxLength={1000}
            placeholder="ex. Prend toujours des yaourts sucrés le matin"
          />
        </Field>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Button type="submit" size="sm" disabled={pending}>
          {pending ? "Ajout…" : "Enregistrer l'observation"}
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
  );
};
