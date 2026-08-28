"use client";

import { useActionState } from "react";
import { Button } from "@remi/ui";
import { Field, Input, Typography } from "@remi/ui/server";
import {
  changePasswordAction,
  updateAccountNameAction,
  type AccountFormState,
} from "@/lib/operators/actions";

const initial: AccountFormState = { error: null, saved: false };

/**
 * The feedback line both forms end with. Identical in shape and identical in
 * meaning, so it is one component rather than two blocks that drift.
 */
const Status = ({
  state,
  pending,
  savedLabel,
}: {
  state: AccountFormState;
  pending: boolean;
  savedLabel: string;
}) => {
  if (state.error) {
    return (
      <Typography size="sm" className="text-error-text" role="alert">
        {state.error}
      </Typography>
    );
  }
  if (state.saved && !pending) {
    return (
      <Typography size="sm" tone="muted" role="status">
        {savedLabel}
      </Typography>
    );
  }
  return null;
};

export const NameForm = ({ name }: { name: string }) => {
  const [state, action, pending] = useActionState(
    updateAccountNameAction,
    initial,
  );

  return (
    <form action={action} className="flex flex-col gap-4">
      <Field
        id="account-name"
        label="Nom"
        hint="Apparaît sur les notes de consultation que vous écrivez et dans le journal."
      >
        <Input
          id="account-name"
          name="name"
          autoComplete="name"
          required
          defaultValue={name}
        />
      </Field>

      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? "Enregistrement…" : "Enregistrer"}
        </Button>
        <Status state={state} pending={pending} savedLabel="Enregistré." />
      </div>
    </form>
  );
};

export const PasswordForm = () => {
  const [state, action, pending] = useActionState(
    changePasswordAction,
    initial,
  );

  return (
    <form action={action} className="flex flex-col gap-4">
      <Field id="current-password" label="Mot de passe actuel">
        <Input
          id="current-password"
          name="currentPassword"
          type="password"
          autoComplete="current-password"
          required
        />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          id="new-password"
          label="Nouveau mot de passe"
          hint="Au moins 12 caractères. La suggestion d'un gestionnaire de mots de passe est la bonne réponse ici."
        >
          <Input
            id="new-password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
            minLength={12}
          />
        </Field>

        <Field id="confirmation" label="Confirmation">
          <Input
            id="confirmation"
            name="confirmation"
            type="password"
            autoComplete="new-password"
            required
            minLength={12}
          />
        </Field>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? "Modification…" : "Changer le mot de passe"}
        </Button>
        <Status
          state={state}
          pending={pending}
          savedLabel="Mot de passe modifié."
        />
      </div>
    </form>
  );
};
