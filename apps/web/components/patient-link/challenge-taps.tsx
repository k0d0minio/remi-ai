"use client";

import { Check } from "lucide-react";
import { useState } from "react";
import { Typography } from "@remi/ui/server";
import { Button } from "@remi/ui";
import {
  tapChallengeAction,
  type WriteState,
} from "@/lib/patient-link/actions";
import type { Content } from "@/lib/content/types";

type Props = {
  challengeId: string;
  acquired: boolean;
  readyForNext: boolean;
  token: string;
  locale: string;
  content: Content["patientLink"];
};

type Tap = "acquired" | "ready_for_next";

/**
 * « Challenge acquis », then « Prêt(e) pour le prochain » — the only
 * interactive part of the card, so the card stays a server component and this
 * is what crosses the boundary.
 *
 * Each button is a toggle (`aria-pressed`) and posts the state it moves to.
 * The second appears only once the first is set: ready for the next one is
 * only true of an acquired habit, and the service refuses it otherwise.
 */
export const ChallengeTaps = ({
  challengeId,
  acquired,
  readyForNext,
  token,
  locale,
  content,
}: Props) => {
  const [state, setState] = useState<WriteState>({ error: null });

  const tap = (which: Tap, pressed: boolean, label: string) => (
    <form
      action={async (formData: FormData) => {
        setState(await tapChallengeAction({ error: null }, formData));
      }}
    >
      <input type="hidden" name="id" value={challengeId} />
      <input type="hidden" name="token" value={token} />
      <input type="hidden" name="locale" value={locale} />
      <input type="hidden" name="tap" value={which} />
      <input type="hidden" name="on" value={pressed ? "false" : "true"} />
      <Button
        type="submit"
        size="sm"
        variant={pressed ? "primary" : "outline"}
        aria-pressed={pressed}
        className="min-h-11"
      >
        {pressed ? <Check aria-hidden="true" /> : null}
        {label}
      </Button>
    </form>
  );

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-2">
        {tap("acquired", acquired, content.challenge.acquired)}
        {acquired
          ? tap("ready_for_next", readyForNext, content.challenge.readyForNext)
          : null}
      </div>
      {state.error ? (
        <Typography size="sm" className="text-error-text" role="alert">
          {content.challenge.errors[state.error]}
        </Typography>
      ) : null}
    </div>
  );
};
