"use client";

import NextLink from "next/link";
import { Fragment, useActionState, useState } from "react";
import {
  localePath,
  parseDateEntry,
  shownConsentValue,
  signupFields,
  type ConsentKey,
  type Locale,
  type SignupField,
} from "@remi/services/shared";
import { Button } from "@remi/ui";
import { Field, Input, Link, Typography } from "@remi/ui/server";
import { DateInput } from "@/components/date-entry/date-input";
import type { Content } from "@/lib/content/types";
import { fill } from "@/lib/content/fill";
import { SIGN_IN_PATH } from "@/lib/patient-auth/paths";
import { signUpAction } from "@/lib/signup/actions";
import { requestClaimAction } from "@/lib/takeover/actions";
import { initialClaimRequestState } from "@/lib/takeover/state";
import {
  initialSignupState,
  isConsentError,
  type SignupState,
} from "@/lib/signup/state";
import {
  ConsentStep,
  type ConsentStepDocument,
  type ConsentStepText,
} from "./consent-step";

type Props = {
  /** The practitioner's link token, from the route. */
  token: string;
  locale: Locale;
  content: Content["signupLink"];
  /** The texts of the birth date field (REM-159). */
  dateText: Content["dateEntry"];
  /** The mandatory consent texts, rendered on the server (story 3). */
  consents: readonly ConsentStepText[];
  /** The pilot's sales terms (CGV), rendered on the server (REM-9). */
  terms: ConsentStepDocument;
};

/** The control of each field: its type and what the browser may fill in. */
const controls: Record<
  SignupField,
  { type: string; autoComplete: string; inputMode?: "tel" | "email" }
> = {
  lastName: { type: "text", autoComplete: "family-name" },
  firstName: { type: "text", autoComplete: "given-name" },
  // Typed as « JJ/MM/AAAA » in a `DateInput`, never a native date picker.
  birthDate: { type: "text", autoComplete: "bday" },
  email: { type: "email", autoComplete: "email", inputMode: "email" },
  phone: { type: "tel", autoComplete: "tel", inputMode: "tel" },
  password: { type: "password", autoComplete: "new-password" },
};

const empty = Object.fromEntries(
  signupFields.map((name) => [name, ""]),
) as Record<SignupField, string>;

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
export const SignupForm = ({
  token,
  locale,
  content,
  dateText,
  consents,
  terms,
}: Props) => {
  const [state, formAction, pending] = useActionState(
    signUpAction,
    initialSignupState,
  );
  // « Recevoir un lien par e-mail » after `file_exists` (patient-takes-over-
  // file). It posts this same form: the token and the e-mail travel with it.
  const [claim, claimAction, claimPending] = useActionState(
    requestClaimAction,
    initialClaimRequestState,
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
          terms={terms}
          ticked={ticked}
          onToggle={toggle}
          onContinue={() => {
            setPassed(state);
            setStep("details");
          }}
          alert={consentRefused && state.form ? content.form[state.form] : null}
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
                  fields: refused
                    .map((name) => content.labels[name])
                    .join(", "),
                })}
            {/* A known e-mail goes to sign-in, never to a second file. The
                message names no data of that file. */}
            {formError === "already_registered" ? (
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

        {/* A file the practitioner created holds the e-mail: the patient
            takes it over by a one-time link, never through a second file. */}
        {formError === "file_exists" ? (
          <div className="flex flex-col gap-3">
            <Button
              type="submit"
              formAction={claimAction}
              variant="outline"
              size="lg"
              className="min-h-11 w-full"
              disabled={claimPending}
            >
              {claimPending ? content.claim.requesting : content.claim.request}
            </Button>
            {claim.status !== "idle" ? (
              <Typography
                size="sm"
                role="status"
                className={
                  claim.status === "sent" ? undefined : "text-error-text"
                }
              >
                {content.claim.status[claim.status]}
              </Typography>
            ) : null}
          </div>
        ) : null}

        {signupFields.map((name) => {
          const id = `signup-${name}`;
          const control = controls[name];
          const hint =
            name === "phone" || name === "password"
              ? content.hints[name]
              : undefined;
          if (name === "birthDate") {
            // The field shows « JJ/MM/AAAA » and starts empty. The form posts
            // the day as `YYYY-MM-DD`. A text that is not a real day is posted
            // as typed, so the server refuses it and names the field.
            const typed = values.birthDate;
            const entry = parseDateEntry(typed);
            return (
              <Fragment key={name}>
                <input
                  type="hidden"
                  name="birthDate"
                  value={entry.state === "valid" ? entry.iso : typed}
                />
                <Field
                  id={id}
                  label={content.labels.birthDate}
                  hint={dateText.hint}
                  error={message(name)}
                >
                  <DateInput
                    id={id}
                    autoComplete={control.autoComplete}
                    required
                    size="lg"
                    className="min-h-11"
                    placeholder={dateText.placeholder}
                    invalid={Boolean(state.fields.birthDate)}
                    value={typed}
                    onValueChange={(next) =>
                      setValues((current) => ({ ...current, birthDate: next }))
                    }
                  />
                </Field>
              </Fragment>
            );
          }
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
