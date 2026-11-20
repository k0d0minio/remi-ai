"use client";

import { Sparkles } from "lucide-react";
import { useActionState } from "react";
import { Button } from "@remi/ui";
import { Typography } from "@remi/ui/server";
import {
  proposeFirstLotAction,
  type FoodFormState,
} from "@/lib/foods/actions";

const idle: FoodFormState = { error: null, saved: null };

/**
 * REMI proposes a record for each everyday food of the first lot that has
 * none. Each proposal then waits in « À confirmer »: this button confirms
 * nothing.
 */
export const FirstLotButton = () => {
  const [state, action, pending] = useActionState(proposeFirstLotAction, idle);
  return (
    <form action={action} className="flex flex-col gap-2">
      <div>
        <Button type="submit" variant="outline" size="sm" disabled={pending}>
          <Sparkles aria-hidden="true" />
          {pending
            ? "REMI prépare les fiches…"
            : "Proposer un premier lot d'aliments courants"}
        </Button>
      </div>
      {pending ? (
        <Typography size="xs" tone="muted" role="status">
          Cela prend jusqu&apos;à une minute. Restez sur la page.
        </Typography>
      ) : null}
      {state.error ? (
        <Typography size="sm" className="text-error-text" role="alert">
          {state.error}
        </Typography>
      ) : null}
      {state.saved && !state.error ? (
        <Typography size="sm" tone="muted" role="status">
          {state.saved}
        </Typography>
      ) : null}
    </form>
  );
};
