"use client";

import { useState } from "react";
import { Typography } from "@remi/ui/server";
import { Button } from "@remi/ui";
import {
  markMealEatenAction,
  type WriteState,
} from "@/lib/patient-link/actions";
import type { Content } from "@/lib/content/types";

type Props = {
  mealId: string;
  token: string;
  locale: string;
  content: Content["patientLink"];
};

/**
 * « Je l'ai mangé » — the one control on an entry the patient wrote ahead.
 *
 * A client island rather than a client list: it is the only interactive thing
 * on the journal, so the list itself stays a server component and this is what
 * crosses the boundary. The refusal renders in place, because a planned meal
 * that quietly stays planned reads as a broken button.
 */
export const MealMarkEaten = ({ mealId, token, locale, content }: Props) => {
  const [state, setState] = useState<WriteState>({ error: null });

  return (
    <form
      action={async (formData: FormData) => {
        setState(await markMealEatenAction({ error: null }, formData));
      }}
      className="flex flex-wrap items-center gap-2"
    >
      <input type="hidden" name="id" value={mealId} />
      <input type="hidden" name="token" value={token} />
      <input type="hidden" name="locale" value={locale} />
      <Button type="submit" size="sm" variant="outline">
        {content.mealEntry.markEaten}
      </Button>
      {state.error ? (
        <Typography size="sm" className="text-error-text" role="alert">
          {content.mealEntry.errors[state.error]}
        </Typography>
      ) : null}
    </form>
  );
};
