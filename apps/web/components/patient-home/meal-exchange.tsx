"use client";

import { useState, useTransition } from "react";
import type { Locale, MealSuggestion } from "@remi/services/shared";
import { Button } from "@remi/ui";
import { Typography } from "@remi/ui/server";
import type { Content } from "@/lib/content/types";
import { anotherSuggestionAction } from "@/lib/meals/actions";
import type { PlannedMeal } from "@/lib/meals/state";
import { MealResult } from "./meal-result";

type Props = {
  locale: Locale;
  meal: PlannedMeal;
  /** REMI's first answer. Null when the patient's safety data could not be read. */
  suggestion: MealSuggestion | null;
  /** The server's ticket of the one second suggestion, or null. */
  retry: string | null;
  content: Content["patientMeal"]["saved"];
};

/**
 * `asking`: the two buttons show. `declined`: the patient said « Pas pour
 * moi » to the first suggestion, and the page offers one other. `closed`: the
 * closing text, and no button.
 */
type Phase = "asking" | "declined" | "closed";

const showsImprovement = (suggestion: MealSuggestion | null) =>
  suggestion?.answer.status === "answered" &&
  suggestion.answer.improvement.status === "shown";

/**
 * REMI's answer and the patient's answer to it (REM-103, stories 28 and 30):
 * « Ça me convient » or « Pas pour moi » under a suggestion, and one other
 * suggestion after a first « Pas pour moi ». No button shows when REMI gave no
 * improvement. The answer stays on this screen: nothing records it.
 *
 * The page hides the button after the second suggestion, and the server
 * refuses a ticket that was used: the limit does not depend on this component.
 */
export const MealExchange = ({
  locale,
  meal,
  suggestion,
  retry,
  content,
}: Props) => {
  const [second, setSecond] = useState<MealSuggestion | null>(null);
  const [phase, setPhase] = useState<Phase>("asking");
  const [pending, startTransition] = useTransition();
  const texts = content.suggestion.feedback;
  const current = second ?? suggestion;

  const decline = () => {
    setPhase(second === null && retry !== null ? "declined" : "closed");
  };

  const askAnother = () => {
    if (suggestion === null) {
      return;
    }
    startTransition(async () => {
      // With no second answer, the gate's alerts of the first one stay.
      let next: MealSuggestion = {
        ...suggestion,
        answer: { status: "unavailable" },
      };
      try {
        const result = await anotherSuggestionAction(locale, retry);
        if (result.status === "answered") {
          next = result.suggestion;
        }
      } catch {
        // A lost connection: the page shows that there is no other suggestion.
      }
      setSecond(next);
      setPhase("asking");
    });
  };

  const feedback = () => {
    if (!showsImprovement(current)) {
      return null;
    }
    if (phase === "closed") {
      return <Typography>{texts.closing}</Typography>;
    }
    if (phase === "declined") {
      return (
        <div className="flex flex-col gap-3">
          <Typography>{texts.declined}</Typography>
          <Button
            type="button"
            variant="outline"
            className="w-full"
            disabled={pending}
            onClick={askAnother}
          >
            {pending ? texts.anotherPending : texts.another}
          </Button>
        </div>
      );
    }
    return (
      <div className="grid grid-cols-2 gap-3">
        <Button
          type="button"
          size="sm"
          className="w-full"
          onClick={() => setPhase("closed")}
        >
          {texts.accept}
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="w-full"
          onClick={decline}
        >
          {texts.decline}
        </Button>
      </div>
    );
  };

  return (
    <MealResult
      meal={meal}
      suggestion={current}
      content={content}
      second={second !== null}
    >
      {feedback()}
    </MealResult>
  );
};
