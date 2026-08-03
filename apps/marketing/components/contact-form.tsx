"use client";

import { CircleAlert, CircleCheck } from "lucide-react";
import { useActionState } from "react";
import type { Locale } from "@remi/services/shared";
import { Button, Checkbox } from "@remi/ui";
import {
  Alert,
  AlertDescription,
  AlertTitle,
  Field,
  Input,
  Textarea,
  Typography,
} from "@remi/ui/server";
import {
  initialContactState,
  submitContact,
  type ContactState,
} from "@/app/[locale]/contact/actions";
import type { Content } from "@/lib/content/types";

type Props = {
  locale: Locale;
  labels: Content["contact"]["form"];
};

/**
 * A client component for the pending state and the returned errors — everything
 * it renders comes from the server-safe barrel, so the island is the form's
 * behaviour rather than its markup. Labels arrive as props: importing the
 * dictionaries here would ship both languages to every visitor.
 *
 * The inputs are uncontrolled: the server action reads the FormData, so there is
 * no reason to hold four values in React state and re-render on every keystroke.
 */
export const ContactForm = ({ locale, labels }: Props) => {
  const [state, formAction, pending] = useActionState<ContactState, FormData>(
    submitContact,
    initialContactState,
  );

  if (state.status === "success") {
    return (
      <Alert variant="success">
        <CircleCheck />
        <AlertTitle>{labels.successTitle}</AlertTitle>
        <AlertDescription>{state.message}</AlertDescription>
      </Alert>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-6" noValidate>
      <input type="hidden" name="locale" value={locale} />

      {state.status === "error" && state.message ? (
        <Alert variant="error">
          <CircleAlert />
          <AlertTitle>{state.message}</AlertTitle>
        </Alert>
      ) : null}

      <Field id="name" label={labels.name} error={state.errors?.name}>
        <Input
          id="name"
          name="name"
          autoComplete="name"
          invalid={Boolean(state.errors?.name)}
        />
      </Field>

      <Field
        id="email"
        label={labels.email}
        hint={labels.emailHint}
        error={state.errors?.email}
      >
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          invalid={Boolean(state.errors?.email)}
        />
      </Field>

      <Field id="message" label={labels.message} error={state.errors?.message}>
        <Textarea
          id="message"
          name="message"
          rows={5}
          invalid={Boolean(state.errors?.message)}
        />
      </Field>

      <div className="flex flex-col gap-2">
        <div className="flex items-start gap-3">
          <Checkbox
            id="consent"
            name="consent"
            invalid={Boolean(state.errors?.consent)}
            className="mt-0.5"
          />
          <Typography as="label" htmlFor="consent" size="sm">
            {labels.consent}
          </Typography>
        </div>
        {state.errors?.consent ? (
          <Typography size="sm" className="text-error-text">
            {state.errors.consent}
          </Typography>
        ) : null}
      </div>

      <Button type="submit" size="lg" disabled={pending} className="self-start">
        {pending ? labels.submitting : labels.submit}
      </Button>
    </form>
  );
};
