"use client";

import { useActionState } from "react";
import { Button } from "@remi/ui";
import { Field, Input, Typography } from "@remi/ui/server";
import {
  acceptInvitationAction,
  type AcceptFormState,
} from "@/lib/operators/actions";

const initial: AcceptFormState = { error: null };

type Props = {
  token: string;
  /** From the invitation — shown, not editable: it identifies the account. */
  email: string;
  suggestedName: string;
};

/**
 * Turning an invitation into an account. The recipient chooses a name and a
 * password; the email and the access level come from the invitation itself and
 * are not fields here, so nothing posted from this form can widen what was
 * granted.
 */
export const AcceptForm = ({ token, email, suggestedName }: Props) => {
  const [state, action, pending] = useActionState(
    acceptInvitationAction,
    initial,
  );

  return (
    <form action={action} className="flex flex-col gap-4">
      <input type="hidden" name="token" value={token} />

      <Field id="accept-email" label="Adresse email">
        <Input id="accept-email" value={email} readOnly disabled />
      </Field>

      <Field id="accept-name" label="Nom">
        <Input
          id="accept-name"
          name="name"
          autoComplete="name"
          required
          defaultValue={suggestedName}
        />
      </Field>

      <Field
        id="accept-password"
        label="Mot de passe"
        hint="Au moins 12 caractères. La suggestion d'un gestionnaire de mots de passe est la bonne réponse ici."
      >
        <Input
          id="accept-password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={12}
        />
      </Field>

      {state.error ? (
        <Typography size="sm" className="text-error-text" role="alert">
          {state.error}
        </Typography>
      ) : null}

      <Button type="submit" disabled={pending}>
        {pending ? "Création du compte…" : "Créer mon accès"}
      </Button>
    </form>
  );
};
