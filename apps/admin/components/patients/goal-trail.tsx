"use client";

import { Pencil } from "lucide-react";
import { useState } from "react";
import type { PatientGoal, PatientGoalCheckIn } from "@remi/services/shared";
import { formatDate } from "@remi/services/shared";
import { Badge, Typography } from "@remi/ui/server";
import { Button } from "@remi/ui";
import {
  deleteCheckInAction,
  markCheckInSeenAction,
} from "@/lib/patients/actions";
import { GoalCheckInForm } from "@/components/patients/goal-check-in-form";
import {
  goalDirectionIntents,
  goalDirectionLabels,
} from "@/components/patients/vocabulary";

type Props = {
  goal: PatientGoal;
  /** Newest first — the caller passes the latest alone, or the whole trail. */
  entries: readonly PatientGoalCheckIn[];
  today: string;
};

/**
 * The dated rows behind a goal — § D's evolution, read newest first.
 *
 * A row is a date, how it moved, the measure and a word, and any of the last
 * three may be absent: the entry says what she had to say that day and no more.
 */
export const GoalTrail = ({ goal, entries, today }: Props) => (
  <ol className="flex flex-col gap-2">
    {entries.map((entry) => (
      <TrailEntry key={entry.id} entry={entry} goal={goal} today={today} />
    ))}
  </ol>
);

const TrailEntry = ({
  entry,
  goal,
  today,
}: {
  entry: PatientGoalCheckIn;
  goal: PatientGoal;
  today: string;
}) => {
  const [editing, setEditing] = useState(false);
  // A patient's lower weekly score waits for her « vu » (D-33); her own rows
  // never do, whatever direction she gave them.
  const awaitsAttention =
    entry.writtenBy === "patient" &&
    entry.direction === "worse" &&
    entry.seenAt === null;

  if (editing) {
    return (
      <li className="border-border rounded-lg border p-3">
        <GoalCheckInForm
          goalId={goal.id}
          patientId={goal.patientId}
          title={goal.title}
          today={today}
          entry={entry}
          onDone={() => setEditing(false)}
        />
      </li>
    );
  }

  return (
    <li className="flex flex-col gap-1">
      <div className="flex flex-wrap items-center gap-2">
        <Typography size="sm" tone="muted">
          {formatDate(entry.checkedOn)}
        </Typography>
        {entry.direction ? (
          <Badge
            variant={goalDirectionIntents[entry.direction]}
            tone="subtle"
            size="sm"
          >
            {goalDirectionLabels[entry.direction]}
          </Badge>
        ) : null}
        {entry.measure ? (
          <Typography size="sm" weight="medium">
            {entry.measure}
          </Typography>
        ) : null}
        {entry.score !== null ? (
          <Typography size="sm" weight="medium">
            {`${entry.score}/5`}
          </Typography>
        ) : null}
        {/* Named by the act, not the person — the same mark the meal journal
            uses for a row the patient wrote through the link. */}
        {entry.writtenBy === "patient" ? (
          <Badge variant="info" tone="subtle" size="sm">
            écrit depuis le lien
          </Badge>
        ) : null}
        {awaitsAttention ? (
          <form action={markCheckInSeenAction}>
            <input type="hidden" name="id" value={entry.id} />
            <input type="hidden" name="patientId" value={goal.patientId} />
            <input type="hidden" name="title" value={goal.title} />
            <Button type="submit" size="sm" variant="outline">
              Vu
            </Button>
          </form>
        ) : null}

        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={() => setEditing(true)}
          aria-label={`Modifier le point d'étape du ${formatDate(entry.checkedOn)}`}
        >
          <Pencil aria-hidden="true" />
        </Button>

        <form action={deleteCheckInAction}>
          <input type="hidden" name="id" value={entry.id} />
          <input type="hidden" name="patientId" value={goal.patientId} />
          <input type="hidden" name="title" value={goal.title} />
          <input type="hidden" name="checkedOn" value={entry.checkedOn} />
          <Button type="submit" size="sm" variant="ghost">
            Supprimer
          </Button>
        </form>
      </div>

      {entry.note ? (
        <Typography size="sm" tone="muted">
          {entry.note}
        </Typography>
      ) : null}
    </li>
  );
};
