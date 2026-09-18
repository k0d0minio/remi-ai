"use client";

import { ArrowLeft, Users } from "lucide-react";
import { useCallback, useState, useTransition } from "react";
import type { ProtocolCopyKindName } from "@remi/services/shared";
import { Button, Checkbox } from "@remi/ui";
import { Input, Typography } from "@remi/ui/server";
import {
  listCopySourcesAction,
  readCopyRowsAction,
  takeCopyRowsAction,
  type CopyRow,
  type CopySource,
  type TakenRows,
} from "@/lib/patients/reuse";

type Props = {
  /** The patient being edited — never offered as a source of her own rows. */
  patientId: string;
  kind: ProtocolCopyKindName;
  /**
   * How the empty state reads — « aucune recommandation en cours ». Written
   * whole rather than assembled from a noun, because French elision and gender
   * are not something a component should be guessing at.
   */
  emptyLabel: string;
  /** Hands back the blanked rows, or the recipe ids, for the grid to append. */
  onTaken: (taken: TakenRows) => void;
};

/**
 * « Reprendre de … » — one patient's rows read into this patient's open grid.
 *
 * Nothing is saved here: the chosen rows land in the grid unsaved, and it is
 * still the section's own « Enregistrer » that writes them. Cancel the section
 * and both patients are exactly as they were.
 *
 * A `<details>` rather than a dialog, and `type="button"` on everything: this
 * renders inside the section's form, so a stray submit would save the section
 * mid-pick. Nothing here carries a `name` either — the fields are controlled
 * React state and the confirm builds its own FormData, so none of it can ride
 * along with the section's save.
 *
 * Two steps, because they are two questions: which patient, then which of their
 * rows. The roster stays as it is — pseudonym and the last consultation, which
 * is what she recognises someone by, filtered by typing. No redesign.
 */
export const CopyFromPatient = ({
  patientId,
  kind,
  emptyLabel,
  onTaken,
}: Props) => {
  const [sources, setSources] = useState<readonly CopySource[] | null>(null);
  const [chosenSource, setChosenSource] = useState<CopySource | null>(null);
  const [rows, setRows] = useState<readonly CopyRow[]>([]);
  const [ticked, setTicked] = useState<readonly number[]>([]);
  const [search, setSearch] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const loadSources = useCallback(() => {
    if (sources !== null) {
      return;
    }
    startTransition(async () => {
      setSources(await listCopySourcesAction(patientId));
    });
  }, [patientId, sources]);

  const chooseSource = (source: CopySource) => {
    startTransition(async () => {
      const result = await readCopyRowsAction(source.id, kind);
      setError(result.error);
      if (result.error === null) {
        setChosenSource(source);
        setRows(result.rows);
        setTicked([]);
      }
    });
  };

  const back = () => {
    setChosenSource(null);
    setRows([]);
    setTicked([]);
    setError(null);
  };

  const toggle = (index: number, checked: boolean) => {
    setTicked((current) =>
      checked
        ? [...current, index]
        : current.filter((entry) => entry !== index),
    );
  };

  const take = () => {
    if (!chosenSource) {
      return;
    }
    const formData = new FormData();
    formData.set("kind", kind);
    formData.set("sourcePatientId", chosenSource.id);
    formData.set("targetPatientId", patientId);
    for (const index of ticked) {
      formData.append("rowIndex", String(index));
    }

    startTransition(async () => {
      const taken = await takeCopyRowsAction(formData);
      setError(taken.error);
      if (taken.error === null) {
        onTaken(taken);
        back();
      }
    });
  };

  const matching = (sources ?? []).filter((source) =>
    source.pseudonym.toLowerCase().includes(search.trim().toLowerCase()),
  );

  return (
    <details
      className="border-border rounded-md border p-3"
      onToggle={(event) => {
        if (event.currentTarget.open) {
          loadSources();
        }
      }}
    >
      <summary className="text-muted-foreground hover:text-foreground cursor-pointer text-sm">
        Reprendre de …
      </summary>

      <div className="flex flex-col gap-3 pt-3">
        {chosenSource === null ? (
          <SourceList
            sources={matching}
            loaded={sources !== null}
            pending={pending}
            search={search}
            onSearch={setSearch}
            onChoose={chooseSource}
          />
        ) : (
          <RowList
            source={chosenSource}
            rows={rows}
            ticked={ticked}
            emptyLabel={emptyLabel}
            pending={pending}
            onToggle={toggle}
            onBack={back}
            onTake={take}
          />
        )}

        {error ? (
          <Typography size="sm" className="text-error-text" role="alert">
            {error}
          </Typography>
        ) : null}
      </div>
    </details>
  );
};

type SourceListProps = {
  sources: readonly CopySource[];
  loaded: boolean;
  pending: boolean;
  search: string;
  onSearch: (value: string) => void;
  onChoose: (source: CopySource) => void;
};

const SourceList = ({
  sources,
  loaded,
  pending,
  search,
  onSearch,
  onChoose,
}: SourceListProps) => (
  <>
    <Input
      aria-label="Filtrer les patients"
      placeholder="Filtrer…"
      value={search}
      onChange={(event) => onSearch(event.target.value)}
    />

    {!loaded && pending ? (
      <Typography size="sm" tone="muted">
        Chargement…
      </Typography>
    ) : null}

    {loaded && sources.length === 0 ? (
      <Typography size="sm" tone="muted">
        Aucun autre patient.
      </Typography>
    ) : null}

    {sources.length > 0 ? (
      <div className="border-border max-h-64 overflow-y-auto rounded-lg border">
        {sources.map((source) => (
          <button
            key={source.id}
            type="button"
            onClick={() => onChoose(source)}
            disabled={pending}
            className="hover:bg-muted/50 border-border flex w-full items-center justify-between gap-3 border-b p-3 text-left last:border-b-0"
          >
            <Typography size="sm">{source.pseudonym}</Typography>
            <Typography size="sm" tone="muted">
              {source.lastConsultationOn ?? "aucune consultation"}
            </Typography>
          </button>
        ))}
      </div>
    ) : null}
  </>
);

type RowListProps = {
  source: CopySource;
  rows: readonly CopyRow[];
  ticked: readonly number[];
  emptyLabel: string;
  pending: boolean;
  onToggle: (index: number, checked: boolean) => void;
  onBack: () => void;
  onTake: () => void;
};

/**
 * The source's rows **in force** — the service's `list*` already leaves the
 * archived out, so a row she stopped for someone else is never offered to
 * start for this one.
 *
 * Each label carries the factual fields only, because that is all the server
 * sent: the « pourquoi » written for this source patient never reached this
 * browser, so it cannot be read off the list and cannot be copied by accident.
 */
const RowList = ({
  source,
  rows,
  ticked,
  emptyLabel,
  pending,
  onToggle,
  onBack,
  onTake,
}: RowListProps) => (
  <>
    <div className="flex items-center gap-2">
      <Button type="button" size="sm" variant="ghost" onClick={onBack}>
        <ArrowLeft aria-hidden="true" />
        Changer
      </Button>
      <Typography size="sm" weight="medium">
        {source.pseudonym}
      </Typography>
    </div>

    {rows.length === 0 ? (
      <Typography size="sm" tone="muted">
        {source.pseudonym} : {emptyLabel}.
      </Typography>
    ) : (
      <div className="border-border max-h-64 overflow-y-auto rounded-lg border">
        {rows.map((row) => (
          <label
            key={row.index}
            className="hover:bg-muted/50 border-border flex cursor-pointer items-center gap-3 border-b p-3 last:border-b-0"
          >
            <Checkbox
              checked={ticked.includes(row.index)}
              onCheckedChange={(checked) =>
                onToggle(row.index, checked === true)
              }
            />
            <Typography size="sm">{row.label}</Typography>
          </label>
        ))}
      </div>
    )}

    <div className="flex flex-wrap items-center gap-3">
      <Button
        type="button"
        size="sm"
        variant="outline"
        onClick={onTake}
        disabled={pending || ticked.length === 0}
      >
        <Users aria-hidden="true" />
        {pending
          ? "Reprise…"
          : ticked.length > 1
            ? `Reprendre ${ticked.length} lignes`
            : "Reprendre la ligne"}
      </Button>
      <Typography size="sm" tone="muted">
        Les lignes arrivent sans le texte écrit pour {source.pseudonym}.
      </Typography>
    </div>
  </>
);
