"use client";

import NextLink from "next/link";
import { useActionState, useState } from "react";
import { localePath, type Locale } from "@remi/services/shared";
import { Button } from "@remi/ui";
import {
  Alert,
  AlertDescription,
  Field,
  Input,
  Link,
  Separator,
  Typography,
} from "@remi/ui/server";
import type { Content } from "@/lib/content/types";
import { magicLinkAction, signInAction } from "@/lib/patient-auth/actions";
import { FORGOT_PASSWORD_PATH } from "@/lib/patient-auth/paths";
import {
  initialLinkRequestState,
  initialSignInState,
} from "@/lib/patient-auth/state";

type Props = {
  locale: Locale;
  content: Content["patientSignIn"];
};

/**
 * The patient's sign-in (story 2): an e-mail and a password, or a link sent to
 * the e-mail (Jamie, 2026-11-01). One form, two submits: the second button
 * posts the same e-mail to the magic-link action.
 *
 * `noValidate`: the server answers every refusal in the page's language.
 * A refused password sign-in shows one message for both fields, so the page
 * never tells which one is wrong.
 */
export const PatientSignInForm = ({ locale, content }: Props) => {
  const [signIn, signInFormAction, signingIn] = useActionState(
    signInAction,
    initialSignInState,
  );
  const [link, linkFormAction, sending] = useActionState(
    magicLinkAction,
    initialLinkRequestState,
  );
  const [email, setEmail] = useState("");

  return (
    <form action={signInFormAction} noValidate className="flex flex-col gap-5">
      <input type="hidden" name="locale" value={locale} />

      {signIn.form ? (
        <Alert variant="error">
          <AlertDescription>{content.form[signIn.form]}</AlertDescription>
        </Alert>
      ) : null}

      <Field id="sign-in-email" label={content.emailLabel}>
        <Input
          id="sign-in-email"
          name="email"
          type="email"
          inputMode="email"
          autoComplete="username"
          required
          size="lg"
          className="min-h-11"
          invalid={signIn.form === "wrong_credentials"}
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
      </Field>
      <Field id="sign-in-password" label={content.passwordLabel}>
        <Input
          id="sign-in-password"
          name="password"
          type="password"
          autoComplete="current-password"
          size="lg"
          className="min-h-11"
          invalid={signIn.form === "wrong_credentials"}
        />
      </Field>

      <Button
        type="submit"
        size="lg"
        className="min-h-11 w-full"
        disabled={signingIn || sending}
      >
        {signingIn ? content.submitting : content.submit}
      </Button>
      <Link
        as={NextLink}
        href={localePath(locale, FORGOT_PASSWORD_PATH)}
        variant="primary"
        className="inline-flex min-h-11 items-center self-start text-sm"
      >
        {content.forgotLink}
      </Link>

      <Separator tone="subtle" />

      <div className="flex flex-col gap-3">
        <Typography as="h2" size="lg" weight="semibold">
          {content.magicLink.title}
        </Typography>
        <Typography size="sm" tone="muted">
          {content.magicLink.intro}
        </Typography>
        {link.status ? (
          <Alert
            variant={link.status === "sent" ? "success" : "error"}
            role="status"
          >
            <AlertDescription>
              {content.magicLink.status[link.status]}
            </AlertDescription>
          </Alert>
        ) : null}
        <Button
          type="submit"
          formAction={linkFormAction}
          variant="outline"
          size="lg"
          className="min-h-11 w-full"
          disabled={signingIn || sending}
        >
          {sending ? content.magicLink.submitting : content.magicLink.submit}
        </Button>
      </div>
    </form>
  );
};
