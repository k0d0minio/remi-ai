"use client";

import {
  ArchiveRestore,
  ArchiveX,
  ChevronDown,
  ChevronUp,
  Pencil,
} from "lucide-react";
import { useState } from "react";
import type { PatientSupplement } from "@remi/services/shared";
import {
  Badge,
  Field,
  Input,
  TableCell,
  TableRow,
  Textarea,
  Typography,
} from "@remi/ui/server";
import { Button } from "@remi/ui";
import {
  archiveSupplementAction,
  deleteSupplementAction,
  moveSupplementAction,
  updateSupplementAction,
} from "@/lib/patients/actions";

type Props = {
  supplement: PatientSupplement;
  /** False at the top of the protocol — the move-up control has nowhere to go. */
  canMoveUp: boolean;
  canMoveDown: boolean;
};

/**
 * One prescribed supplement: a table row by default, an inline edit form behind
 * the pencil. The edit form takes over the whole row through a spanning cell —
 * a four-field grid does not fit the four narrow columns it edits.
 *
 * Archiving is the everyday way a supplement leaves the protocol and is the
 * prominent control; deleting is behind a second click, for the row that should
 * never have been written.
 */
export const SupplementItem = ({
  supplement,
  canMoveUp,
  canMoveDown,
}: Props) => {
  const [editing, setEditing] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const archived = supplement.archivedAt !== null;

  if (editing) {
    return (
      <TableRow>
        <TableCell colSpan={5}>
          <form
            action={async (formData: FormData) => {
              const result = await updateSupplementAction(
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
            <input type="hidden" name="id" value={supplement.id} />
            <input
              type="hidden"
              name="patientId"
              value={supplement.patientId}
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <Field id={`name-${supplement.id}`} label="Complément">
                <Input
                  id={`name-${supplement.id}`}
                  name="name"
                  required
                  defaultValue={supplement.name}
                />
              </Field>

              <Field id={`dose-${supplement.id}`} label="Dose" optional>
                <Input
                  id={`dose-${supplement.id}`}
                  name="dose"
                  defaultValue={supplement.dose}
                />
              </Field>

              <Field id={`timing-${supplement.id}`} label="Moment" optional>
                <Input
                  id={`timing-${supplement.id}`}
                  name="timing"
                  defaultValue={supplement.timing}
                />
              </Field>

              <Field id={`reason-${supplement.id}`} label="Pourquoi" optional>
                <Textarea
                  id={`reason-${supplement.id}`}
                  name="reason"
                  rows={2}
                  defaultValue={supplement.reason}
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
        </TableCell>
      </TableRow>
    );
  }

  return (
    <TableRow>
      <TableCell>
        <div className="flex flex-wrap items-center gap-2">
          <Typography as="span" size="sm" weight="medium">
            {supplement.name}
          </Typography>
          {archived ? (
            <Badge variant="neutral" tone="subtle" size="sm">
              archivé
            </Badge>
          ) : null}
        </div>
      </TableCell>
      <TableCell>
        <Cell value={supplement.dose} />
      </TableCell>
      <TableCell>
        <Cell value={supplement.timing} />
      </TableCell>
      <TableCell>
        <Cell value={supplement.reason} />
      </TableCell>
      <TableCell>
        <div className="flex flex-wrap items-center justify-end gap-1">
          {archived ? null : (
            <>
              <MoveButton
                supplement={supplement}
                direction="up"
                disabled={!canMoveUp}
              />
              <MoveButton
                supplement={supplement}
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

          <form action={archiveSupplementAction}>
            <input type="hidden" name="id" value={supplement.id} />
            <input
              type="hidden"
              name="patientId"
              value={supplement.patientId}
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
              <form action={deleteSupplementAction}>
                <input type="hidden" name="id" value={supplement.id} />
                <input
                  type="hidden"
                  name="patientId"
                  value={supplement.patientId}
                />
                <input type="hidden" name="name" value={supplement.name} />
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
      </TableCell>
    </TableRow>
  );
};

/** An empty column reads as a dash rather than a blank a scan would skip. */
const Cell = ({ value }: { value: string }) =>
  value ? (
    <Typography
      as="span"
      size="sm"
      tone="muted"
      className="whitespace-pre-line"
    >
      {value}
    </Typography>
  ) : (
    <span className="text-muted-foreground" aria-hidden="true">
      —
    </span>
  );

const MoveButton = ({
  supplement,
  direction,
  disabled,
}: {
  supplement: PatientSupplement;
  direction: "up" | "down";
  disabled: boolean;
}) => (
  <form action={moveSupplementAction}>
    <input type="hidden" name="id" value={supplement.id} />
    <input type="hidden" name="patientId" value={supplement.patientId} />
    <input type="hidden" name="direction" value={direction} />
    <Button
      type="submit"
      size="icon"
      variant="ghost"
      disabled={disabled}
      aria-label={
        direction === "up"
          ? `Monter « ${supplement.name} »`
          : `Descendre « ${supplement.name} »`
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
