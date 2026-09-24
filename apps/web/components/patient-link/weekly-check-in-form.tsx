"use client";

import { useState } from "react";
import type { PatientGoal } from "@remi/services/shared";
import { goalScores } from "@remi/services/shared";
import { ChoiceChip, Field, Textarea, Typography } from "@remi/ui/server";
import { Button } from "@remi/ui";
import {
  weeklyCheckInAction,
  type WriteState,
} from "@/lib/patient-link/actions";
import type { Content } from "@/lib/content/types";

type Props = {
  goals: readonly PatientGoal[];
  /** The whole credential, straight from the route — never a patient id. */
  token: string;
  locale: string;
  content: Content["patientLink"];
};

/**
 * Her 0–5 per goal, every active goal on one form (D-30).
 *
 * A goal left without a number is left unrated rather than refused — only a
 * form with no number at all is. The scores are radio chips with nothing
 * pre-selected, so an untouched goal posts nothing and a tap is the answer.
 */
export const WeeklyCheckInForm = ({ goals, token, locale, content }: Props) => {
  const [state, setState] = useState<WriteState>({ error: null });
  const copy = content.weeklyCheckIn;

  return (
    <form
      action={async (formData: FormData) => {
        setState(await weeklyCheckInAction({ error: null }, formData));
      }}
      className="flex flex-col gap-5"
    >
      <input type="hidden" name="token" value={token} />
      <input type="hidden" name="locale" value={locale} />

      {goals.map((goal) => (
        <fieldset key={goal.id} className="flex flex-col gap-2">
          <input type="hidden" name="goal" value={goal.id} />
          <legend className="mb-1">
            <Typography as="span" size="sm">
              {copy.question}{" "}
              <Typography as="span" size="sm" weight="semibold">
                {goal.title}
              </Typography>
            </Typography>
          </legend>
          <div className="flex flex-wrap gap-2">
            {goalScores.map((score) => (
              <ChoiceChip
                key={score}
                name={`score-${goal.id}`}
                value={String(score)}
                label={String(score)}
              />
            ))}
          </div>
          <Field id={`note-${goal.id}`} label={copy.noteLabel}>
            <Textarea
              id={`note-${goal.id}`}
              name={`note-${goal.id}`}
              rows={1}
              maxLength={2000}
            />
          </Field>
        </fieldset>
      ))}

      <Typography size="xs" tone="muted">
        {copy.scaleLow} · {copy.scaleHigh}
      </Typography>

      <div className="flex flex-col gap-2">
        <Button type="submit" className="min-h-11 self-start">
          {copy.submit}
        </Button>
        {state.error ? (
          <Typography size="sm" className="text-error-text" role="alert">
            {copy.errors[state.error]}
          </Typography>
        ) : null}
      </div>
    </form>
  );
};
