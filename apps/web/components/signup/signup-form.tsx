"use client";

import { useActionState, useState } from "react";
import {
  signupFields,
  type Locale,
  type SignupField,
} from "@remi/services/shared";
import { Button } from "@remi/ui";
import { Field, Input, Typography } from "@remi/ui/server";
import type { Content } from "@/lib/content/types";
import { fill } from "@/lib/content/fill";
import { signUpAction } from "@/lib/signup/actions";
import { initialSignupState } from "@/lib/signup/state";

type Props = {
  /** The practitioner's link token, from the route. */
  token: string;
  locale: Locale;
  content: Content["signupLink"];
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
 */
export const SignupForm = ({ token, locale, content }: Props) => {
  const [state, formAction, pending] = useActionState(
    signUpAction,
    initialSignupState,
  );
  const [values, setValues] = useState(empty);

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

  return (
    <form action={formAction} noValidate className="flex flex-col gap-5">
      <input type="hidden" name="token" value={token} />
      <input type="hidden" name="locale" value={locale} />

      {refused.length > 0 || state.form ? (
        <Typography size="sm" className="text-error-text" role="alert">
          {state.form
            ? content.form[state.form]
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
    </form>
  );
};
