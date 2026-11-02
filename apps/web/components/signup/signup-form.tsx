"use client";

import { useActionState, useState } from "react";
import {
  shownConsentValue,
  signupFields,
  type ConsentKey,
  type Locale,
  type SignupField,
} from "@remi/services/shared";
import { Button } from "@remi/ui";
import { Field, Input, Typography } from "@remi/ui/server";
import type { Content } from "@/lib/content/types";
import { fill } from "@/lib/content/fill";
import { signUpAction } from "@/lib/signup/actions";
import {
  initialSignupState,
  isConsentError,
  type SignupState,
} from "@/lib/signup/state";
import { ConsentStep, type ConsentStepText } from "./consent-step";

type Props = {
  /** The practitioner's link token, from the route. */
  token: string;
  locale: Locale;
  content: Content["signupLink"];
  /** The mandatory consent texts, rendered on the server (story 3). */
  consents: readonly ConsentStepText[];
};

/** The control of each field: its type and what the browser may fill in. */
const controls: Record<
  SignupField,
  { type: string; autoComplete: string; inputMode?: "tel" | "email" }
> = {
  lastName: { type: "text", autoComplete: "family-name" },
  firstName: { type: "text", autoComplete: "given-name" },
  birthDate: { type: "date", autoComplete: "bday" },
  email: { type: "email", autoComplete: "email", inputMode: "email" },
  phone: { type: "tel", autoComplete: "tel", inputMode: "tel" },
  password: { type: "password", autoComplete: "new-password" },
};

const empty = Object.fromEntries(signupFields.map((name) => [name, ""])) as Record<
  SignupField,
  string
>;

/**
 * The sign-up form (story 2): one column, one field per row, targets of 44 px
 * at least, so it fits a phone with no horizontal scroll.
 *
 * `noValidate`: the server checks every field and names each refused one in
 * the page's language. The browser's own bubbles would say it in another.
 *
 * The fields are controlled: a refused submit keeps what the patient typed.
 *
 * Two steps in one form. The consent step comes first, before the patient
 * types any personal data (story 3). Both steps stay mounted, and the hidden
 * one keeps its values: the final submit posts the fields and the ticks
 * together. A refusal of the consents brings the consent step back.
 */
export const SignupForm = ({ token, locale, content, consents }: Props) => {
  const [state, formAction, pending] = useActionState(
    signUpAction,
    initialSignupState,
  );
  const [values, setValues] = useState(empty);
  const [step, setStep] = useState<"consent" | "details">("consent");
  const [ticked, setTicked] = useState<ReadonlySet<ConsentKey>>(new Set());

  // A server answer that refuses the consents opens their step again, until
  // the patient continues past it. Derived, so no effect and no extra render.
  const [passed, setPassed] = useState<SignupState | null>(null);
  const consentRefused = isConsentError(state.form) && passed !== state;
  const active = consentRefused ? "consent" : step;

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

  const message = (name: SignupField) => {
    const error = state.fields[name];
    if (error === "required") {
      return fill(content.required, { field: content.labels[name] });
    }
    if (error === "too_short") {
      return content.tooShort;
    }
    return error ? content.invalid[name] : undefined;
  };

  const refused = signupFields.filter((name) => state.fields[name]);
  const formError = isConsentError(state.form) ? null : state.form;

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
          ticked={ticked}
          onToggle={toggle}
          onContinue={() => {
            setPassed(state);
            setStep("details");
          }}
          alert={
            consentRefused && state.form ? content.form[state.form] : null
          }
          content={content.consent}
        />
      </div>

      <div hidden={active !== "details"} className="flex flex-col gap-5">
        <Button
          type="button"
          variant="ghost"
          size="lg"
          className="min-h-11 self-start"
          onClick={() => setStep("consent")}
        >
          {content.consent.back}
        </Button>

        {refused.length > 0 || formError ? (
          <Typography size="sm" className="text-error-text" role="alert">
            {formError
              ? content.form[formError]
              : fill(content.summary, {
                  fields: refused.map((name) => content.labels[name]).join(", "),
                })}
          </Typography>
        ) : null}

        {signupFields.map((name) => {
          const id = `signup-${name}`;
          const control = controls[name];
          const hint =
            name === "phone" || name === "password"
              ? content.hints[name]
              : undefined;
          return (
            <Field
              key={name}
              id={id}
              label={content.labels[name]}
              hint={hint}
              error={message(name)}
            >
              <Input
                id={id}
                name={name}
                type={control.type}
                inputMode={control.inputMode}
                autoComplete={control.autoComplete}
                required
                size="lg"
                className="min-h-11"
                invalid={Boolean(state.fields[name])}
                value={values[name]}
                onChange={(event) =>
                  setValues((current) => ({
                    ...current,
                    [name]: event.target.value,
                  }))
                }
              />
            </Field>
          );
        })}

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
