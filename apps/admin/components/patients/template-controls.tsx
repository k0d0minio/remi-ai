"use client";

import { BookmarkPlus, Check, Pencil, Share2, Trash2, X } from "lucide-react";
import { useCallback, useState, useTransition } from "react";
import {
  blankPersonalFieldsOf,
  protocolKindFields,
  type ProtocolField,
  type ProtocolRow,
  type ProtocolTemplateKindName,
} from "@remi/services/shared";
import { Button, Checkbox } from "@remi/ui";
import { Field, Input, Typography } from "@remi/ui/server";
import {
  deleteTemplateAction,
  listTemplatesAction,
  renameTemplateAction,
  saveTemplateAction,
  shareTemplateAction,
  type TemplateSummary,
} from "@/lib/patients/reuse";

/**
 * Enter in a text input implicitly submits the form it sits in, and every input
 * below sits inside the section's own form. `type="button"` on the controls does
 * not cover that path — only swallowing the key does. Without this, Enter while
 * naming a template saves the whole section and discards the preview.
 */
const swallowEnter = (event: { key: string; preventDefault: () => void }) => {
  if (event.key === "Enter") {
    event.preventDefault();
  }
};

/** The row fields, as the console names them. Written where they render. */
const fieldLabels: Record<string, string> = {
  category: "Catégorie",
  title: "Titre",
  detail: "Détail",
  name: "Nom",
  dose: "Dose",
  timing: "Moment",
  reason: "Raison",
  item: "Aliment",
  why: "Pourquoi",
};

type Props = {
  kind: ProtocolTemplateKindName;
  /** The grid's rows right now — what « Enregistrer comme modèle » starts from. */
  currentRows: readonly ProtocolRow[];
  /** Appends a template's rows to the grid, unsaved. */
  onInsert: (rows: readonly ProtocolRow[]) => void;
};

/**
 * Personal templates — a named set of rows saved once and inserted anywhere.
 *
 * Two disclosures inside the section's own form, so everything is
 * `type="button"` and nothing carries a `name`: a stray submit would save the
 * section mid-edit, and a named input would ride along with the section's rows.
 * Each write builds its own FormData.
 *
 * Inserting a template writes nothing and records nothing. By the time a set is
 * stored it holds no patient's data — the personal fields were blanked into the
 * preview before she named it — so there is nothing to record on the way out.
 */
export const TemplateControls = ({ kind, currentRows, onInsert }: Props) => {
  const [templates, setTemplates] = useState<readonly TemplateSummary[] | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const load = useCallback(() => {
    startTransition(async () => {
      const result = await listTemplatesAction(kind);
      setError(result.error);
      setTemplates(result.templates);
    });
  }, [kind]);

  const loadOnce = useCallback(() => {
    if (templates === null) {
      load();
    }
  }, [load, templates]);

  /** Every write re-lists afterwards: the list is the surface it changed. */
  const run = (action: () => Promise<{ error: string | null }>) => {
    startTransition(async () => {
      const result = await action();
      setError(result.error);
      if (result.error === null) {
        load();
      }
    });
  };

  return (
    <div className="flex flex-col gap-3">
      <details
        className="border-border rounded-md border p-3"
        onToggle={(event) => {
          if (event.currentTarget.open) {
            loadOnce();
          }
        }}
      >
        <summary className="text-muted-foreground hover:text-foreground cursor-pointer text-sm">
          Insérer un modèle
        </summary>
        <div className="flex flex-col gap-3 pt-3">
          <TemplateList
            templates={templates}
            pending={pending}
            onInsert={onInsert}
            onRename={(id, name) =>
              run(async () => {
                const formData = new FormData();
                formData.set("templateId", id);
                formData.set("name", name);
                return renameTemplateAction(formData);
              })
            }
            onDelete={(id) =>
              run(async () => {
                const formData = new FormData();
                formData.set("templateId", id);
                return deleteTemplateAction(formData);
              })
            }
            onShare={(id, shared) =>
              run(async () => {
                const formData = new FormData();
                formData.set("templateId", id);
                formData.set("shared", String(shared));
                return shareTemplateAction(formData);
              })
            }
          />
        </div>
      </details>

      <SaveAsTemplate
        kind={kind}
        currentRows={currentRows}
        ownNames={(templates ?? [])
          .filter((template) => template.owned)
          .map((template) => template.name)}
        namesLoaded={templates !== null}
        onOpen={loadOnce}
        pending={pending}
        onSaved={() => {
          setError(null);
          load();
        }}
        onError={setError}
      />

      {error ? (
        <Typography size="sm" className="text-error-text" role="alert">
          {error}
        </Typography>
      ) : null}
    </div>
  );
};

type ListProps = {
  templates: readonly TemplateSummary[] | null;
  pending: boolean;
  onInsert: (rows: readonly ProtocolRow[]) => void;
  onRename: (id: string, name: string) => void;
  onDelete: (id: string) => void;
  onShare: (id: string, shared: boolean) => void;
};

/**
 * Her own sets and the ones another operator shared, in one list.
 *
 * Rename, delete and the share toggle are offered on her own sets only. That is
 * a courtesy, not the control — the service refuses the same three from anyone
 * but the owner (`apps/admin/AGENTS.md`: every guard is asserted twice) — but
 * offering an action that will be refused is its own kind of wrong.
 */
const TemplateList = ({
  templates,
  pending,
  onInsert,
  onRename,
  onDelete,
  onShare,
}: ListProps) => {
  const [renaming, setRenaming] = useState<string | null>(null);
  const [newName, setNewName] = useState("");
  const [confirming, setConfirming] = useState<string | null>(null);

  if (templates === null) {
    return (
      <Typography size="sm" tone="muted">
        Chargement…
      </Typography>
    );
  }

  if (templates.length === 0) {
    return (
      <Typography size="sm" tone="muted">
        Aucun modèle pour cette section. Enregistrez-en un depuis une grille.
      </Typography>
    );
  }

  return (
    <div className="border-border overflow-hidden rounded-lg border">
      {templates.map((template) => (
        <div
          key={template.id}
          className="border-border flex flex-col gap-2 border-b p-3 last:border-b-0"
        >
          {renaming === template.id ? (
            <div className="flex flex-wrap items-end gap-2">
              <Field
                id={`rename-${template.id}`}
                label="Nouveau nom"
                className="flex-1"
              >
                <Input
                  id={`rename-${template.id}`}
                  value={newName}
                  maxLength={120}
                  onChange={(event) => setNewName(event.target.value)}
                  onKeyDown={swallowEnter}
                />
              </Field>
              <Button
                type="button"
                size="sm"
                disabled={pending || newName.trim().length === 0}
                onClick={() => {
                  onRename(template.id, newName);
                  setRenaming(null);
                }}
              >
                <Check aria-hidden="true" />
                Renommer
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => setRenaming(null)}
              >
                <X aria-hidden="true" />
                Annuler
              </Button>
            </div>
          ) : (
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-col">
                <Typography size="sm" weight="medium">
                  {template.name}
                </Typography>
                <Typography size="sm" tone="muted">
                  {template.rows.length} ligne(s)
                  {template.owned
                    ? template.shared
                      ? " · partagé"
                      : ""
                    : " · partagé par un autre opérateur"}
                </Typography>
              </div>

              <div className="flex flex-wrap items-center gap-1">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  disabled={pending}
                  onClick={() => onInsert(template.rows)}
                >
                  Insérer
                </Button>

                {template.owned ? (
                  <>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      disabled={pending}
                      aria-label={`Renommer ${template.name}`}
                      onClick={() => {
                        setRenaming(template.id);
                        setNewName(template.name);
                      }}
                    >
                      <Pencil aria-hidden="true" />
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      disabled={pending}
                      aria-label={
                        template.shared
                          ? `Ne plus partager ${template.name}`
                          : `Partager ${template.name}`
                      }
                      onClick={() => onShare(template.id, !template.shared)}
                    >
                      <Share2 aria-hidden="true" />
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      disabled={pending}
                      aria-label={`Supprimer ${template.name}`}
                      onClick={() => setConfirming(template.id)}
                    >
                      <Trash2 aria-hidden="true" />
                    </Button>
                  </>
                ) : null}
              </div>
            </div>
          )}

          {confirming === template.id ? (
            <div className="flex flex-wrap items-center gap-2">
              <Typography size="sm">
                Supprimer « {template.name} » ? Les lignes déjà insérées ne
                bougent pas.
              </Typography>
              <Button
                type="button"
                size="sm"
                variant="error"
                disabled={pending}
                onClick={() => {
                  onDelete(template.id);
                  setConfirming(null);
                }}
              >
                Supprimer
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => setConfirming(null)}
              >
                Annuler
              </Button>
            </div>
          ) : null}
        </div>
      ))}
    </div>
  );
};

type SaveProps = {
  kind: ProtocolTemplateKindName;
  currentRows: readonly ProtocolRow[];
  /** The names her own sets already use — what makes a save an overwrite. */
  ownNames: readonly string[];
  /**
   * Whether that list has actually arrived. An empty `ownNames` is ambiguous —
   * she may have no templates, or the list may have failed to load — and
   * treating the second case as the first would silently replace a set instead
   * of asking. Until it has loaded, the save waits.
   */
  namesLoaded: boolean;
  /** Loads that list, for the case where she never opened the insert panel. */
  onOpen: () => void;
  pending: boolean;
  onSaved: () => void;
  onError: (message: string | null) => void;
};

/**
 * « Enregistrer comme modèle » — the grid's rows, with the personal fields
 * already blanked, opened for her to adapt before she names the set.
 *
 * The blanking happens on the way *in* to this preview, not on the way out: a
 * template saved straight off a patient's grid would carry that patient's
 * wording into every future insert. What she types here she typed for the
 * template, which is why a template may hold a « raison » at all.
 */
const SaveAsTemplate = ({
  kind,
  currentRows,
  ownNames,
  namesLoaded,
  onOpen,
  pending,
  onSaved,
  onError,
}: SaveProps) => {
  const [rows, setRows] = useState<ProtocolRow[] | null>(null);
  const [name, setName] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  // Its own flag rather than the parent's transition: two clicks before the
  // first settles would insert the set twice, and the name's uniqueness is the
  // service's rule, not a database constraint.
  const [saving, setSaving] = useState(false);
  const fields = protocolKindFields(kind);

  /**
   * Whether this name would replace one of her own sets. Compared the way the
   * service compares it — case- and accent-insensitively — so the question she
   * is asked and the write that follows agree about what « déjà pris » means.
   */
  const replaces = ownNames.some(
    (existing) =>
      existing.localeCompare(name.trim(), "fr", { sensitivity: "base" }) === 0,
  );

  const open = () => {
    onError(null);
    setName("");
    setConfirmed(false);
    onOpen();
    setRows(blankPersonalFieldsOf(kind, currentRows));
  };

  const setField = (index: number, field: ProtocolField, value: string) => {
    setRows((current) =>
      (current ?? []).map((row, position) =>
        position === index ? { ...row, [field]: value } : row,
      ),
    );
  };

  const save = async () => {
    if (saving) {
      return;
    }
    setSaving(true);
    try {
      const formData = new FormData();
      formData.set("kind", kind);
      formData.set("name", name);
      for (const row of rows ?? []) {
        for (const field of fields) {
          formData.append(`row-${field}`, row[field] ?? "");
        }
      }
      const result = await saveTemplateAction(formData);
      onError(result.error);
      if (result.error === null) {
        setRows(null);
        setName("");
        setConfirmed(false);
        onSaved();
      }
    } finally {
      // Without this the form stays stuck at "Enregistrement…" on a throw, and
      // the only way out discards the rows she just adapted.
      setSaving(false);
    }
  };

  if (rows === null) {
    return (
      <div>
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={pending || currentRows.length === 0}
          onClick={open}
        >
          <BookmarkPlus aria-hidden="true" />
          Enregistrer comme modèle
        </Button>
      </div>
    );
  }

  return (
    <div className="border-border flex flex-col gap-3 rounded-md border p-3">
      <Typography size="sm" weight="medium">
        Nouveau modèle
      </Typography>
      <Typography size="sm" tone="muted">
        Le texte écrit pour ce patient a été retiré. Complétez ce qui vaut pour
        tout le monde, puis nommez le modèle.
      </Typography>

      {rows.map((row, index) => (
        <div
          key={index}
          className="border-border flex flex-col gap-2 border-b pb-3 last:border-b-0"
        >
          {fields.map((field) => (
            <Field
              key={field}
              id={`template-${index}-${field}`}
              label={fieldLabels[field] ?? field}
            >
              <Input
                id={`template-${index}-${field}`}
                value={row[field] ?? ""}
                maxLength={500}
                onChange={(event) => setField(index, field, event.target.value)}
                onKeyDown={swallowEnter}
              />
            </Field>
          ))}
        </div>
      ))}

      <Field id="template-name" label="Nom du modèle">
        <Input
          id="template-name"
          value={name}
          maxLength={120}
          placeholder="ex. Base anti-inflammatoire"
          onChange={(event) => {
            setName(event.target.value);
            setConfirmed(false);
          }}
          onKeyDown={swallowEnter}
        />
      </Field>

      {replaces ? (
        <label className="flex cursor-pointer items-center gap-2">
          <Checkbox
            checked={confirmed}
            onCheckedChange={(checked) => setConfirmed(checked === true)}
          />
          <Typography size="sm">
            « {name.trim()} » existe déjà — remplacer ses lignes.
          </Typography>
        </label>
      ) : null}

      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          size="sm"
          disabled={
            pending ||
            saving ||
            !namesLoaded ||
            name.trim().length === 0 ||
            (replaces && !confirmed)
          }
          onClick={() => void save()}
        >
          <Check aria-hidden="true" />
          {saving
            ? "Enregistrement…"
            : replaces
              ? "Remplacer le modèle"
              : "Enregistrer le modèle"}
        </Button>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={() => setRows(null)}
        >
          <X aria-hidden="true" />
          Annuler
        </Button>
      </div>
    </div>
  );
};
