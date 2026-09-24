"use client";

import { ExternalLink, FileText, Link2, Plus } from "lucide-react";
import { useState } from "react";
import { uploadPatientFile } from "@remi/services/files/client";
import type { DocumentTag, PatientDocument } from "@remi/services/shared";
import {
  documentFileTypes,
  documentTags,
  formatDate,
  MAX_DOCUMENT_FILE_BYTES,
} from "@remi/services/shared";
import {
  Button,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@remi/ui";
import { Badge, Field, Input, Typography } from "@remi/ui/server";
import {
  documentKindLabels,
  documentTagLabels,
} from "@/components/patients/vocabulary";
import {
  addDocumentFileAction,
  addDocumentLinkAction,
  removeDocumentAction,
  updateDocumentAction,
  type DocumentFormState,
} from "@/lib/patients/actions";

/** One entry of the attachment picker: `goal:<id>`, `recipe:<id>`. */
export type AttachmentOption = { value: string; label: string };

type Props = {
  patientId: string;
  documents: readonly PatientDocument[];
  /** This patient's goals and recipe assignments, built server-side. */
  attachments: readonly AttachmentOption[];
  /** False when this deployment has no file store — links still work. */
  uploadsAvailable: boolean;
};

type Mode =
  | { kind: "view" }
  | { kind: "file" }
  | { kind: "link" }
  | { kind: "edit"; id: string }
  | { kind: "remove"; id: string };

const initial: DocumentFormState = { error: null, saved: false };

const UPLOAD_ROUTE = "/api/files/upload";

/** The picker's "none": Radix refuses an empty value on an item. */
const NO_ATTACHMENT = "none";

const attachmentValueOf = (document: PatientDocument) =>
  document.goalId
    ? `goal:${document.goalId}`
    : document.recipeAssignmentId
      ? `recipe:${document.recipeAssignmentId}`
      : NO_ATTACHMENT;

const fileStem = (name: string) => {
  const dot = name.lastIndexOf(".");
  return (dot > 0 ? name.slice(0, dot) : name).slice(0, 200);
};

type ChoiceFieldsProps = {
  idPrefix: string;
  attachments: readonly AttachmentOption[];
  tag?: DocumentTag;
  attachment?: string;
};

/** The tag and the one parent — shared by the three forms. */
const ChoiceFields = ({
  idPrefix,
  attachments,
  tag = "document",
  attachment = NO_ATTACHMENT,
}: ChoiceFieldsProps) => (
  <div className="grid gap-4 sm:grid-cols-[11rem_1fr]">
    <Field id={`${idPrefix}-tag`} label="Classer comme">
      <Select name="tag" defaultValue={tag}>
        <SelectTrigger id={`${idPrefix}-tag`}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {documentTags.map((value) => (
            <SelectItem key={value} value={value}>
              {documentTagLabels[value]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </Field>
    <Field
      id={`${idPrefix}-attach`}
      label="Rattacher à"
      hint="Un objectif ou une recette de la personne — il s’affiche aussi à côté."
    >
      <Select name="attachTo" defaultValue={attachment}>
        <SelectTrigger id={`${idPrefix}-attach`}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={NO_ATTACHMENT}>Rien</SelectItem>
          {attachments.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </Field>
  </div>
);

/**
 * Her documents on the patient's page — her 14 Sept § 3 option 2 and § 4:
 * recipe PDFs she sends today, the personalised list of fifteen foods, a meal
 * feedback, or a link. The patient reads them under « Mes documents », and
 * those classed as a recipe under « Mes recettes » too.
 *
 * A file goes from this browser straight to the private store under a grant
 * the server issues after checking her session and the patient; only then is
 * the row written, and the server re-checks what landed. The type and size
 * checks below are a courtesy that saves a round trip — the seam enforces
 * them either way.
 *
 * One mode at a time, as in the challenge section: each form posts against the
 * same list, and two open at once would post against each other.
 */
export const DocumentSection = ({
  patientId,
  documents,
  attachments,
  uploadsAvailable,
}: Props) => {
  const [mode, setMode] = useState<Mode>({ kind: "view" });
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const labelOf = (value: string) =>
    attachments.find((option) => option.value === value)?.label ?? null;

  const open = (next: Mode) => {
    setError(null);
    setMode(next);
  };

  const finish = (result: DocumentFormState) => {
    setError(result.error);
    if (!result.error) {
      setMode({ kind: "view" });
    }
  };

  const submit =
    (
      action: (
        previous: DocumentFormState,
        formData: FormData,
      ) => Promise<DocumentFormState>,
    ) =>
    async (formData: FormData) => {
      setPending(true);
      try {
        finish(await action(initial, formData));
      } catch {
        setError("L’enregistrement a échoué — réessayez.");
      } finally {
        setPending(false);
      }
    };

  const addFile = async (formData: FormData) => {
    const file = formData.get("file");
    if (!(file instanceof File) || file.size === 0) {
      setError("Choisissez un fichier.");
      return;
    }
    if (!(documentFileTypes as readonly string[]).includes(file.type)) {
      setError("Seuls les PDF et les images (JPEG, PNG, WebP) sont acceptés.");
      return;
    }
    if (file.size > MAX_DOCUMENT_FILE_BYTES) {
      setError("Le fichier dépasse 10 Mo.");
      return;
    }
    setPending(true);
    try {
      const { key } = await uploadPatientFile(patientId, file, UPLOAD_ROUTE);
      // The bytes are in the store; the action carries the key, never the file.
      formData.delete("file");
      formData.set("key", key);
      if (String(formData.get("title") ?? "").trim() === "") {
        formData.set("title", fileStem(file.name));
      }
      finish(await addDocumentFileAction(initial, formData));
    } catch {
      setError("L’envoi du fichier a échoué — réessayez.");
    } finally {
      setPending(false);
    }
  };

  const actions = (label: string) => (
    <div className="flex flex-wrap items-center gap-3">
      <Button type="submit" size="sm" disabled={pending}>
        {pending ? "Enregistrement…" : label}
      </Button>
      <Button
        type="button"
        size="sm"
        variant="ghost"
        onClick={() => open({ kind: "view" })}
      >
        Annuler
      </Button>
      {error ? (
        <Typography size="sm" className="text-error-text" role="alert">
          {error}
        </Typography>
      ) : null}
    </div>
  );

  return (
    <div className="flex flex-col gap-4">
      {documents.length === 0 ? (
        <Typography size="sm" tone="muted">
          Aucun document pour le moment.
        </Typography>
      ) : (
        <ul className="divide-border flex flex-col divide-y">
          {documents.map((document) => {
            const attachment = labelOf(attachmentValueOf(document));
            const editing = mode.kind === "edit" && mode.id === document.id;
            const removing = mode.kind === "remove" && mode.id === document.id;
            return (
              <li key={document.id} className="flex flex-col gap-3 py-3">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex min-w-0 flex-col gap-1">
                    <a
                      href={
                        document.kind === "file"
                          ? `/api/files/${document.id}`
                          : (document.url ?? "#")
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-foreground inline-flex items-center gap-1.5 font-medium underline-offset-4 hover:underline"
                    >
                      {document.kind === "file" ? (
                        <FileText aria-hidden="true" className="size-4" />
                      ) : (
                        <Link2 aria-hidden="true" className="size-4" />
                      )}
                      {document.title}
                    </a>
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="neutral" tone="subtle" size="sm">
                        {documentKindLabels[document.kind]}
                      </Badge>
                      <Badge
                        variant={document.tag === "recipe" ? "info" : "neutral"}
                        tone="subtle"
                        size="sm"
                      >
                        {documentTagLabels[document.tag]}
                      </Badge>
                      <Typography size="xs" tone="muted">
                        {[
                          `Ajouté le ${formatDate(document.addedOn)}`,
                          attachment,
                        ]
                          .filter((part) => part !== null)
                          .join(" · ")}
                      </Typography>
                    </div>
                  </div>
                  {mode.kind === "view" ? (
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => open({ kind: "edit", id: document.id })}
                      >
                        Modifier
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          open({ kind: "remove", id: document.id })
                        }
                      >
                        Retirer
                      </Button>
                    </div>
                  ) : null}
                </div>

                {editing ? (
                  <form
                    action={submit(updateDocumentAction)}
                    className="flex flex-col gap-4"
                  >
                    <input type="hidden" name="id" value={document.id} />
                    <Field id={`edit-${document.id}-title`} label="Titre">
                      <Input
                        id={`edit-${document.id}-title`}
                        name="title"
                        required
                        maxLength={200}
                        defaultValue={document.title}
                      />
                    </Field>
                    <ChoiceFields
                      idPrefix={`edit-${document.id}`}
                      attachments={attachments}
                      tag={document.tag}
                      attachment={attachmentValueOf(document)}
                    />
                    {actions("Enregistrer")}
                  </form>
                ) : null}

                {removing ? (
                  <form
                    action={submit(removeDocumentAction)}
                    className="border-border flex flex-col gap-3 rounded-md border p-3"
                  >
                    <input type="hidden" name="id" value={document.id} />
                    <Typography size="sm">
                      {document.kind === "file"
                        ? `Retirer « ${document.title} » ? Le fichier est supprimé du stockage et la personne ne le voit plus.`
                        : `Retirer le lien « ${document.title} » ? La personne ne le voit plus.`}
                    </Typography>
                    {actions("Retirer")}
                  </form>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}

      {mode.kind === "view" ? (
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              size="sm"
              disabled={!uploadsAvailable}
              onClick={() => open({ kind: "file" })}
            >
              <Plus aria-hidden="true" />
              Ajouter un fichier
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => open({ kind: "link" })}
            >
              <ExternalLink aria-hidden="true" />
              Ajouter un lien
            </Button>
          </div>
          {!uploadsAvailable ? (
            <Typography size="xs" tone="muted">
              L’envoi de fichiers n’est pas disponible sur ce déploiement —
              aucun stockage n’est configuré. Les liens fonctionnent.
            </Typography>
          ) : null}
        </div>
      ) : null}

      {mode.kind === "file" ? (
        <form action={addFile} className="flex flex-col gap-4">
          <input type="hidden" name="patientId" value={patientId} />
          <Field
            id="new-document-file"
            label="Fichier"
            hint="PDF ou image (JPEG, PNG, WebP), 10 Mo au plus."
          >
            <Input
              id="new-document-file"
              name="file"
              type="file"
              required
              accept={documentFileTypes.join(",")}
            />
          </Field>
          <Field
            id="new-document-file-title"
            label="Titre"
            optional
            hint="Ce que la personne lit. Vide : le nom du fichier."
          >
            <Input id="new-document-file-title" name="title" maxLength={200} />
          </Field>
          <ChoiceFields
            idPrefix="new-document-file"
            attachments={attachments}
          />
          {actions("Ajouter le fichier")}
        </form>
      ) : null}

      {mode.kind === "link" ? (
        <form
          action={submit(addDocumentLinkAction)}
          className="flex flex-col gap-4"
        >
          <input type="hidden" name="patientId" value={patientId} />
          <Field id="new-document-link-url" label="Adresse">
            <Input
              id="new-document-link-url"
              name="url"
              type="url"
              required
              maxLength={2000}
              placeholder="https://"
            />
          </Field>
          <Field id="new-document-link-title" label="Titre">
            <Input
              id="new-document-link-title"
              name="title"
              required
              maxLength={200}
            />
          </Field>
          <ChoiceFields
            idPrefix="new-document-link"
            attachments={attachments}
          />
          {actions("Ajouter le lien")}
        </form>
      ) : null}
    </div>
  );
};
