"use client";

import {
  ArchiveRestore,
  ArchiveX,
  ChevronDown,
  ChevronUp,
  Pencil,
} from "lucide-react";
import { useState } from "react";
import type { PatientRecommendation } from "@remi/services/shared";
import { recommendationCategories } from "@remi/services/shared";
import { Badge, Field, Input, Textarea, Typography } from "@remi/ui/server";
import {
  Button,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@remi/ui";
import {
  archiveRecommendationAction,
  deleteRecommendationAction,
  moveRecommendationAction,
  updateRecommendationAction,
} from "@/lib/patients/actions";
import { categoryLabels } from "@/components/patients/vocabulary";

type Props = {
  recommendation: PatientRecommendation;
  /** False at the top of its category — the move-up control has nowhere to go. */
  canMoveUp: boolean;
  canMoveDown: boolean;
};

/**
 * One encoded recommendation: read view by default, an inline form behind the
 * pencil.
 *
 * Archiving is the everyday way an entry leaves the protocol, and it is the
 * prominent control. Deleting is still here, behind a second click, for the row
 * that should never have been written — a wrong patient, a test entry — but a
 * protocol that changed is history worth keeping, so it is not the default.
 */
export const RecommendationItem = ({
  recommendation,
  canMoveUp,
  canMoveDown,
}: Props) => {
  const [editing, setEditing] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const archived = recommendation.archivedAt !== null;

  if (editing) {
    return (
      <li className="border-border flex flex-col gap-4 rounded-lg border p-4">
        <form
          action={async (formData: FormData) => {
            const result = await updateRecommendationAction(
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
          <input type="hidden" name="id" value={recommendation.id} />
          <input
            type="hidden"
            name="patientId"
            value={recommendation.patientId}
          />

          <div className="grid gap-4 sm:grid-cols-[14rem_1fr]">
            <Field id={`category-${recommendation.id}`} label="Catégorie">
              <Select name="category" defaultValue={recommendation.category}>
                <SelectTrigger id={`category-${recommendation.id}`}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {recommendationCategories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {categoryLabels[category]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field id={`title-${recommendation.id}`} label="Recommandation">
              <Input
                id={`title-${recommendation.id}`}
                name="title"
                required
                defaultValue={recommendation.title}
              />
            </Field>
          </div>

          <Field id={`detail-${recommendation.id}`} label="Détail" optional>
            <Textarea
              id={`detail-${recommendation.id}`}
              name="detail"
              rows={3}
              defaultValue={recommendation.detail}
            />
          </Field>

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
    <li className="border-border flex flex-col gap-2 rounded-lg border p-4">
      <div className="flex flex-wrap items-center gap-2">
        <Typography as="h4" size="sm" weight="medium">
          {recommendation.title}
        </Typography>
        {archived ? (
          <Badge variant="neutral" tone="subtle" size="sm">
            archivée
          </Badge>
        ) : null}
      </div>

      {recommendation.detail ? (
        <Typography size="sm" tone="muted" className="whitespace-pre-line">
          {recommendation.detail}
        </Typography>
      ) : null}

      <div className="flex flex-wrap items-center gap-1">
        {archived ? null : (
          <>
            <MoveButton
              recommendation={recommendation}
              direction="up"
              disabled={!canMoveUp}
            />
            <MoveButton
              recommendation={recommendation}
              direction="down"
              disabled={!canMoveDown}
            />
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

        <form action={archiveRecommendationAction}>
          <input type="hidden" name="id" value={recommendation.id} />
          <input
            type="hidden"
            name="patientId"
            value={recommendation.patientId}
          />
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
            <form action={deleteRecommendationAction}>
              <input type="hidden" name="id" value={recommendation.id} />
              <input
                type="hidden"
                name="patientId"
                value={recommendation.patientId}
              />
              <input type="hidden" name="title" value={recommendation.title} />
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

const MoveButton = ({
  recommendation,
  direction,
  disabled,
}: {
  recommendation: PatientRecommendation;
  direction: "up" | "down";
  disabled: boolean;
}) => (
  <form action={moveRecommendationAction}>
    <input type="hidden" name="id" value={recommendation.id} />
    <input type="hidden" name="patientId" value={recommendation.patientId} />
    <input type="hidden" name="direction" value={direction} />
    <Button
      type="submit"
      size="icon"
      variant="ghost"
      disabled={disabled}
      aria-label={
        direction === "up"
          ? `Monter « ${recommendation.title} »`
          : `Descendre « ${recommendation.title} »`
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
