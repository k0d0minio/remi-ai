"use client";

import { useState } from "react";
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
  // Controlled, and that is the whole reason: React resets an *uncontrolled*
  // form itself once a function action returns, success or not, so a refused
  // write would wipe the meal the patient just typed while telling them to
  // check it. Holding the text in state means the reset has nothing to clear
  // and this component decides when it goes — which is on success only.
  const [description, setDescription] = useState("");
  const [state, setState] = useState<WriteState>({ error: null });

  return (
    <form
      action={async (formData: FormData) => {
        const result = await logMealAction({ error: null }, formData);
        setState(result);
        if (!result.error) {
          setDescription("");
        }
      }}
      className="flex flex-col gap-4"
    >
      <input type="hidden" name="token" value={token} />
      <input type="hidden" name="locale" value={locale} />

      <Field
        id="meal-entry-description"
        label={content.mealEntry.descriptionLabel}
        error={state.error ? content.mealEntry.errors[state.error] : undefined}
      >
        <Textarea
          id="meal-entry-description"
          name="description"
          required
          rows={2}
          maxLength={2000}
          placeholder={content.mealEntry.placeholder}
          value={description}
          onChange={(event) => setDescription(event.target.value)}
        />
      </Field>

      <fieldset className="flex flex-col gap-2">
        <legend className="mb-1">
          <Typography as="span" size="sm" weight="medium">
            {content.mealEntry.slotLabel}
          </Typography>
        </legend>
        <div className="flex flex-wrap gap-2">
          <ChoiceChip
            name="slot"
            value=""
            label={content.mealEntry.slotNone}
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
            className="min-h-11"
          >
            {content.mealEntry.actions[intent]}
          </Button>
        ))}
      </div>
    </form>
  );
};
