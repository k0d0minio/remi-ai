"use client";

import { Plus } from "lucide-react";
import { useActionState } from "react";
import { Button } from "@remi/ui";
import { Field, Input, Typography } from "@remi/ui/server";
import {
  addPantryEssentialAction,
  type PantryFormState,
} from "@/lib/patients/actions";

const initial: PantryFormState = { error: null };

type Props = {
  patientId: string;
};

/**
 * Always on screen, two fields wide: this list is often typed during the
 * consultation itself, one item after another, from a phone.
 *
 * Two fields and no more. § H warns that quantity, season and nutrient fields
 * turn a list she can write in a minute into a form she stops filling in — so
 * the form carries a name and a why, and the why is optional.
 */
export const PantryAddForm = ({ patientId }: Props) => {
  const [state, action, pending] = useActionState(
    addPantryEssentialAction,
    initial,
  );

  return (
    <form action={action} className="flex flex-col gap-4">
      <input type="hidden" name="patientId" value={patientId} />

      <div className="grid gap-4 sm:grid-cols-[14rem_1fr]">
        <Field id="new-pantry-item" label="Aliment">
          <Input
            id="new-pantry-item"
            name="item"
            required
            maxLength={120}
            placeholder="ex. Sardines"
          />
        </Field>

        <Field
          id="new-pantry-why"
          label="Pourquoi"
          optional
          hint="Une ligne, pour cette personne — « oméga-3, et tu aimes ça »."
        >
          <Input id="new-pantry-why" name="why" maxLength={280} />
        </Field>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" size="sm" disabled={pending}>
          <Plus aria-hidden="true" />
          {pending ? "Ajout…" : "Ajouter un essentiel"}
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
