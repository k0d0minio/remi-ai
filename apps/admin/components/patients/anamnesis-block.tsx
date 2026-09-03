"use client";

import { Pencil } from "lucide-react";
import { useState } from "react";
import type { PatientAnamnesis } from "@remi/services/shared";
import { anamnesisCategories } from "@remi/services/shared";
import { Button } from "@remi/ui";
import { Textarea, Typography } from "@remi/ui/server";
import { saveAnamnesisAction } from "@/lib/patients/actions";
import { anamnesisCategoryLabels } from "@/components/patients/vocabulary";

type Props = {
  patientId: string;
  entries: readonly PatientAnamnesis[];
};

/**
 * § B's twelve areas, always all twelve, always in her order — an area she has
 * never touched reads as a heading with nothing under it, which is the whole
 * point: what the record does not yet say is as legible as what it does.
 *
 * One category edits at a time, so a save mid-consultation writes only the area
 * she just asked about. Nothing here reaches the patient link.
 */
export const AnamnesisBlock = ({ patientId, entries }: Props) => {
  const [editing, setEditing] = useState<string | null>(null);
  const bodies = new Map(entries.map((entry) => [entry.category, entry.body]));

  return (
    <dl className="flex flex-col gap-5">
      {anamnesisCategories.map((category) => (
        <AnamnesisCategoryRow
          key={category}
          patientId={patientId}
          category={category}
          body={bodies.get(category) ?? ""}
          editing={editing === category}
          onEdit={() => setEditing(category)}
          onDone={() => setEditing(null)}
        />
      ))}
    </dl>
  );
};

type RowProps = {
  patientId: string;
  category: (typeof anamnesisCategories)[number];
  body: string;
  editing: boolean;
  onEdit: () => void;
  onDone: () => void;
};

const AnamnesisCategoryRow = ({
  patientId,
  category,
  body,
  editing,
  onEdit,
  onDone,
}: RowProps) => {
  const [error, setError] = useState<string | null>(null);
  const label = anamnesisCategoryLabels[category];

  return (
    <div className="flex flex-col gap-1.5">
      <dt className="flex flex-wrap items-center gap-1">
        <Typography as="h4" size="sm" weight="medium">
          {label}
        </Typography>
        {editing ? null : (
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={onEdit}
            aria-label={`Modifier « ${label} »`}
          >
            <Pencil aria-hidden="true" />
            {body ? "Modifier" : "Compléter"}
          </Button>
        )}
      </dt>

      <dd>
        {editing ? (
          <form
            action={async (formData: FormData) => {
              const result = await saveAnamnesisAction(
                { error: null },
                formData,
              );
              setError(result.error);
              if (!result.error) {
                onDone();
              }
            }}
            className="flex flex-col gap-3"
          >
            <input type="hidden" name="patientId" value={patientId} />
            <input type="hidden" name="category" value={category} />

            <Textarea
              name="body"
              rows={4}
              defaultValue={body}
              aria-label={label}
            />

            <div className="flex flex-wrap items-center gap-2">
              <Button type="submit" size="sm">
                Enregistrer
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => {
                  setError(null);
                  onDone();
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
        ) : (
          <Typography size="sm" tone="muted" className="whitespace-pre-line">
            {body || "—"}
          </Typography>
        )}
      </dd>
    </div>
  );
};
