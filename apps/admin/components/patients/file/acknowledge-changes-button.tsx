"use client";

import { Check, CheckCheck } from "lucide-react";
import { useActionState } from "react";
import { Button } from "@remi/ui";
import { Typography } from "@remi/ui/server";
import {
  acknowledgePatientChangesAction,
  type AcknowledgeChangesState,
} from "@/lib/patients/patient-changes";

type Props = {
  patientId: string;
  /** One change. Without it, the button closes each open change of the file. */
  changeId?: string;
  /** What the button acts on, for a screen reader: the name of the field. */
  subject?: string;
};

const initial: AcknowledgeChangesState = { error: null };

/**
 * « Pris en compte » (story 21), in the action card of the file. The server
 * action checks the actor again and the service writes the audit event. The
 * change leaves the card after the reload. It stays in the data.
 */
export const AcknowledgeChangesButton = ({
  patientId,
  changeId,
  subject,
}: Props) => {
  const [state, action, pending] = useActionState(
    acknowledgePatientChangesAction,
    initial,
  );
  const all = changeId === undefined;
  return (
    <form action={action} className="flex flex-col gap-2">
      <input type="hidden" name="id" value={patientId} />
      {all ? null : <input type="hidden" name="changeId" value={changeId} />}
      <Button
        type="submit"
        variant="outline"
        size="sm"
        disabled={pending}
        aria-label={subject ? `Pris en compte : ${subject}` : undefined}
        className="w-full sm:w-fit"
      >
        {all ? <CheckCheck aria-hidden="true" /> : <Check aria-hidden="true" />}
        {pending
          ? "Enregistrement…"
          : all
            ? "Tout marquer comme pris en compte"
            : "Pris en compte"}
      </Button>
      {state.error ? (
        <Typography size="sm" className="text-error-text" role="alert">
          {state.error}
        </Typography>
      ) : null}
    </form>
  );
};
