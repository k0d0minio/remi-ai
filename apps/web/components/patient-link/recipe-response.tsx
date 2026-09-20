"use client";

import { useOptimistic, useState, useTransition } from "react";
import { recipeResponses, type RecipeResponse } from "@remi/services/shared";
import { Button } from "@remi/ui";
import { Typography } from "@remi/ui/server";
import type { Content } from "@/lib/content/types";
import {
  respondToRecipeAction,
  type WriteState,
} from "@/lib/patient-link/actions";

type Props = {
  assignmentId: string;
  /** What this giving already carries, straight from the row. */
  answer: RecipeResponse | null;
  token: string;
  locale: string;
  content: Content["patientLink"]["recipeFeedback"];
};

/**
 * § 7's four buttons on one recipe: « J'aime · Pas pour moi · Trop long ·
 * À refaire », one tap, changeable.
 *
 * Three rules, and all three are about a thumb on a phone. One answer at a
 * time, so the four behave as a group rather than as four independent
 * toggles. Tapping the selected one clears it — a mis-tap has to be undoable
 * without a fifth control, and it is also how « À refaire » leaves the shelf.
 * And the choice moves before the server answers, because a button that waits
 * out a round-trip on a train reads as broken and gets tapped twice.
 *
 * The optimistic value is exactly that. The server action is the truth: React
 * drops the optimistic state when the transition ends, so a refusal leaves the
 * buttons showing what the row actually holds rather than a choice that was
 * never saved, and the refusal itself renders under them.
 *
 * Buttons rather than the radio `ChoiceChip` the meal form uses, and that is
 * the clearing rule: a radio cannot be unchecked by pressing it again, so the
 * gesture the spec asks for has no native form. `aria-pressed` is what carries
 * the state to a screen reader instead.
 */
export const RecipeResponseButtons = ({
  assignmentId,
  answer,
  token,
  locale,
  content,
}: Props) => {
  const [pending, startTransition] = useTransition();
  const [optimistic, setOptimistic] = useOptimistic(answer);
  const [state, setState] = useState<WriteState>({ error: null });

  const choose = (response: RecipeResponse) => {
    // The same button again is the gesture for "take it back".
    const next = optimistic === response ? null : response;
    const formData = new FormData();
    formData.set("id", assignmentId);
    formData.set("token", token);
    formData.set("locale", locale);
    formData.set("response", next ?? "");

    startTransition(async () => {
      setOptimistic(next);
      setState(await respondToRecipeAction({ error: null }, formData));
    });
  };

  return (
    <div className="flex flex-col gap-2">
      <fieldset className="flex flex-col gap-2">
        <legend className="mb-1">
          <Typography as="span" size="sm" tone="muted">
            {content.legend}
          </Typography>
        </legend>
        <div className="flex flex-wrap gap-2">
          {recipeResponses.map((response) => (
            <Button
              key={response}
              type="button"
              size="sm"
              variant={optimistic === response ? "primary" : "outline"}
              aria-pressed={optimistic === response}
              disabled={pending}
              className="min-h-11"
              onClick={() => choose(response)}
            >
              {content.answers[response]}
            </Button>
          ))}
        </div>
      </fieldset>
      {state.error ? (
        <Typography size="sm" className="text-error-text" role="alert">
          {content.errors[state.error]}
        </Typography>
      ) : null}
    </div>
  );
};
