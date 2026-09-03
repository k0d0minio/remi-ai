"use client";

import { Plus } from "lucide-react";
import { useActionState } from "react";
import { Button } from "@remi/ui";
import { Field, Input, Textarea, Typography } from "@remi/ui/server";
import {
  addSupplementAction,
  type SupplementFormState,
} from "@/lib/patients/actions";

const initial: SupplementFormState = { error: null };

type Props = {
  patientId: string;
};

/**
 * Always on screen rather than behind an "add" button — encoding the protocol
 * is a frequent act, often several rows in a row. A new entry appends to the
 * end; reordering is a separate act on the row itself. Only the name is
 * required, matching the service.
 */
export const SupplementAddForm = ({ patientId }: Props) => {
  const [state, action, pending] = useActionState(addSupplementAction, initial);

  return (
    <form action={action} className="flex flex-col gap-4">
      <input type="hidden" name="patientId" value={patientId} />

      <div className="grid gap-4 sm:grid-cols-2">
        <Field id="new-supplement-name" label="Complément">
          <Input
            id="new-supplement-name"
            name="name"
            required
            placeholder="ex. Magnésium bisglycinate"
          />
        </Field>

        <Field id="new-supplement-dose" label="Dose" optional>
          <Input
            id="new-supplement-dose"
            name="dose"
            placeholder="ex. 300 mg"
          />
        </Field>

        <Field id="new-supplement-timing" label="Moment" optional>
          <Input
            id="new-supplement-timing"
            name="timing"
            placeholder="ex. le soir, au coucher"
          />
        </Field>

        <Field id="new-supplement-reason" label="Pourquoi" optional>
          <Textarea id="new-supplement-reason" name="reason" rows={2} />
        </Field>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" size="sm" disabled={pending}>
          <Plus aria-hidden="true" />
          {pending ? "Ajout…" : "Ajouter un complément"}
        </Button>
        {state.error ? (
          <Typography size="sm" className="text-error-text" role="alert">
            {state.error}
          </Typography>
        ) : null}
      </div>
    </form>
  );
};
