"use client";

import { useActionState } from "react";
import type { PatientGoalCheckIn } from "@remi/services/shared";
import { goalDirections } from "@remi/services/shared";
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
  addCheckInAction,
  updateCheckInAction,
  type CheckInFormState,
} from "@/lib/patients/actions";
import { goalDirectionLabels } from "@/components/patients/vocabulary";

const initial: CheckInFormState = { error: null };

/**
 * Radix refuses `""` as an item value, so "no direction" needs a token of its
 * own. Anything outside `goalDirections` narrows to null in the action, so this
 * one needs no special case there.
 */
const NONE = "none";

type Props = {
  goalId: string;
  patientId: string;
  /** The goal's title — the audit trail's label for the entry. */
  title: string;
  /** Today, resolved on the server so a date input never disagrees with it. */
  today: string;
  /** Present when correcting an entry rather than adding one. */
  entry?: PatientGoalCheckIn;
  onDone?: () => void;
};

/**
 * One check-in: a date, how it moved, the simple measure, a word.
 *
 * § D offers the direction *or* the measure, so neither is required and the
 * direction's empty option is a real choice rather than a placeholder. The
 * service refuses only the row that says none of the three — a dated entry
 * recording nothing is not a record.
 */
export const GoalCheckInForm = ({
  goalId,
  patientId,
  title,
  today,
  entry,
  onDone,
}: Props) => {
  const [state, action, pending] = useActionState(
    entry ? updateCheckInAction : addCheckInAction,
    initial,
  );
  const idPrefix = entry ? `check-in-${entry.id}` : `new-check-in-${goalId}`;

  return (
    <form action={action} className="flex flex-col gap-3">
      <input type="hidden" name="goalId" value={goalId} />
      <input type="hidden" name="patientId" value={patientId} />
      <input type="hidden" name="title" value={title} />
      {entry ? <input type="hidden" name="id" value={entry.id} /> : null}

      <div className="grid gap-3 sm:grid-cols-[10rem_10rem_1fr]">
        <Field id={`${idPrefix}-date`} label="Date">
          <Input
            id={`${idPrefix}-date`}
            name="checkedOn"
            type="date"
            required
            defaultValue={entry?.checkedOn ?? today}
          />
        </Field>

        <Field id={`${idPrefix}-direction`} label="Évolution" optional>
          <Select name="direction" defaultValue={entry?.direction ?? NONE}>
            <SelectTrigger id={`${idPrefix}-direction`}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {/* A real option, not a placeholder: a check-in may carry only a
                  measure, and picking this again is how a direction is undone. */}
              <SelectItem value={NONE}>non précisé</SelectItem>
              {goalDirections.map((direction) => (
                <SelectItem key={direction} value={direction}>
                  {goalDirectionLabels[direction]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        <Field
          id={`${idPrefix}-measure`}
          label="Mesure"
          optional
          hint="La mesure simple du jour — « 6/10 », « 1 réveil »."
        >
          <Input
            id={`${idPrefix}-measure`}
            name="measure"
            maxLength={160}
            defaultValue={entry?.measure ?? ""}
          />
        </Field>
      </div>

      <Field id={`${idPrefix}-note`} label="Note" optional>
        <Textarea
          id={`${idPrefix}-note`}
          name="note"
          rows={2}
          defaultValue={entry?.note ?? ""}
        />
      </Field>

      <div className="flex flex-wrap items-center gap-2">
        <Button type="submit" size="sm" disabled={pending}>
          {pending ? "Enregistrement…" : "Enregistrer le point d'étape"}
        </Button>
        {onDone ? (
          <Button type="button" size="sm" variant="ghost" onClick={onDone}>
            Annuler
          </Button>
        ) : null}
        {state.error ? (
          <Typography size="sm" className="text-error-text" role="alert">
            {state.error}
          </Typography>
        ) : null}
      </div>
    </form>
  );
};
