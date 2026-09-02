"use client";

import {
  ArchiveRestore,
  ArchiveX,
  ChevronDown,
  ChevronUp,
  Pencil,
} from "lucide-react";
import { useState } from "react";
import type { PantryEssential } from "@remi/services/shared";
import { Badge, Field, Input, Typography } from "@remi/ui/server";
import { Button } from "@remi/ui";
import {
  archivePantryEssentialAction,
  deletePantryEssentialAction,
  movePantryEssentialAction,
  updatePantryEssentialAction,
} from "@/lib/patients/actions";

type Props = {
  essential: PantryEssential;
  /** False at the top of the list — the move-up control has nowhere to go. */
  canMoveUp: boolean;
  canMoveDown: boolean;
};

/**
 * One item on the list: read view by default, an inline form behind the pencil.
 *
 * Archiving is how an item leaves the list when it is refreshed, so it is the
 * prominent control; deleting stays behind a second click for the row that
 * should never have been written. What dropped off and when is part of the
 * record, not a mistake to erase.
 */
export const PantryItem = ({ essential, canMoveUp, canMoveDown }: Props) => {
  const [editing, setEditing] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const archived = essential.archivedAt !== null;

  if (editing) {
    return (
      <li className="border-border flex flex-col gap-4 rounded-lg border p-4">
        <form
          action={async (formData: FormData) => {
            const result = await updatePantryEssentialAction(
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
          <input type="hidden" name="id" value={essential.id} />
          <input type="hidden" name="patientId" value={essential.patientId} />

          <div className="grid gap-4 sm:grid-cols-[14rem_1fr]">
            <Field id={`item-${essential.id}`} label="Aliment">
              <Input
                id={`item-${essential.id}`}
                name="item"
                required
                maxLength={120}
                defaultValue={essential.item}
              />
            </Field>

            <Field id={`why-${essential.id}`} label="Pourquoi" optional>
              <Input
                id={`why-${essential.id}`}
                name="why"
                maxLength={280}
                defaultValue={essential.why}
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
    <li className="border-border flex flex-col gap-2 rounded-lg border p-4">
      <div className="flex flex-wrap items-center gap-2">
        <Typography as="h4" size="sm" weight="medium">
          {essential.item}
        </Typography>
        {archived ? (
          <Badge variant="neutral" tone="subtle" size="sm">
            archivé
          </Badge>
        ) : null}
      </div>

      {essential.why ? (
        <Typography size="sm" tone="muted">
          {essential.why}
        </Typography>
      ) : null}

      <div className="flex flex-wrap items-center gap-1">
        {archived ? null : (
          <>
            <MoveButton
              essential={essential}
              direction="up"
              disabled={!canMoveUp}
            />
            <MoveButton
              essential={essential}
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

        <form action={archivePantryEssentialAction}>
          <input type="hidden" name="id" value={essential.id} />
          <input type="hidden" name="patientId" value={essential.patientId} />
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
            <form action={deletePantryEssentialAction}>
              <input type="hidden" name="id" value={essential.id} />
              <input
                type="hidden"
                name="patientId"
                value={essential.patientId}
              />
              <input type="hidden" name="item" value={essential.item} />
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
  essential,
  direction,
  disabled,
}: {
  essential: PantryEssential;
  direction: "up" | "down";
  disabled: boolean;
}) => (
  <form action={movePantryEssentialAction}>
    <input type="hidden" name="id" value={essential.id} />
    <input type="hidden" name="patientId" value={essential.patientId} />
    <input type="hidden" name="item" value={essential.item} />
    <input type="hidden" name="direction" value={direction} />
    <Button
      type="submit"
      size="icon"
      variant="ghost"
      disabled={disabled}
      aria-label={
        direction === "up"
          ? `Monter « ${essential.item} »`
          : `Descendre « ${essential.item} »`
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
