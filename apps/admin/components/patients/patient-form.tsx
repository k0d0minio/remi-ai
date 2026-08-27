"use client";

import { useActionState } from "react";
import type { Locale, PatientProfile } from "@remi/services/shared";
import { locales, patientStatuses } from "@remi/services/shared";
import {
  Button,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@remi/ui";
import { Field, Input, Textarea, Typography } from "@remi/ui/server";
import {
  savePatientAction,
  type PatientFormState,
} from "@/lib/patients/actions";
import { patientStatusLabels } from "@/components/patients/vocabulary";

const initial: PatientFormState = { error: null, saved: false };

const localeLabels: Record<Locale, string> = {
  fr: "French",
  en: "English",
};

type Props = {
  /** Present when editing; absent on `/patients/new`. */
  patient?: PatientProfile;
};

/**
 * One form for creating and editing — the hidden `id` decides which, so the
 * two paths cannot drift apart field by field. Status appears only once the
 * profile exists: a patient is created active or not at all.
 */
export const PatientForm = ({ patient }: Props) => {
  const [state, action, pending] = useActionState(savePatientAction, initial);

  return (
    <form action={action} className="flex flex-col gap-4">
      {patient ? <input type="hidden" name="id" value={patient.id} /> : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          id="pseudonym"
          label="Pseudonym"
          hint="The working name — the only one REMI's AI may ever see."
        >
          <Input
            id="pseudonym"
            name="pseudonym"
            required
            defaultValue={patient?.pseudonym ?? ""}
          />
        </Field>

        <Field
          id="fullName"
          label="Full name"
          optional
          hint="Real identity — never leaves this console and the patient link."
        >
          <Input
            id="fullName"
            name="fullName"
            defaultValue={patient?.fullName ?? ""}
          />
        </Field>

        <Field id="email" label="Email" optional>
          <Input
            id="email"
            name="email"
            type="email"
            defaultValue={patient?.email ?? ""}
          />
        </Field>

        <Field
          id="locale"
          label="Language"
          hint="The language the patient link renders in."
        >
          <Select name="locale" defaultValue={patient?.locale ?? "fr"}>
            <SelectTrigger id="locale">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {locales.map((locale) => (
                <SelectItem key={locale} value={locale}>
                  {localeLabels[locale]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        {patient ? (
          <Field id="status" label="Status">
            <Select name="status" defaultValue={patient.status}>
              <SelectTrigger id="status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {patientStatuses.map((status) => (
                  <SelectItem key={status} value={status}>
                    {patientStatusLabels[status]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        ) : null}
      </div>

      <Field
        id="objective"
        label="Objective"
        optional
        hint="What the accompaniment is working towards."
      >
        <Textarea
          id="objective"
          name="objective"
          rows={2}
          defaultValue={patient?.objective ?? ""}
        />
      </Field>

      <Field
        id="constraints"
        label="Constraints"
        optional
        hint="Allergies, intolerances, medical constraints."
      >
        <Textarea
          id="constraints"
          name="constraints"
          rows={3}
          defaultValue={patient?.constraints ?? ""}
        />
      </Field>

      <Field
        id="preferences"
        label="Preferences"
        optional
        hint="Likes, dislikes, habits — the context recipes get built around."
      >
        <Textarea
          id="preferences"
          name="preferences"
          rows={3}
          defaultValue={patient?.preferences ?? ""}
        />
      </Field>

      <Field id="anamnesis" label="Anamnesis notes" optional>
        <Textarea
          id="anamnesis"
          name="anamnesis"
          rows={6}
          defaultValue={patient?.anamnesis ?? ""}
        />
      </Field>

      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? "Saving…" : patient ? "Save changes" : "Create patient"}
        </Button>
        {state.error ? (
          <Typography size="sm" className="text-error-text" role="alert">
            {state.error}
          </Typography>
        ) : null}
        {state.saved && !state.error && !pending ? (
          <Typography size="sm" tone="muted" role="status">
            Saved.
          </Typography>
        ) : null}
      </div>
    </form>
  );
};
