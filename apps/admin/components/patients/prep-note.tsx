"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { Pencil } from "lucide-react";
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

/**
 * The "à préparer pour la prochaine consultation" note — a nullable free-text
 * field on `patient_profiles`, written between consultations and revised at
 * the next one. The working view gives it a place: a single text block with an
 * inline edit affordance that saves on blur or Enter and cancels on Escape.
 * `NULL` (not set) and "" (explicitly cleared) both render the empty prompt.
 */
export const PrepNote = ({ patientId, pseudonym, value }: Props) => {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value ?? "");
  const [state, formAction, pending] = useActionState(
    updateNextConsultationPrepAction,
    { error: null, saved: false },
  );
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.saved) {
      setEditing(false);
    }
  }, [state.saved]);

  const cancel = () => {
    setDraft(value ?? "");
    setEditing(false);
  };

  const submit = () => {
    if (!pending && formRef.current) {
      formRef.current.requestSubmit();
    }
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

  return value ? (
    <div className="flex items-start justify-between gap-3">
      <Typography size="sm" className="whitespace-pre-line">
        {value}
      </Typography>
      <Button
        type="button"
        size="sm"
        variant="ghost"
        onClick={() => {
          setDraft(value);
          setEditing(true);
        }}
        aria-label="Modifier la note pour la prochaine consultation"
      >
        <Pencil aria-hidden="true" className="size-4" />
      </Button>
    </div>
  ) : (
    <Button
      type="button"
      size="sm"
      variant="outline"
      onClick={() => setEditing(true)}
    >
      {EMPTY_PROMPT}
    </Button>
  );
};
