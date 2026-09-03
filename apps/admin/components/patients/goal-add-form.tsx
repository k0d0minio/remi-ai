"use client";

import { Plus } from "lucide-react";
import { useActionState } from "react";
import { Button } from "@remi/ui";
import { Field, Input, Typography } from "@remi/ui/server";
import { addGoalAction, type GoalFormState } from "@/lib/patients/actions";

const initial: GoalFormState = { error: null };

type Props = {
  patientId: string;
};

/**
 * Adding a goal — her words, and where it starts.
 *
 * The page renders this only while there is room for another: § D's cap is the
 * service's refusal, and a form that offers what the service will refuse is a
 * form that teaches the wrong rule. The refusal still exists behind it, for the
 * second tab and the stale page.
 */
export const GoalAddForm = ({ patientId }: Props) => {
  const [state, action, pending] = useActionState(addGoalAction, initial);

  return (
    <form action={action} className="flex flex-col gap-4">
      <input type="hidden" name="patientId" value={patientId} />

      <div className="grid gap-4 sm:grid-cols-[1fr_14rem]">
        <Field id="new-goal-title" label="Objectif">
          <Input
            id="new-goal-title"
            name="title"
            required
            maxLength={160}
            placeholder="ex. Améliorer l'énergie"
          />
        </Field>

        <Field
          id="new-goal-baseline"
          label="Point de départ"
          optional
          hint="La mesure simple d'aujourd'hui — « énergie 3/10 »."
        >
          <Input id="new-goal-baseline" name="baseline" maxLength={160} />
        </Field>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" size="sm" disabled={pending}>
          <Plus aria-hidden="true" />
          {pending ? "Ajout…" : "Ajouter un objectif"}
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
