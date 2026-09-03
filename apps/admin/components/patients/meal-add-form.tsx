"use client";

import { ChevronDown, Plus } from "lucide-react";
import { useActionState, useState } from "react";
import { Button } from "@remi/ui";
import { Field, Input, Textarea, Typography } from "@remi/ui/server";
import { MealSlotField } from "@/components/patients/meal-slot-field";
import { addMealEntryAction, type MealFormState } from "@/lib/patients/actions";

const initial: MealFormState = { error: null };

type Props = {
  patientId: string;
  /** `YYYY-MM-DD`, resolved server-side — not the browser's idea of today. */
  today: string;
};

/**
 * Quick-add, tuned for the moment it is actually used: standing in the WhatsApp
 * thread, on a phone, pasting what someone sent.
 *
 * So two fields are on screen — the day and what was eaten — with the date
 * already filled in and freely backdatable, because she logs Tuesday's lunch on
 * Thursday. Everything else is behind one disclosure: their comment, her
 * feedback and the learning are all things that usually arrive later, on a
 * second pass over the entry, and a form that asks for them up front is the
 * form § 7 warns she stops filling in.
 */
export const MealAddForm = ({ patientId, today }: Props) => {
  const [state, action, pending] = useActionState(addMealEntryAction, initial);
  const [expanded, setExpanded] = useState(false);

  return (
    <form action={action} className="flex flex-col gap-4">
      <input type="hidden" name="patientId" value={patientId} />

      <div className="grid gap-4 sm:grid-cols-[12rem_1fr]">
        <Field id="new-meal-date" label="Jour du repas">
          <Input
            id="new-meal-date"
            name="eatenOn"
            type="date"
            required
            defaultValue={today}
          />
        </Field>

        <Field
          id="new-meal-description"
          label="Ce qui a été mangé"
          hint="Votre transcription de la photo ou du message."
        >
          <Textarea
            id="new-meal-description"
            name="description"
            required
            rows={3}
            maxLength={2000}
            placeholder="ex. Saumon, riz complet, courgettes"
          />
        </Field>
      </div>

      <MealSlotField name="slot" selected={null} />

      {expanded ? (
        <div className="flex flex-col gap-4">
          <Field
            id="new-meal-comment"
            label="Ce que la personne en a dit"
            optional
          >
            <Textarea
              id="new-meal-comment"
              name="patientComment"
              rows={2}
              maxLength={1000}
              placeholder="ex. J'avais très faim ce soir-là"
            />
          </Field>

          <Field
            id="new-meal-feedback"
            label="Votre retour"
            optional
            hint="Ce qui est déjà bien, puis une ou deux priorités."
          >
            <Textarea
              id="new-meal-feedback"
              name="feedback"
              rows={3}
              maxLength={2000}
            />
          </Field>

          <Field
            id="new-meal-learning"
            label="À retenir"
            optional
            hint="Un aliment souvent choisi, une recette appréciée, une difficulté qui revient."
          >
            <Input id="new-meal-learning" name="learning" maxLength={500} />
          </Field>
        </div>
      ) : (
        <Button
          type="button"
          size="sm"
          variant="ghost"
          className="w-fit"
          onClick={() => setExpanded(true)}
        >
          <ChevronDown aria-hidden="true" />
          Ajouter leur commentaire, un retour, un à-retenir
        </Button>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" size="sm" disabled={pending}>
          <Plus aria-hidden="true" />
          {pending ? "Ajout…" : "Ajouter le repas"}
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
