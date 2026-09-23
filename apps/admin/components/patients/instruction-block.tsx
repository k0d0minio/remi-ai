"use client";

import { useActionState, useState } from "react";
import type { PatientInstruction } from "@remi/services/shared";
import { formatDate } from "@remi/services/shared";
import { Button } from "@remi/ui";
import { Field, Textarea, Typography } from "@remi/ui/server";
import {
  setInstructionAction,
  type InstructionFormState,
} from "@/lib/patients/actions";

const initial: InstructionFormState = { error: null, saved: false };

type Props = {
  patientId: string;
  pseudonym: string;
  /** The consigne in force, or null when she has not written one. */
  instruction: PatientInstruction | null;
  /** What it replaced, newest first. */
  superseded: readonly PatientInstruction[];
};

/**
 * § E's standing consigne — the line Morgane steers this accompaniment by, and
 * beneath it the same week's consigne written to the patient.
 *
 * Two fields because they have two readers and two registers: the first is a
 * note to herself (and, in the AI round, the prompt's practitioner line) and
 * the patient never sees it; the second is the « consigne de la semaine » the
 * link's home shows under the running challenge — the challenge itself is a
 * separate row with a lifecycle (`challenge-section.tsx`). Either may stand
 * alone — a week she steers by silently, or a consigne to the patient she
 * needs no note about.
 * Both post together because they share one row.
 *
 * Saving replaces: the service archives what was there, so the previous
 * wording stays readable with the date it stopped applying — and the pair that
 * was in force is archived together.
 */
export const InstructionBlock = ({
  patientId,
  pseudonym,
  instruction,
  superseded,
}: Props) => {
  const [state, action, pending] = useActionState(
    setInstructionAction,
    initial,
  );
  const [showHistory, setShowHistory] = useState(false);

  return (
    <div className="flex flex-col gap-4">
      <form action={action} className="flex flex-col gap-3">
        <input type="hidden" name="patientId" value={patientId} />
        <input type="hidden" name="pseudonym" value={pseudonym} />

        <Field
          id="instruction-body"
          label="Consigne du moment"
          optional
          hint="Pour vous, pas pour la personne suivie — « priorité énergie, peu de changements la première semaine »."
        >
          <Textarea
            id="instruction-body"
            name="body"
            rows={3}
            maxLength={2000}
            defaultValue={instruction?.body ?? ""}
          />
        </Field>

        <Field
          id="instruction-patient-body"
          label="Consigne de la semaine"
          optional
          hint="Pour la personne suivie — elle la lit sur son lien, sous son challenge. Laissée vide, rien ne s'affiche."
        >
          <Textarea
            id="instruction-patient-body"
            name="patientBody"
            rows={3}
            maxLength={2000}
            defaultValue={instruction?.patientBody ?? ""}
          />
        </Field>

        <div className="flex flex-wrap items-center gap-3">
          <Button type="submit" size="sm" disabled={pending}>
            {pending ? "Enregistrement…" : "Enregistrer la consigne"}
          </Button>
          {instruction ? (
            <Typography size="sm" tone="muted">
              {`En vigueur depuis le ${formatDate(instruction.createdAt)}`}
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

      {superseded.length > 0 ? (
        <div className="flex flex-col gap-2">
          <Button
            type="button"
            size="sm"
            variant="ghost"
            className="w-fit"
            onClick={() => setShowHistory(!showHistory)}
          >
            {showHistory
              ? "Masquer les consignes précédentes"
              : `Voir les ${superseded.length} consignes précédentes`}
          </Button>

          {showHistory ? (
            <ol className="flex flex-col gap-3">
              {superseded.map((entry) => (
                <li key={entry.id} className="flex flex-col gap-1">
                  <Typography size="sm" tone="muted">
                    {`Remplacée le ${entry.archivedAt ? formatDate(entry.archivedAt) : "—"}`}
                  </Typography>
                  <Typography size="sm">{entry.body}</Typography>
                </li>
              ))}
            </ol>
          ) : null}
        </div>
      ) : null}
    </div>
  );
};
