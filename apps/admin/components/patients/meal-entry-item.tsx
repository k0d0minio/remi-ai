"use client";

import { ArchiveRestore, ArchiveX, MessageSquare, Pencil } from "lucide-react";
import { useState } from "react";
import { formatDate, type MealEntry } from "@remi/services/shared";
import { Badge, Field, Input, Textarea, Typography } from "@remi/ui/server";
import { Button } from "@remi/ui";
import { MealSlotField } from "@/components/patients/meal-slot-field";
import { mealSlotLabels } from "@/components/patients/vocabulary";
import {
  archiveMealEntryAction,
  deleteMealEntryAction,
  updateMealEntryAction,
  writeMealFeedbackAction,
} from "@/lib/patients/actions";

type Props = {
  entry: MealEntry;
};

/**
 * One exchange, read as an exchange: the meal, what the person said about it,
 * and her answer beneath — not two lists to reconcile by eye.
 *
 * The two edit paths are separate because the two moments are. The pencil
 * reopens the transcription (day, moment, what was eaten, their words); the
 * other opens her answer and what the meal taught her, which is the pass she
 * makes later. Neither leaves the page.
 */
export const MealEntryItem = ({ entry }: Props) => {
  const [editing, setEditing] = useState(false);
  const [answering, setAnswering] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const archived = entry.archivedAt !== null;
  const answered = entry.feedbackWrittenAt !== null;

  if (editing) {
    return (
      <li className="border-border flex flex-col gap-4 rounded-lg border p-4">
        <form
          action={async (formData: FormData) => {
            const result = await updateMealEntryAction(
              { error: null },
              formData,
            );
            setError(result.error);
            if (!result.error) {
              setEditing(false);
            }
          }}
          className="flex flex-col gap-4"
        >
          <input type="hidden" name="id" value={entry.id} />
          <input type="hidden" name="patientId" value={entry.patientId} />

          <div className="grid gap-4 sm:grid-cols-[12rem_1fr]">
            <Field id={`meal-date-${entry.id}`} label="Jour du repas">
              <Input
                id={`meal-date-${entry.id}`}
                name="eatenOn"
                type="date"
                required
                defaultValue={entry.eatenOn}
              />
            </Field>

            <Field
              id={`meal-description-${entry.id}`}
              label="Ce qui a été mangé"
            >
              <Textarea
                id={`meal-description-${entry.id}`}
                name="description"
                required
                rows={3}
                maxLength={2000}
                defaultValue={entry.description}
              />
            </Field>
          </div>

          <MealSlotField name="slot" selected={entry.slot} />

          <Field
            id={`meal-comment-${entry.id}`}
            label="Ce que la personne en a dit"
            optional
          >
            <Textarea
              id={`meal-comment-${entry.id}`}
              name="patientComment"
              rows={2}
              maxLength={1000}
              defaultValue={entry.patientComment}
            />
          </Field>

          <FormControls
            onCancel={() => {
              setEditing(false);
              setError(null);
            }}
            error={error}
          />
        </form>
      </li>
    );
  }

  return (
    <li className="border-border flex flex-col gap-3 rounded-lg border p-4">
      <div className="flex flex-wrap items-center gap-2">
        <Typography as="h4" size="sm" weight="medium">
          {formatDate(entry.eatenOn)}
        </Typography>
        {entry.slot ? (
          <Badge variant="neutral" tone="subtle" size="sm">
            {mealSlotLabels[entry.slot]}
          </Badge>
        ) : null}
        {archived ? (
          <Badge variant="neutral" tone="subtle" size="sm">
            archivé
          </Badge>
        ) : null}
        {!archived && !answered ? (
          <Badge variant="warning" tone="subtle" size="sm">
            sans retour
          </Badge>
        ) : null}
      </div>

      <Typography size="sm">{entry.description}</Typography>

      {entry.patientComment ? (
        <Typography size="sm" tone="muted">
          « {entry.patientComment} »
        </Typography>
      ) : null}

      {answering ? (
        <form
          action={async (formData: FormData) => {
            const result = await writeMealFeedbackAction(
              { error: null },
              formData,
            );
            setError(result.error);
            if (!result.error) {
              setAnswering(false);
            }
          }}
          className="border-border flex flex-col gap-4 rounded-lg border border-dashed p-4"
        >
          <input type="hidden" name="id" value={entry.id} />
          <input type="hidden" name="patientId" value={entry.patientId} />

          <Field
            id={`meal-feedback-${entry.id}`}
            label="Votre retour"
            optional
            hint="Ce qui est déjà bien, puis une ou deux priorités. Vider le champ remet le repas en attente."
          >
            <Textarea
              id={`meal-feedback-${entry.id}`}
              name="feedback"
              rows={3}
              maxLength={2000}
              defaultValue={entry.feedback}
            />
          </Field>

          <Field id={`meal-learning-${entry.id}`} label="À retenir" optional>
            <Input
              id={`meal-learning-${entry.id}`}
              name="learning"
              maxLength={500}
              defaultValue={entry.learning}
            />
          </Field>

          <FormControls
            onCancel={() => {
              setAnswering(false);
              setError(null);
            }}
            error={error}
          />
        </form>
      ) : (
        <>
          {entry.feedback ? (
            <div className="border-border border-l-2 pl-3">
              <Typography size="sm">{entry.feedback}</Typography>
            </div>
          ) : null}

          {entry.learning ? (
            <Typography size="sm" tone="muted">
              À retenir : {entry.learning}
            </Typography>
          ) : null}
        </>
      )}

      <div className="flex flex-wrap items-center gap-1">
        {answering ? null : (
          <Button
            type="button"
            size="sm"
            variant={answered ? "ghost" : "outline"}
            onClick={() => setAnswering(true)}
          >
            <MessageSquare aria-hidden="true" />
            {answered ? "Modifier le retour" : "Écrire un retour"}
          </Button>
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

        <form action={archiveMealEntryAction}>
          <input type="hidden" name="id" value={entry.id} />
          <input type="hidden" name="patientId" value={entry.patientId} />
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
            <form action={deleteMealEntryAction}>
              <input type="hidden" name="id" value={entry.id} />
              <input type="hidden" name="patientId" value={entry.patientId} />
              <input
                type="hidden"
                name="description"
                value={entry.description}
              />
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
    </li>
  );
};

const FormControls = ({
  onCancel,
  error,
}: {
  onCancel: () => void;
  error: string | null;
}) => (
  <div className="flex flex-wrap items-center gap-2">
    <Button type="submit" size="sm">
      Enregistrer
    </Button>
    <Button type="button" size="sm" variant="ghost" onClick={onCancel}>
      Annuler
    </Button>
    {error ? (
      <Typography size="sm" className="text-error-text" role="alert">
        {error}
      </Typography>
    ) : null}
  </div>
);
