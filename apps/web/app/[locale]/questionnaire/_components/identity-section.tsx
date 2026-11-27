"use client";

import { useState } from "react";
import { Pencil } from "lucide-react";
import { dateEntryFromIso } from "@remi/services/shared";
import { Button } from "@remi/ui";
import { Field, Input, Typography } from "@remi/ui/server";
import type { Content } from "@/lib/content/types";
import { DateAnswer } from "./date-answer";
import { useQuestionnaire } from "./questionnaire-context";
import { TextAnswer } from "./text-answer";

export type IdentityValues = {
  firstName: string;
  lastName: string;
  /** `YYYY-MM-DD`, `""` when the file holds none. */
  birthDate: string;
  email: string;
  phone: string;
};

type Props = {
  values: IdentityValues;
  dateText: Content["dateEntry"];
};

/**
 * The personal data of the sign-up (REM-158): last name, first name, birth
 * date, e-mail and phone. The step does not ask them again. It shows what the
 * patient's file holds, and the link « Modifier » opens the fields.
 * Each correction saves to the same patient file (`savePatientProfileAnswers`):
 * there is one record.
 *
 * A file with an empty value opens on the fields: a file that the practitioner
 * created can lack a birth date or a phone. The e-mail is the sign-in
 * identity, so it stays read-only here.
 */
export const IdentitySection = ({ values, dateText }: Props) => {
  const { text } = useQuestionnaire();
  const complete =
    values.firstName !== "" &&
    values.lastName !== "" &&
    values.birthDate !== "" &&
    values.phone !== "";
  const [editing, setEditing] = useState(!complete);

  if (!editing) {
    const rows = [
      { label: text.labels.lastName, value: values.lastName },
      { label: text.labels.firstName, value: values.firstName },
      {
        label: text.labels.birthDate,
        value: dateEntryFromIso(values.birthDate),
      },
      { label: text.labels.email, value: values.email },
      { label: text.labels.phone, value: values.phone },
    ];
    return (
      <div className="flex flex-col gap-3">
        <Typography as="p" size="sm" tone="muted">
          {text.identity.known}
        </Typography>
        <div
          className="border-border bg-card flex items-start gap-2 rounded-lg border p-4"
        >
          <dl className="flex min-w-0 flex-1 flex-col gap-3">
            {rows.map((row) => (
              <div key={row.label} className="flex flex-col gap-0.5">
                <Typography as="dt" size="sm" tone="muted">
                  {row.label}
                </Typography>
                <Typography as="dd" size="base" className="break-words">
                  {row.value || text.identity.empty}
                </Typography>
              </div>
            ))}
          </dl>
          {/* A link at the block's top right (REM-156): the correction is
              not the action of the step. */}
          <Button
            type="button"
            variant="link"
            size="sm"
            className="-mt-3 -mr-3 px-3"
            onClick={() => setEditing(true)}
          >
            <Pencil aria-hidden />
            {text.identity.edit}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <TextAnswer
        field="lastName"
        label={text.labels.lastName}
        initial={values.lastName}
        autoComplete="family-name"
      />
      <TextAnswer
        field="firstName"
        label={text.labels.firstName}
        initial={values.firstName}
        autoComplete="given-name"
      />
      <DateAnswer
        field="birthDate"
        label={text.labels.birthDate}
        dateText={dateText}
        initial={values.birthDate}
        past
        autoComplete="bday"
      />
      <Field
        id="questionnaire-email"
        label={text.labels.email}
        hint={text.hints.email}
      >
        <Input
          id="questionnaire-email"
          type="email"
          size="lg"
          value={values.email}
          readOnly
        />
      </Field>
      <TextAnswer
        field="phone"
        type="tel"
        inputMode="tel"
        label={text.labels.phone}
        hint={text.hints.phone}
        initial={values.phone}
        autoComplete="tel"
      />
    </>
  );
};
