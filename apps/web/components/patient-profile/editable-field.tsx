"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  maskNumberEntry,
  maskPhoneEntry,
  normalizePhone,
} from "@remi/services/shared";
import { Button } from "@remi/ui";
import { Field, Input, Typography, VisuallyHidden } from "@remi/ui/server";
import { fill } from "@/lib/content/fill";
import type { Content } from "@/lib/content/types";
import { saveAnswerAction } from "@/lib/questionnaire/actions";
import type { SaveError, SaveResult } from "@/lib/questionnaire/state";

type Props = {
  /** The answer that the form saves. Each is a field of the patient's own file. */
  field: "phone" | "weightKg";
  label: string;
  /** The label of the input: the questionnaire's name of the field. */
  inputLabel: string;
  hint?: string;
  /** An example in the empty field. Never a value. */
  placeholder?: string;
  /** The saved value as the patient types it, `""` when the file holds none. */
  initial: string;
  /** How the row shows the value. `{value}` is the saved value. */
  valueTemplate?: string;
  /** A weight in kg: the decimal keyboard, and a comma on screen. */
  decimal?: boolean;
  autoComplete?: string;
  /** What the row says after a save. */
  savedMessage: string;
  text: Content["patientPersonalData"];
  errors: Content["questionnaire"]["errors"];
};

/**
 * One value of the Profil tab that the patient changes in place (REM-85): the
 * value, « Modifier », then one field and one « Enregistrer ».
 *
 * The save is the questionnaire's `saveAnswerAction`. It reads the patient's
 * id from the session, applies the questionnaire's checks, and writes through
 * `savePatientProfileAnswers`, which records the change for the practitioner.
 * Nothing is written when the value did not change.
 *
 * It renders one group of a `dl`.
 */
export const EditableField = ({
  field,
  label,
  inputLabel,
  hint,
  placeholder,
  initial,
  valueTemplate,
  decimal,
  autoComplete,
  savedMessage,
  text,
  errors,
}: Props) => {
  const router = useRouter();
  const [saved, setSaved] = useState(initial);
  const [draft, setDraft] = useState(initial);
  const [editing, setEditing] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<SaveError | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const id = `profile-${field}`;

  const open = () => {
    setDraft(saved);
    setError(null);
    setConfirmed(false);
    setEditing(true);
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // The server stores a phone with no space and shows a weight with a comma.
    if (draft.trim() === "") {
      setError("required");
      return;
    }
    // A phone is checked here first, with the server's own rule (REM-158).
    const next = decimal
      ? draft.trim().replace(".", ",")
      : normalizePhone(draft);
    if (next === null) {
      setError("phone");
      return;
    }
    if (next === saved) {
      setEditing(false);
      return;
    }
    setPending(true);
    let result: SaveResult;
    try {
      result = await saveAnswerAction(field, next);
    } catch {
      result = { ok: false, error: "unavailable" };
    }
    setPending(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setSaved(next);
    setError(null);
    setEditing(false);
    setConfirmed(true);
    router.refresh();
  };

  if (editing) {
    return (
      <div className="flex flex-col gap-1">
        <dt>
          <VisuallyHidden>{label}</VisuallyHidden>
        </dt>
        <dd>
          <form
            onSubmit={(event) => void submit(event)}
            noValidate
            className="flex flex-col gap-3"
          >
            <Field
              id={id}
              label={inputLabel}
              hint={hint}
              error={error ? errors[error] : undefined}
            >
              <Input
                id={id}
                type={decimal ? "text" : "tel"}
                size="lg"
                inputMode={decimal ? "decimal" : "tel"}
                autoComplete={autoComplete}
                autoFocus
                value={draft}
                placeholder={placeholder}
                invalid={error !== null}
                onChange={(event) =>
                  setDraft(
                    decimal
                      ? maskNumberEntry(event.target.value, "decimal")
                      : maskPhoneEntry(event.target.value),
                  )
                }
              />
            </Field>
            <div className="flex flex-wrap items-center gap-2">
              <Button type="submit" variant="primary" disabled={pending}>
                {pending ? text.saving : text.save}
              </Button>
              <Button
                type="button"
                variant="ghost"
                disabled={pending}
                onClick={() => setEditing(false)}
              >
                {text.cancel}
              </Button>
            </div>
          </form>
        </dd>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      <Typography as="dt" size="sm" tone="muted">
        {label}
      </Typography>
      <dd className="flex flex-col gap-1">
        <div className="flex items-center justify-between gap-4">
          <Typography as="span" size="base" className="min-w-0 break-words">
            {saved === ""
              ? text.empty
              : valueTemplate
                ? fill(valueTemplate, { value: saved })
                : saved}
          </Typography>
          <Button
            type="button"
            variant="outline"
            size="sm"
            aria-label={fill(text.editLabel, { label })}
            onClick={open}
          >
            {text.edit}
          </Button>
        </div>
        <Typography as="p" size="sm" tone="muted" role="status">
          {confirmed ? savedMessage : ""}
        </Typography>
      </dd>
    </div>
  );
};
