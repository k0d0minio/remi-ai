"use client";

import { useRef, useState } from "react";
import { mealIntents, mealSlots } from "@remi/services/shared";
import { ChoiceChip, Field, Textarea, Typography } from "@remi/ui/server";
import { Button } from "@remi/ui";
import { logMealAction, type WriteState } from "@/lib/patient-link/actions";
import type { Content } from "@/lib/content/types";

type Props = {
  /** The whole credential, straight from the route — never a patient id. */
  token: string;
  locale: string;
  content: Content["patientLink"];
};

/**
 * § 8's opening move: « Je vais manger des spaghetti tomate ».
 *
 * The two sentences are two submit buttons on one form rather than a mode the
 * patient sets first — the intent *is* the press, so there is nothing to
 * choose and then confirm, and nothing to get wrong by leaving a toggle where
 * the last entry left it.
 *
 * The slot is chips and « Aucun » is one of them, selected by default: an
 * entry with no moment is a real entry, not a form left half-finished.
 */
export const MealEntryForm = ({ token, locale, content }: Props) => {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, setState] = useState<WriteState>({ error: null });

  return (
    <form
      ref={formRef}
      action={async (formData: FormData) => {
        const result = await logMealAction({ error: null }, formData);
        setState(result);
        if (!result.error) {
          // Cleared only on success: a refused write keeps what was typed, so
          // nobody has to write their dinner out twice.
          formRef.current?.reset();
        }
      }}
      className="flex flex-col gap-4"
    >
      <input type="hidden" name="token" value={token} />
      <input type="hidden" name="locale" value={locale} />

      <Field
        id="meal-entry-description"
        label={content.mealEntryDescriptionLabel}
        error={state.error ? content.mealWriteErrors[state.error] : undefined}
      >
        <Textarea
          id="meal-entry-description"
          name="description"
          required
          rows={2}
          maxLength={2000}
          placeholder={content.mealEntryPlaceholder}
        />
      </Field>

      <fieldset className="flex flex-col gap-2">
        <legend className="mb-1">
          <Typography as="span" size="sm" weight="medium">
            {content.mealEntrySlotLabel}
          </Typography>
        </legend>
        <div className="flex flex-wrap gap-2">
          <ChoiceChip
            name="slot"
            value=""
            label={content.mealEntrySlotNone}
            defaultChecked
          />
          {mealSlots.map((slot) => (
            <ChoiceChip
              key={slot}
              name="slot"
              value={slot}
              label={content.mealSlots[slot]}
            />
          ))}
        </div>
      </fieldset>

      <div className="flex flex-wrap gap-2">
        {mealIntents.map((intent) => (
          <Button
            key={intent}
            type="submit"
            name="intent"
            value={intent}
            variant={intent === "planned" ? "primary" : "outline"}
          >
            {content.mealIntentActions[intent]}
          </Button>
        ))}
      </div>
    </form>
  );
};
