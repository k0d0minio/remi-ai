"use client";

import { useActionState, useRef, useState } from "react";
import { Pencil } from "lucide-react";
import {
  shownAfterSave,
  singleFlight,
  type ConfirmedSave,
} from "@remi/services/shared";
import { Input, Typography } from "@remi/ui/server";
import { Button } from "@remi/ui";
import {
  updateNextConsultationPrepAction,
  type PrepFormState,
} from "@/lib/patients/actions";

type Props = {
  patientId: string;
  pseudonym: string;
  value: string | null;
};

const EMPTY_PROMPT = "Ajouter une note pour la prochaine consultation.";

const initial: PrepFormState = { error: null, saved: false, stored: null };

/**
 * The "à préparer pour la prochaine consultation" note — a nullable free-text
 * field on `patient_profiles`, written between consultations and revised at
 * the next one. The working view gives it a place: a single text block with an
 * inline edit affordance that saves on blur or Enter and cancels on Escape.
 * `NULL` (not set) and "" (explicitly cleared) both render the empty prompt.
 *
 * After a save, the note shows the text that the action stored, not the server
 * prop from before the save (`shownAfterSave`). A blur and then a click on
 * « Enregistrer » send one save (`singleFlight`), REM-112.
 */
export const PrepNote = ({ patientId, pseudonym, value }: Props) => {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value ?? "");
  // The last save that the action confirmed. Opening the editor clears it,
  // so « Enregistré. » belongs to the last save only.
  const [confirmed, setConfirmed] = useState<ConfirmedSave | null>(null);
  const [flight] = useState(singleFlight);
  // The server prop when the save started.
  const before = useRef(value);
  const [state, formAction, pending] = useActionState(
    async (previous: PrepFormState, formData: FormData) => {
      try {
        const next = await updateNextConsultationPrepAction(previous, formData);
        if (next.saved) {
          setConfirmed({ stored: next.stored, before: before.current });
          setEditing(false);
        }
        return next;
      } finally {
        flight.end();
      }
    },
    initial,
  );
  const formRef = useRef<HTMLFormElement>(null);

  const note = shownAfterSave(value, confirmed);

  const cancel = () => {
    setDraft(note ?? "");
    setEditing(false);
  };

  const submit = () => {
    if (formRef.current && flight.start()) {
      before.current = value;
      formRef.current.requestSubmit();
    }
  };

  const open = () => {
    setConfirmed(null);
    setDraft(note ?? "");
    setEditing(true);
  };

  if (editing) {
    return (
      <form ref={formRef} action={formAction} className="flex flex-col gap-2">
        <input type="hidden" name="patientId" value={patientId} />
        <input type="hidden" name="pseudonym" value={pseudonym} />
        <Input
          name="body"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onBlur={submit}
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              cancel();
            } else if (event.key === "Enter") {
              // The browser would submit the form too: one send only.
              event.preventDefault();
              submit();
            }
          }}
          maxLength={10000}
          placeholder={EMPTY_PROMPT}
          autoFocus
        />
        {state.error ? (
          <Typography size="sm" className="text-destructive">
            {state.error}
          </Typography>
        ) : null}
        <div className="flex items-center gap-2">
          <Button type="button" size="sm" onClick={submit} disabled={pending}>
            {pending ? "Enregistrement…" : "Enregistrer"}
          </Button>
          <Button type="button" size="sm" variant="ghost" onClick={cancel}>
            Annuler
          </Button>
        </div>
      </form>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      {note ? (
        <div className="flex items-start justify-between gap-3">
          <Typography size="sm" className="whitespace-pre-line">
            {note}
          </Typography>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={open}
            aria-label="Modifier la note pour la prochaine consultation"
          >
            <Pencil aria-hidden="true" className="size-4" />
          </Button>
        </div>
      ) : (
        <Button type="button" size="sm" variant="outline" onClick={open}>
          {EMPTY_PROMPT}
        </Button>
      )}
      {confirmed ? (
        <Typography size="sm" tone="muted" role="status">
          Enregistré.
        </Typography>
      ) : null}
    </div>
  );
};
