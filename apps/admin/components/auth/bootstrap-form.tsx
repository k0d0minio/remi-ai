"use client";

import { useActionState } from "react";
import { Button } from "@remi/ui";
import { Field, Input, Typography } from "@remi/ui/server";
import { bootstrapAction, type AuthFormState } from "@/lib/auth/actions";

const initial: AuthFormState = { error: null };

export const BootstrapForm = () => {
  const [state, action, pending] = useActionState(bootstrapAction, initial);

  return (
    <form action={action} className="flex flex-col gap-4">
      <Field id="name" label="Nom">
        <Input id="name" name="name" autoComplete="name" required />
      </Field>

      <Field id="email" label="Adresse email">
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
        />
      </Field>

      <Field
        id="password"
        label="Mot de passe"
        hint="Au moins 12 caractères. La suggestion d'un gestionnaire de mots de passe est la bonne réponse ici."
      >
        <Input
          id="password"
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
        {pending ? "Création du compte…" : "Créer le compte et se connecter"}
      </Button>
    </form>
  );
};
