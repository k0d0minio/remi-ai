"use client";

import { useActionState } from "react";
import type { PatientSummary } from "@remi/services/shared";
import { formatDate } from "@remi/services/shared";
import { Button } from "@remi/ui";
import { Field, Textarea, Typography } from "@remi/ui/server";
import {
  setSummaryAction,
  type SummaryFormState,
} from "@/lib/patients/actions";
import {
  summaryChecklistHint,
  summaryVisibilityNote,
} from "@/components/patients/vocabulary";

const initial: SummaryFormState = { error: null, saved: false };

type Props = {
  patientId: string;
  pseudonym: string;
  /** The living summary, or null when she has not written one. */
  summary: PatientSummary | null;
};

/**
 * § C's living summary — the synthesis Morgane re-reads first, written for the
 * patient. One generous textarea over one row: saving revises it in place, and
 * the note says it becomes visible on the patient link once those segments
 * ship, so the card does not imply a render that does not exist yet.
 */
export const SummaryBlock = ({ patientId, pseudonym, summary }: Props) => {
  const [state, action, pending] = useActionState(setSummaryAction, initial);

  return (
    <form action={action} className="flex flex-col gap-3">
      <input type="hidden" name="patientId" value={patientId} />
      <input type="hidden" name="pseudonym" value={pseudonym} />

      <Field
        id="summary-body"
        label="Résumé vivant"
        optional
        hint={summaryChecklistHint}
      >
        <Textarea
          id="summary-body"
          name="body"
          rows={8}
          maxLength={8000}
          defaultValue={summary?.body ?? ""}
        />
      </Field>

      <Typography size="sm" tone="muted">
        {summaryVisibilityNote}
      </Typography>

      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" size="sm" disabled={pending}>
          {pending ? "Enregistrement…" : "Enregistrer le résumé"}
        </Button>
        {summary ? (
          <Typography size="sm" tone="muted">
            {`Dernière révision le ${formatDate(summary.updatedAt)}`}
          </Typography>
        ) : null}
        {state.error ? (
          <Typography size="sm" className="text-error-text" role="alert">
            {state.error}
          </Typography>
        ) : null}
        {state.saved && !state.error ? (
          <Typography size="sm" tone="muted" role="status">
            Enregistré.
          </Typography>
        ) : null}
      </div>
    </form>
  );
};
