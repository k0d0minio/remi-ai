"use client";

import {
  ArchiveRestore,
  ArchiveX,
  ChevronDown,
  ChevronUp,
  Pencil,
  Plus,
} from "lucide-react";
import { useState } from "react";
import type { PatientGoal, PatientGoalCheckIn } from "@remi/services/shared";
import { formatDate } from "@remi/services/shared";
import { Badge, Field, Input, Typography } from "@remi/ui/server";
import { Button } from "@remi/ui";
import {
  archiveGoalAction,
  deleteGoalAction,
  moveGoalAction,
  updateGoalAction,
} from "@/lib/patients/actions";
import { GoalCheckInForm } from "@/components/patients/goal-check-in-form";
import { GoalTrail } from "@/components/patients/goal-trail";

type Props = {
  goal: PatientGoal;
  /** The goal's check-ins, newest first — already ordered by the service. */
  checkIns: readonly PatientGoalCheckIn[];
  /** Its rank in the active list, 1-based. Absent on an archived goal. */
  rank?: number;
  canMoveUp: boolean;
  canMoveDown: boolean;
  today: string;
};

/**
 * One priority goal: what it is, where it started, how it has moved.
 *
 * The latest check-in reads at a glance beside the title because that is the
 * question asked at a follow-up; the rest of the trail is one click away, so a
 * patient with three goals and a year of history still fits on a phone.
 */
export const GoalItem = ({
  goal,
  checkIns,
  rank,
  canMoveUp,
  canMoveDown,
  today,
}: Props) => {
  const [editing, setEditing] = useState(false);
  const [checkingIn, setCheckingIn] = useState(false);
  const [showTrail, setShowTrail] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const archived = goal.archivedAt !== null;
  const latest = checkIns[0];

  if (editing) {
    return (
      <li className="border-border flex flex-col gap-4 rounded-lg border p-4">
        <form
          action={async (formData: FormData) => {
            const result = await updateGoalAction({ error: null }, formData);
            setError(result.error);
            if (!result.error) {
              setEditing(false);
            }
          }}
          className="flex flex-col gap-4"
        >
          <input type="hidden" name="id" value={goal.id} />
          <input type="hidden" name="patientId" value={goal.patientId} />

          <div className="grid gap-4 sm:grid-cols-[1fr_14rem]">
            <Field id={`goal-title-${goal.id}`} label="Objectif">
              <Input
                id={`goal-title-${goal.id}`}
                name="title"
                required
                maxLength={160}
                defaultValue={goal.title}
              />
            </Field>

            <Field
              id={`goal-baseline-${goal.id}`}
              label="Point de départ"
              optional
            >
              <Input
                id={`goal-baseline-${goal.id}`}
                name="baseline"
                maxLength={160}
                defaultValue={goal.baseline}
              />
            </Field>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button type="submit" size="sm">
              Enregistrer
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => {
                setEditing(false);
                setError(null);
              }}
            >
              Annuler
            </Button>
            {error ? (
              <Typography size="sm" className="text-error-text" role="alert">
                {error}
              </Typography>
            ) : null}
          </div>
        </form>
      </li>
    );
  }

  return (
    <li className="border-border flex flex-col gap-3 rounded-lg border p-4">
      <div className="flex flex-wrap items-baseline gap-2">
        {rank === undefined ? null : (
          <Typography size="sm" tone="muted" weight="medium">
            {`${rank}.`}
          </Typography>
        )}
        <Typography as="h4" size="sm" weight="medium">
          {goal.title}
        </Typography>
        {archived ? (
          <Badge variant="neutral" tone="subtle" size="sm">
            archivé
          </Badge>
        ) : null}
      </div>

      {goal.baseline ? (
        <Typography size="sm" tone="muted">
          {`Départ : ${goal.baseline}`}
        </Typography>
      ) : null}

      {latest ? (
        <GoalTrail
          entries={showTrail ? checkIns : [latest]}
          goal={goal}
          today={today}
        />
      ) : (
        <Typography size="sm" tone="muted">
          Aucun point d&apos;étape pour le moment.
        </Typography>
      )}

      {checkIns.length > 1 ? (
        <Button
          type="button"
          size="sm"
          variant="ghost"
          className="w-fit"
          onClick={() => setShowTrail(!showTrail)}
        >
          {showTrail
            ? "Masquer l'historique"
            : `Voir les ${checkIns.length} points d'étape`}
        </Button>
      ) : null}

      {checkingIn ? (
        <div className="border-border rounded-lg border p-4">
          <GoalCheckInForm
            goalId={goal.id}
            patientId={goal.patientId}
            title={goal.title}
            today={today}
            onDone={() => setCheckingIn(false)}
          />
        </div>
      ) : null}

      <div className="flex flex-wrap items-center gap-1">
        {archived ? null : (
          <>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => setCheckingIn(!checkingIn)}
            >
              <Plus aria-hidden="true" />
              Point d&apos;étape
            </Button>
            <MoveButton goal={goal} direction="up" disabled={!canMoveUp} />
            <MoveButton goal={goal} direction="down" disabled={!canMoveDown} />
          </>
        )}

        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={() => setEditing(true)}
        >
          <Pencil aria-hidden="true" />
          Modifier
        </Button>

        <form action={archiveGoalAction}>
          <input type="hidden" name="id" value={goal.id} />
          <input type="hidden" name="patientId" value={goal.patientId} />
          <input
            type="hidden"
            name="archived"
            value={archived ? "false" : "true"}
          />
          <Button type="submit" size="sm" variant="ghost">
            {archived ? (
              <ArchiveRestore aria-hidden="true" />
            ) : (
              <ArchiveX aria-hidden="true" />
            )}
            {archived ? "Réactiver" : "Archiver"}
          </Button>
        </form>

        {confirmingDelete ? (
          <>
            <form action={deleteGoalAction}>
              <input type="hidden" name="id" value={goal.id} />
              <input type="hidden" name="patientId" value={goal.patientId} />
              <input type="hidden" name="title" value={goal.title} />
              <Button type="submit" size="sm" variant="error">
                Supprimer définitivement
              </Button>
            </form>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => setConfirmingDelete(false)}
            >
              Annuler
            </Button>
          </>
        ) : (
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={() => setConfirmingDelete(true)}
          >
            Supprimer
          </Button>
        )}
      </div>

      {archived && goal.archivedAt ? (
        <Typography size="sm" tone="muted">
          {`Archivé le ${formatDate(goal.archivedAt)}`}
        </Typography>
      ) : null}
    </li>
  );
};

const MoveButton = ({
  goal,
  direction,
  disabled,
}: {
  goal: PatientGoal;
  direction: "up" | "down";
  disabled: boolean;
}) => (
  <form action={moveGoalAction}>
    <input type="hidden" name="id" value={goal.id} />
    <input type="hidden" name="patientId" value={goal.patientId} />
    <input type="hidden" name="direction" value={direction} />
    <Button
      type="submit"
      size="icon"
      variant="ghost"
      disabled={disabled}
      aria-label={
        direction === "up"
          ? `Monter « ${goal.title} »`
          : `Descendre « ${goal.title} »`
      }
    >
      {direction === "up" ? (
        <ChevronUp aria-hidden="true" />
      ) : (
        <ChevronDown aria-hidden="true" />
      )}
    </Button>
  </form>
);
