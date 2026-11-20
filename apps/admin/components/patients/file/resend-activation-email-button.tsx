"use client";

import { Send } from "lucide-react";
import { useActionState } from "react";
import { Button } from "@remi/ui";
import { Typography } from "@remi/ui/server";
import {
  resendActivationEmailAction,
  type ResendActivationEmailState,
} from "@/lib/patients/activation-email";

type Props = {
  patientId: string;
  /** No address to send to: the button does nothing. The card says why. */
  disabled: boolean;
};

const initial: ResendActivationEmailState = { error: null };

/**
 * « Renvoyer l'e-mail » (story 19), in the action card of an active file
 * whose e-mail did not go out. The server action checks the actor and the
 * audit trail again. A send that fails again shows in the card after the
 * reload, with its reason.
 */
export const ResendActivationEmailButton = ({ patientId, disabled }: Props) => {
  const [state, action, pending] = useActionState(
    resendActivationEmailAction,
    initial,
  );
  return (
    <form action={action} className="flex flex-col gap-2">
      <input type="hidden" name="id" value={patientId} />
      <Button
        type="submit"
        variant="outline"
        disabled={disabled || pending}
        className="w-full sm:w-fit"
      >
        <Send aria-hidden="true" />
        {pending ? "Envoi…" : "Renvoyer l'e-mail"}
      </Button>
      {state.error ? (
        <Typography size="sm" className="text-error-text" role="alert">
          {state.error}
        </Typography>
      ) : null}
    </form>
  );
};
