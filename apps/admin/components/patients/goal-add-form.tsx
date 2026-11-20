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
 * Adding a goal: one free text, and it is required (story 16).
 *
 * The form is always on the page, because the number of goals has no limit.
 * The new goal goes to the end of the order.
 */
export const GoalAddForm = ({ patientId }: Props) => {
  const [state, action, pending] = useActionState(addGoalAction, initial);

  return (
    <form action={action} className="flex flex-col gap-4">
      <input type="hidden" name="patientId" value={patientId} />

      <Field id="new-goal-title" label="Objectif">
        <Input
          id="new-goal-title"
          name="title"
          required
          maxLength={160}
          placeholder="ex. Améliorer l'énergie"
        />
      </Field>

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
