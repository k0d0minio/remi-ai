"use client";

import { BadgeCheck, Pencil } from "lucide-react";
import { useActionState, useState, type ReactNode } from "react";
import { Button } from "@remi/ui";
import { Alert, AlertDescription, Typography } from "@remi/ui/server";

/** What the action of a detail answers. Null: the validation is written. */
export type CalculationDetailState = { error: string | null };

type Props = {
  patientId: string;
  /** The full name of the button « Modifier », for a screen reader. */
  editLabel: string;
  /**
   * The server action of « Valider ». It reads `id` and the fields of
   * `children` from the form data, and checks the actor itself.
   */
  action: (
    previous: CalculationDetailState,
    formData: FormData,
  ) => Promise<CalculationDetailState>;
  /**
   * Why the detail can offer no value (D-30). With a sentence here the detail
   * shows it, and shows no field and no « Valider ».
   */
  unavailable?: string | null;
  /** The fields of the calculation, as ordinary form fields. */
  children: ReactNode;
};

const initial: CalculationDetailState = { error: null };

/**
 * The detail of one row of « Calculs »: the button « Modifier » that opens
 * it, the one form with « Valider », and the place where a refusal shows. The
 * parameters of a calculation show only after « Modifier » (story 8).
 *
 * A calculation gives its fields as `children` and its server action. This
 * frame holds what does not change from one calculation to the next. The
 * detail closes when the validation is written. Its fields then start again
 * from the row.
 *
 * Do not render it for a read-only open: it has controls that write.
 */
export const CalculationDetail = ({
  patientId,
  editLabel,
  action,
  unavailable = null,
  children,
}: Props) => {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(
    async (previous: CalculationDetailState, formData: FormData) => {
      const next = await action(previous, formData);
      if (next.error === null) {
        setOpen(false);
      }
      return next;
    },
    initial,
  );

  if (!open) {
    return (
      <Button
        type="button"
        variant="outline"
        size="sm"
        aria-label={editLabel}
        onClick={() => setOpen(true)}
      >
        <Pencil aria-hidden="true" />
        Modifier
      </Button>
    );
  }

  if (unavailable !== null) {
    return (
      <div className="border-border flex w-full flex-col items-start gap-3 rounded-lg border p-4">
        <Typography size="sm">{unavailable}</Typography>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setOpen(false)}
        >
          Fermer
        </Button>
      </div>
    );
  }

  return (
    <form
      action={formAction}
      className="border-border flex w-full flex-col gap-4 rounded-lg border p-4"
    >
      <input type="hidden" name="id" value={patientId} />
      {children}
      {state.error ? (
        <Alert variant="error">
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      ) : null}
      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" size="sm" disabled={pending}>
          <BadgeCheck aria-hidden="true" />
          {pending ? "Validation…" : "Valider"}
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setOpen(false)}
          disabled={pending}
        >
          Annuler
        </Button>
      </div>
    </form>
  );
};
