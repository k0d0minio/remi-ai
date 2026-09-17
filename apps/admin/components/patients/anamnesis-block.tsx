"use client";

import { Pencil, Plus } from "lucide-react";
import { useState } from "react";
import type {
  AnamnesisCategory,
  PatientAnamnesis,
} from "@remi/services/shared";
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
 * § B's twelve areas, filled ones first.
 *
 * The block used to list all twelve always, so a record with two areas covered
 * read as ten empty headings — the shape of the schema rather than the shape of
 * what she knows. Now what she has written is the section, and what she has not
 * is one short row of invitations under it: still legibly absent, no longer the
 * bulk of the page.
 *
 * One category edits at a time, so a save mid-consultation writes only the area
 * she just asked about. Nothing here reaches the patient link.
 */
export const AnamnesisBlock = ({ patientId, entries }: Props) => {
  const [editing, setEditing] = useState<AnamnesisCategory | null>(null);
  const bodies = new Map(entries.map((entry) => [entry.category, entry.body]));
  const isFilled = (category: AnamnesisCategory) =>
    (bodies.get(category) ?? "").trim() !== "";

  const filled = anamnesisCategories.filter(isFilled);
  const empty = anamnesisCategories.filter((category) => !isFilled(category));

  // An empty area being completed joins the list above rather than opening a
  // textarea inside a row of buttons — it is about to belong there anyway.
  const completing = editing !== null && !isFilled(editing) ? editing : null;
  const toComplete = empty.filter((category) => category !== completing);

  const rowFor = (category: AnamnesisCategory) => (
    <AnamnesisCategoryRow
      key={category}
      patientId={patientId}
      category={category}
      body={bodies.get(category) ?? ""}
      editing={editing === category}
      onEdit={() => setEditing(category)}
      onDone={() => setEditing(null)}
    />
  );

  return (
    <div className="flex flex-col gap-5">
      <Typography size="sm" tone="muted">
        {filled.length === anamnesisCategories.length
          ? `Les ${anamnesisCategories.length} domaines sont renseignés.`
          : `${filled.length} des ${anamnesisCategories.length} domaines renseignés.`}
      </Typography>

      {filled.length > 0 || completing !== null ? (
        <dl className="flex flex-col gap-5">
          {filled.map(rowFor)}
          {completing !== null ? rowFor(completing) : null}
        </dl>
      ) : null}

      {toComplete.length > 0 ? (
        <div className="border-border flex flex-col gap-2 border-t pt-4">
          <Typography as="h4" size="sm" weight="medium" tone="muted">
            À compléter
          </Typography>
          <div className="flex flex-wrap gap-2">
            {toComplete.map((category) => (
              <Button
                key={category}
                type="button"
                size="sm"
                variant="outline"
                onClick={() => setEditing(category)}
                aria-label={`Compléter « ${anamnesisCategoryLabels[category]} »`}
              >
                <Plus aria-hidden="true" />
                {anamnesisCategoryLabels[category]}
              </Button>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
};

type RowProps = {
  patientId: string;
  category: AnamnesisCategory;
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
            Modifier
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
