"use client";

import { useActionState } from "react";
import type { Locale } from "@remi/services/shared";
import { Button } from "@remi/ui";
import { Alert, AlertDescription, Field, Input } from "@remi/ui/server";
import type { Content } from "@/lib/content/types";
import { forgotPasswordAction } from "@/lib/patient-auth/actions";
import { initialLinkRequestState } from "@/lib/patient-auth/state";

type Props = {
  locale: Locale;
  content: Content["forgotPassword"];
};

/**
 * « Mot de passe oublié » (story 2). The answer reads the same for an e-mail
 * with or without an account, so the form never tells who has one.
 */
export const ForgotPasswordForm = ({ locale, content }: Props) => {
  const [state, formAction, pending] = useActionState(
    forgotPasswordAction,
    initialLinkRequestState,
  );

  return (
    <form action={formAction} noValidate className="flex flex-col gap-5">
      <input type="hidden" name="locale" value={locale} />
      {state.status ? (
        <Alert
          variant={state.status === "sent" ? "success" : "error"}
          role="status"
        >
          <AlertDescription>{content.status[state.status]}</AlertDescription>
        </Alert>
      ) : null}
      <Field id="forgot-email" label={content.emailLabel}>
        <Input
          id="forgot-email"
          name="email"
          type="email"
          inputMode="email"
          autoComplete="username"
          required
          size="lg"
          className="min-h-11"
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
