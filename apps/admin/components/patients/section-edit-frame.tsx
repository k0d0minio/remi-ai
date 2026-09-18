"use client";

import { Pencil } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "@remi/ui";
import { Alert, AlertDescription, Typography } from "@remi/ui/server";

type Props = {
  editing: boolean;
  onEdit: () => void;
  onCancel: () => void;
  pending: boolean;
  error: string | null;
  patientId: string;
  pseudonym: string;
  action: (formData: FormData) => void;
  /** What the button that opens edit mode says. */
  editLabel: string;
  /** The read view, rendered by the server until edit mode opens. */
  readView: ReactNode;
  /** The grid itself — the rows, inside the one form that saves them. */
  children: ReactNode;
  /** Anything that belongs under the grid but above the save row. */
  footer?: ReactNode;
};

/**
 * The chrome around a whole-section edit mode: the button that opens it, the
 * single form that closes it, and the one place an error from the batch action
 * is shown.
 *
 * The three sections differ in their rows and in nothing else, so this holds
 * everything that is not a row. One `<form>` with one submit is the shape the
 * spec asks for: the rows ride in it as ordinary form fields, so what reaches
 * the action is form data rather than a payload only a client could have built.
 */
export const SectionEditFrame = ({
  editing,
  onEdit,
  onCancel,
  pending,
  error,
  patientId,
  pseudonym,
  action,
  editLabel,
  readView,
  children,
  footer,
}: Props) => {
  if (!editing) {
    return (
      <div className="flex flex-col gap-4">
        {readView}
        <div>
          <Button type="button" variant="outline" size="sm" onClick={onEdit}>
            <Pencil aria-hidden="true" />
            {editLabel}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form action={action} className="flex flex-col gap-4">
      <input type="hidden" name="patientId" value={patientId} />
      <input type="hidden" name="pseudonym" value={pseudonym} />

      {children}
      {footer}

      {error ? (
        <Alert variant="error">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" size="sm" disabled={pending}>
          {pending ? "Enregistrement…" : "Enregistrer la section"}
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onCancel}
          disabled={pending}
        >
          Annuler
        </Button>
        <Typography size="sm" tone="muted">
          Un seul enregistrement pour toute la section.
        </Typography>
      </div>
    </form>
  );
};
