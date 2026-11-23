"use client";

import NextLink from "next/link";
import { useActionState, useState } from "react";
import {
  localePath,
  shownConsentValue,
  type ConsentKey,
  type Locale,
} from "@remi/services/shared";
import { Button } from "@remi/ui";
import { Field, Input, Link, Typography } from "@remi/ui/server";
import {
  ConsentStep,
  type ConsentStepDocument,
  type ConsentStepText,
} from "@/components/signup/consent-step";
import type { Content } from "@/lib/content/types";
import { SIGN_IN_PATH } from "@/lib/patient-auth/paths";
import { takeOverAction } from "@/lib/takeover/actions";
import {
  initialTakeoverState,
  isTakeoverConsentError,
  type TakeoverState,
} from "@/lib/takeover/state";

type Props = {
  /** The one-time token, from the route. */
  token: string;
  locale: Locale;
  content: Content["takeover"];
  consentContent: Content["signupLink"]["consent"];
  /** The mandatory consent texts, rendered on the server (story 3). */
  consents: readonly ConsentStepText[];
  /** The pilot's sales terms (CGV), rendered on the server (REM-9). */
  terms: ConsentStepDocument;
};

/**
 * The takeover form (`patient-takes-over-file`): the consent step of the
 * sign-up first, then one password field. The e-mail is the file's own, so
 * the patient types nothing else. No account exists before the consents.
 *
 * Both steps stay mounted, like the sign-up form: the final submit posts the
 * ticks and the password together. A refusal of the consents brings the
 * consent step back.
 */
export const TakeoverForm = ({
  token,
  locale,
  content,
  consentContent,
  consents,
  terms,
}: Props) => {
  const [state, formAction, pending] = useActionState(
    takeOverAction,
    initialTakeoverState,
  );
  const [password, setPassword] = useState("");
  const [step, setStep] = useState<"consent" | "password">("consent");
  const [ticked, setTicked] = useState<ReadonlySet<ConsentKey>>(new Set());

  // A server answer that refuses the consents opens their step again, until
  // the patient continues past it. Derived, so no effect and no extra render.
  const [passed, setPassed] = useState<TakeoverState | null>(null);
  const consentRefused = isTakeoverConsentError(state.form) && passed !== state;
  const active = consentRefused ? "consent" : step;
  const formError = isTakeoverConsentError(state.form) ? null : state.form;
  const passwordError =
    formError === "too_short" || formError === "too_long"
      ? content.form[formError]
      : undefined;

  const toggle = (key: ConsentKey, checked: boolean) =>
    setTicked((current) => {
      const next = new Set(current);
      if (checked) {
        next.add(key);
      } else {
        next.delete(key);
      }
      return next;
    });

  return (
    <form action={formAction} noValidate className="flex flex-col gap-5">
      <input type="hidden" name="token" value={token} />
      <input type="hidden" name="locale" value={locale} />
      {consents
        .filter((consent) => ticked.has(consent.key))
        .map((consent) => (
          <input
            key={consent.key}
            type="hidden"
            name="consent"
            value={shownConsentValue(consent)}
          />
        ))}

      <div hidden={active !== "consent"}>
        <ConsentStep
          consents={consents}
          terms={terms}
          ticked={ticked}
          onToggle={toggle}
          onContinue={() => {
            setPassed(state);
            setStep("password");
          }}
          alert={consentRefused && state.form ? content.form[state.form] : null}
          content={consentContent}
        />
      </div>

      <div hidden={active !== "password"} className="flex flex-col gap-5">
        <Button
          type="button"
          variant="ghost"
          size="lg"
          className="min-h-11 self-start"
          onClick={() => setStep("consent")}
        >
          {consentContent.back}
        </Button>

        {formError && !passwordError ? (
          <Typography size="sm" className="text-error-text" role="alert">
            {content.form[formError]}
            {formError === "has_account" ? (
              <>
                {" "}
                <Link
                  as={NextLink}
                  href={localePath(locale, SIGN_IN_PATH)}
                  variant="primary"
                >
                  {content.signIn}
                </Link>
              </>
            ) : null}
          </Typography>
        ) : null}

        <Field
          id="takeover-password"
          label={content.passwordLabel}
          hint={content.passwordHint}
          error={passwordError}
        >
          <Input
            id="takeover-password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
            size="lg"
            className="min-h-11"
            invalid={Boolean(passwordError)}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
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
      </div>
    </form>
  );
};
