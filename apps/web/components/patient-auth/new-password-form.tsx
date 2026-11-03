"use client";

import { useActionState } from "react";
import type { Locale } from "@remi/services/shared";
import { Button } from "@remi/ui";
import { Alert, AlertDescription, Field, Input } from "@remi/ui/server";
import type { Content } from "@/lib/content/types";
import { newPasswordAction } from "@/lib/patient-auth/actions";
import { initialNewPasswordState } from "@/lib/patient-auth/state";

type Props = {
  locale: Locale;
  /** The reset token, from the link's query. */
  token: string;
  content: Content["newPassword"];
};

/**
 * The page the reset link opens (story 2). The patient confirms the e-mail
 * and sets a new password. The e-mail signs the patient in at once, and lets
 * a password manager file the new password under the right account.
 */
export const NewPasswordForm = ({ locale, token, content }: Props) => {
  const [state, formAction, pending] = useActionState(
    newPasswordAction,
    initialNewPasswordState,
  );
  const passwordError =
    state.form === "too_short" || state.form === "too_long"
      ? content.form[state.form]
      : undefined;

  return (
    <form action={formAction} noValidate className="flex flex-col gap-5">
      <input type="hidden" name="locale" value={locale} />
      <input type="hidden" name="token" value={token} />
      {state.form && !passwordError ? (
        <Alert variant="error">
          <AlertDescription>{content.form[state.form]}</AlertDescription>
        </Alert>
      ) : null}
      <Field id="new-password-email" label={content.emailLabel}>
        <Input
          id="new-password-email"
          name="email"
          type="email"
          inputMode="email"
          autoComplete="username"
          required
          size="lg"
          className="min-h-11"
        />
      </Field>
      <Field
        id="new-password"
        label={content.passwordLabel}
        hint={content.passwordHint}
        error={passwordError}
      >
        <Input
          id="new-password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          size="lg"
          className="min-h-11"
          invalid={Boolean(passwordError)}
        />
      </Field>
      <Button
        type="submit"
        size="lg"
        className="min-h-11 w-full"
        disabled={pending}
      >
        {pending ? content.submitting : content.submit}
      </Button>
    </form>
  );
};
