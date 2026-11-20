"use client";

import { useActionState, useState } from "react";
import { PLANNED_MEAL_MAX_LENGTH, type Locale } from "@remi/services/shared";
import { Button } from "@remi/ui";
import { Textarea, Typography } from "@remi/ui/server";
import { fill } from "@/lib/content/fill";
import type { Content } from "@/lib/content/types";
import { planMealAction } from "@/lib/meals/actions";
import { initialPlanMealState, type PlanMealState } from "@/lib/meals/state";
import { MealExchange } from "./meal-exchange";

type Props = {
  locale: Locale;
  /** The id of the page's question: the question is the field's label. */
  labelledBy: string;
  content: Content["patientMeal"];
};

/** The count shows only when this many characters or fewer are left. */
const COUNT_SHOWN_BELOW = 50;

const FIELD_ID = "planned-meal";

/**
 * « Qu'as-tu prévu de manger ? » (stories 28 and 31): one text field and the
 * one dominant button of the home page. After a save, the result takes the
 * place of the field.
 */
export const MealForm = ({ locale, labelledBy, content }: Props) => {
  // Controlled: React resets an uncontrolled form when its action returns, so
  // a refused send would remove the text that the patient typed.
  const [text, setText] = useState("");
  const [closedMealId, setClosedMealId] = useState<string | null>(null);
  const [state, formAction, pending] = useActionState(
    async (previous: PlanMealState, formData: FormData) => {
      const next = await planMealAction(previous, formData);
      if (next.status === "saved") {
        setText("");
      }
      return next;
    },
    initialPlanMealState,
  );

  if (state.status === "saved" && state.meal.id !== closedMealId) {
    return (
      <div role="status" className="flex flex-col gap-4">
        <MealExchange
          key={state.meal.id}
          locale={locale}
          meal={state.meal}
          suggestion={state.suggestion}
          retry={state.retry}
          content={content.saved}
        />
        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={() => setClosedMealId(state.meal.id)}
        >
          {content.saved.another}
        </Button>
      </div>
    );
  }

  const error = state.status === "error" ? content.errors[state.error] : null;
  const remaining = PLANNED_MEAL_MAX_LENGTH - text.length;
  const describedBy = [
    `${FIELD_ID}-hint`,
    error ? `${FIELD_ID}-error` : null,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <form action={formAction} noValidate className="flex flex-col gap-4">
      <input type="hidden" name="locale" value={locale} />
      <div className="flex flex-col gap-2">
        <Typography id={`${FIELD_ID}-hint`} size="sm" tone="muted">
          {content.hint}
        </Typography>
        <Textarea
          id={FIELD_ID}
          name="meal"
          rows={4}
          required
          maxLength={PLANNED_MEAL_MAX_LENGTH}
          placeholder={content.placeholder}
          aria-labelledby={labelledBy}
          aria-describedby={describedBy}
          invalid={error !== null}
          className="min-h-28 rounded-2xl"
          value={text}
          onChange={(event) => setText(event.target.value)}
        />
        {remaining <= COUNT_SHOWN_BELOW ? (
          <Typography size="sm" tone="muted" aria-live="polite">
            {fill(content.remaining, { count: Math.max(remaining, 0) })}
          </Typography>
        ) : null}
        {error ? (
          <Typography
            id={`${FIELD_ID}-error`}
            size="sm"
            className="text-error-text"
            role="alert"
          >
            {error}
          </Typography>
        ) : null}
      </div>
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? content.submitting : content.submit}
      </Button>
    </form>
  );
};
