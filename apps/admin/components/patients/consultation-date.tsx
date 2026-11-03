"use client";

import { Pencil } from "lucide-react";
import { useActionState, useState } from "react";
import { Button } from "@remi/ui";
import { Input, Typography } from "@remi/ui/server";
import {
  setConsultationDateAction,
  type ConsultationDateFormState,
} from "@/lib/patients/actions";

type Props = {
  patientId: string;
  /** `YYYY-MM-DD`, the value the date input takes. Null is « Non renseigné ». */
  value: string | null;
  /** The same date, formatted on the server: the server is the one clock. */
  formatted: string | null;
};

const initial: ConsultationDateFormState = { error: null, saved: false };

/**
 * The file's consultation date on the working view (`appointment-date`). The
 * practitioner sets, changes or clears it here without opening « Modifier ».
 * It writes `consultation_date`, the column the questionnaire's « Date de
 * consultation » writes too.
 */
export const ConsultationDate = ({ patientId, value, formatted }: Props) => {
  const [editing, setEditing] = useState(false);
  const [state, formAction, pending] = useActionState(
    async (previous: ConsultationDateFormState, formData: FormData) => {
      const next = await setConsultationDateAction(previous, formData);
      if (next.saved) {
        setEditing(false);
      }
      return next;
    },
    initial,
  );

  if (editing) {
    return (
      <form action={formAction} className="flex flex-col gap-2">
        <input type="hidden" name="patientId" value={patientId} />
        <Input
          type="date"
          name="consultationDate"
          defaultValue={value ?? ""}
          aria-label="Date de consultation"
          className="w-fit"
          autoFocus
        />
        {state.error ? (
          <Typography size="sm" className="text-destructive" role="alert">
            {state.error}
          </Typography>
        ) : null}
        <div className="flex flex-wrap items-center gap-2">
          <Button type="submit" size="sm" disabled={pending}>
            {pending ? "Enregistrement…" : "Enregistrer"}
          </Button>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={() => setEditing(false)}
          >
            Annuler
          </Button>
        </div>
      </form>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Typography size="sm" tone={formatted ? "default" : "muted"}>
          {formatted ?? "Non renseigné"}
        </Typography>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => setEditing(true)}
          >
            <Pencil aria-hidden="true" />
            {value ? "Modifier" : "Renseigner"}
          </Button>
          {value ? (
            // A clear is a save of the empty value, in one tap.
            <form action={formAction}>
              <input type="hidden" name="patientId" value={patientId} />
              <input type="hidden" name="consultationDate" value="" />
              <Button
                type="submit"
                size="sm"
                variant="ghost"
                disabled={pending}
              >
                Effacer
              </Button>
            </form>
          ) : null}
        </div>
      </div>
      {state.error && !editing ? (
        <Typography size="sm" className="text-destructive" role="alert">
          {state.error}
        </Typography>
      ) : null}
      {state.saved ? (
        <Typography size="sm" tone="muted" role="status">
          Enregistré.
        </Typography>
      ) : null}
    </div>
  );
};
