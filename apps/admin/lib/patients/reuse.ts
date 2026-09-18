"use server";

import {
  deleteProtocolTemplate,
  getPatient,
  listPatientNotes,
  listPantryEssentials,
  listPatientRecipes,
  listPatientRecommendations,
  listPatientSupplements,
  listPatients,
  listProtocolTemplates,
  renameProtocolTemplate,
  saveProtocolTemplate,
  setProtocolTemplateShared,
} from "@remi/services/server";
import {
  blankPersonalFields,
  isProtocolCopyKind,
  isProtocolTemplateKind,
  protocolKindFields,
  readProtocolRow,
  type ProtocolCopyKindName,
  type ProtocolRow,
  type ProtocolTemplateKindName,
} from "@remi/services/shared";
import { audit } from "@/lib/audit";
import { requireOperator } from "@/lib/auth/session";

/**
 * Reuse and duplicate — filling a section's grid from something that already
 * exists, rather than typing it a tenth time.
 *
 * Separate from `actions.ts` because it answers a different question: nothing
 * here writes to a patient. Copying reads one patient's rows into another
 * patient's *unsaved* grid, and inserting a template fills the same grid; both
 * reach the database only when she presses the section's own save, which is
 * still `actions.ts`'s batch action and is unchanged by any of this.
 *
 * The audit trail is the exception to "nothing here writes", and deliberately
 * so — see `recordedCopy` below.
 */

export type CopySource = {
  id: string;
  pseudonym: string;
  /** `YYYY-MM-DD` of her last consultation with them, or `null` if none. */
  lastConsultationOn: string | null;
};

export type CopyRow = {
  /** The row's index in the source list — how the confirm names what she ticked. */
  index: number;
  /** What the picker shows: the factual fields, already joined for display. */
  label: string;
};

export type CopyRowsResult = {
  error: string | null;
  rows: readonly CopyRow[];
};

export type TakenRows = {
  error: string | null;
  /** Protocol rows, blanked, ready to append to the grid. Empty for recipes. */
  rows: readonly ProtocolRow[];
  /** Recipe ids to tick in the assign form. Empty for the three protocol kinds. */
  recipeIds: readonly string[];
};

const asCopyKind = (value: string): ProtocolCopyKindName | null =>
  isProtocolCopyKind(value) ? value : null;

const asTemplateKind = (value: string): ProtocolTemplateKindName | null =>
  isProtocolTemplateKind(value) ? value : null;

/**
 * Her other patients, with the date of their last consultation.
 *
 * The notes are read in one page and reduced per patient rather than queried
 * per row: the seam speaks in exact-match filters only, and a roster that fits
 * in one page does not earn a query language (`listPatients` settles the same
 * question the same way). `occurredAt` is the consultation's own date, which is
 * what she recognises a patient by — not when the note was typed up.
 */
export const listCopySourcesAction = async (
  excludePatientId: string,
): Promise<readonly CopySource[]> => {
  await requireOperator();
  const patients = await listPatients();
  const others = patients.filter((patient) => patient.id !== excludePatientId);

  const sources = await Promise.all(
    others.map(async (patient) => {
      const notes = await listPatientNotes(patient.id);
      const last = notes.reduce<string | null>(
        (latest, note) =>
          latest === null || note.occurredAt.localeCompare(latest) > 0
            ? note.occurredAt
            : latest,
        null,
      );
      return {
        id: patient.id,
        pseudonym: patient.pseudonym,
        lastConsultationOn: last,
      };
    }),
  );

  // Most recently seen first: the patient she is thinking of is usually one of
  // the last few, and a patient never consulted sorts to the end rather than
  // to the top on an empty string.
  return sources.sort(
    (a, b) =>
      (b.lastConsultationOn ?? "").localeCompare(a.lastConsultationOn ?? "") ||
      a.pseudonym.localeCompare(b.pseudonym, "fr"),
  );
};

/**
 * One source patient's rows of a kind, as the picker lists them.
 *
 * Only what is **in force** — `listX` already excludes the archived, which is
 * the criterion "archived rows are never offered": a row she stopped for
 * someone else is not a row to start for this one.
 *
 * The labels carry the factual fields only. That is not just display economy:
 * the personal text never reaches this browser at all, so a « pourquoi »
 * written for someone else cannot be read off a picker it was never sent to.
 */
export const readCopyRowsAction = async (
  sourcePatientId: string,
  kind: string,
): Promise<CopyRowsResult> => {
  await requireOperator();
  const copyKind = asCopyKind(kind);
  if (!copyKind) {
    return { error: "Type de lignes inconnu.", rows: [] };
  }
  const source = await getPatient(sourcePatientId);
  if (!source.ok) {
    return { error: "Ce patient n'existe plus.", rows: [] };
  }

  const labels = await copyLabels(sourcePatientId, copyKind);
  return {
    error: null,
    rows: labels.map((label, index) => ({ index, label })),
  };
};

const copyLabels = async (
  patientId: string,
  kind: ProtocolCopyKindName,
): Promise<readonly string[]> => {
  if (kind === "recommendation") {
    const rows = await listPatientRecommendations(patientId);
    return rows.map((row) => row.title);
  }
  if (kind === "supplement") {
    const rows = await listPatientSupplements(patientId);
    return rows.map((row) =>
      [row.name, row.dose, row.timing]
        .filter((part) => part.length > 0)
        .join(" · "),
    );
  }
  if (kind === "pantry") {
    const rows = await listPantryEssentials(patientId);
    return rows.map((row) => row.item);
  }
  return (await assignableRecipes(patientId)).map(
    (entry) => entry.recipe.title,
  );
};

/**
 * The source's recipes that can actually be handed on: still assigned to them,
 * and still active in the library.
 *
 * The second half matters because the assign form offers the active library
 * only. A recipe she retired months ago can still sit on an old assignment, and
 * offering it here would tick a row the form has no checkbox for — a copy that
 * silently does nothing.
 */
const assignableRecipes = async (patientId: string) =>
  (await listPatientRecipes(patientId)).filter(
    (entry) => entry.recipe.archivedAt === null,
  );

/**
 * Take the ticked rows: re-read them on the server, blank the personal fields,
 * record the copy, and hand back what the grid should append.
 *
 * Re-read rather than trusting what the picker posted, so the audit event's
 * count is the number of rows that actually crossed and not a number the
 * browser asserted. The indexes are matched against the same ordered list the
 * picker was built from.
 */
export const takeCopyRowsAction = async (
  formData: FormData,
): Promise<TakenRows> => {
  const operator = await requireOperator();
  const empty = { rows: [], recipeIds: [] };

  const kind = asCopyKind(String(formData.get("kind") ?? ""));
  if (!kind) {
    return { error: "Type de lignes inconnu.", ...empty };
  }
  const sourcePatientId = String(formData.get("sourcePatientId") ?? "");
  const targetPatientId = String(formData.get("targetPatientId") ?? "");
  const chosen = formData
    .getAll("rowIndex")
    .map((value) => Number(value))
    .filter((index) => Number.isInteger(index) && index >= 0);

  if (chosen.length === 0) {
    return { error: "Aucune ligne sélectionnée.", ...empty };
  }

  const source = await getPatient(sourcePatientId);
  if (!source.ok) {
    return { error: "Ce patient n'existe plus.", ...empty };
  }

  const taken =
    kind === "recipe"
      ? await takeRecipes(sourcePatientId, chosen)
      : await takeProtocolRows(sourcePatientId, kind, chosen);

  const count = taken.rows.length + taken.recipeIds.length;
  if (count === 0) {
    return { error: "Ces lignes ne sont plus disponibles.", ...empty };
  }

  await recordedCopy(operator, source.data.pseudonym, targetPatientId, count);
  return { error: null, ...taken };
};

const takeProtocolRows = async (
  sourcePatientId: string,
  kind: ProtocolTemplateKindName,
  chosen: readonly number[],
): Promise<{ rows: ProtocolRow[]; recipeIds: string[] }> => {
  const stored = await sourceRows(sourcePatientId, kind);
  const rows = chosen
    .map((index) => stored[index])
    .filter((row) => row !== undefined)
    .map((row) => blankPersonalFields(kind, readProtocolRow(kind, row)));
  return { rows, recipeIds: [] };
};

const sourceRows = async (
  patientId: string,
  kind: ProtocolTemplateKindName,
): Promise<readonly ProtocolRow[]> => {
  if (kind === "recommendation") {
    return (await listPatientRecommendations(patientId)).map((row) => ({
      category: row.category,
      title: row.title,
      detail: row.detail,
    }));
  }
  if (kind === "supplement") {
    return (await listPatientSupplements(patientId)).map((row) => ({
      name: row.name,
      dose: row.dose,
      timing: row.timing,
      reason: row.reason,
    }));
  }
  return (await listPantryEssentials(patientId)).map((row) => ({
    item: row.item,
    why: row.why,
  }));
};

/**
 * Recipes copy as references, never as rows: the library row is shared and the
 * giving is what is personal, so what crosses is which dishes she chose. The
 * note and the date are not carried at all — the assign form supplies a blank
 * note and today, which is the criterion.
 */
const takeRecipes = async (
  sourcePatientId: string,
  chosen: readonly number[],
): Promise<{ rows: ProtocolRow[]; recipeIds: string[] }> => {
  const given = await assignableRecipes(sourcePatientId);
  const recipeIds = chosen
    .map((index) => given[index])
    .filter((entry) => entry !== undefined)
    .map((entry) => entry.recipe.id);
  return { rows: [], recipeIds };
};

/**
 * The one write in this file, and the reason it is a write at all.
 *
 * Health data has just crossed from one patient's record into another's. It is
 * an operator inside her own console, so no new permission stands in the way
 * (`business/roles` § Operator) — but it is recorded, naming the patient it
 * came from. It fires here rather than at the section's save because she may
 * abandon the grid without saving, and a copy that left no trace because it was
 * never committed is exactly the case worth having a trail for.
 */
const recordedCopy = async (
  operator: Awaited<ReturnType<typeof requireOperator>>,
  sourcePseudonym: string,
  targetPatientId: string,
  count: number,
) => {
  const target = await getPatient(targetPatientId);
  await audit(operator, "protocol.copied_from_patient", {
    type: "patient",
    id: targetPatientId,
    label: target.ok ? target.data.pseudonym : "",
    detail: `${count} ligne(s) reprise(s) de ${sourcePseudonym}`,
  });
};

/**
 * Personal templates. Listing and inserting are reads — a template holds no
 * patient's data by the time it is stored, so inserting one records nothing.
 * The four writes below each record one event.
 */

export type TemplateListResult = {
  error: string | null;
  templates: readonly TemplateSummary[];
};

export type TemplateSummary = {
  id: string;
  name: string;
  shared: boolean;
  owned: boolean;
  rows: readonly ProtocolRow[];
};

export type TemplateWriteResult = { error: string | null };

export const listTemplatesAction = async (
  kind: string,
): Promise<TemplateListResult> => {
  const operator = await requireOperator();
  const templateKind = asTemplateKind(kind);
  if (!templateKind) {
    return { error: "Type de modèle inconnu.", templates: [] };
  }
  const templates = await listProtocolTemplates(operator.id, templateKind);
  return {
    error: null,
    templates: templates.map((template) => ({
      id: template.id,
      name: template.name,
      shared: template.shared,
      owned: template.owned,
      rows: template.rows,
    })),
  };
};

/**
 * Save the adapted rows under a name. The rows arrive already blanked by the
 * preview she adapted them in, so what is stored is text she wrote for the
 * template rather than text lifted off a patient.
 */
export const saveTemplateAction = async (
  formData: FormData,
): Promise<TemplateWriteResult> => {
  const operator = await requireOperator();
  const templateKind = asTemplateKind(String(formData.get("kind") ?? ""));
  if (!templateKind) {
    return { error: "Type de modèle inconnu." };
  }
  const name = String(formData.get("name") ?? "");

  const rows = templateRowsFrom(formData, templateKind);
  const saved = await saveProtocolTemplate(
    operator.id,
    templateKind,
    name,
    rows,
  );
  if (!saved.ok) {
    return { error: saved.message };
  }

  await audit(
    operator,
    saved.data.overwritten ? "template.overwritten" : "template.saved",
    {
      type: "protocol_template",
      id: saved.data.template.id,
      label: saved.data.template.name,
      detail: `${saved.data.template.rows.length} ligne(s)`,
    },
  );
  return { error: null };
};

/**
 * The preview posts one input per field per row, the same column-wise shape the
 * section grids use — so the order of the rows in the form is the order she put
 * them in, with no index bookkeeping in the field names.
 */
const templateRowsFrom = (
  formData: FormData,
  kind: ProtocolTemplateKindName,
): readonly ProtocolRow[] => {
  const fields = protocolKindFields(kind);
  const columns = fields.map((name) =>
    formData.getAll(`row-${name}`).map((value) => String(value)),
  );
  const height = Math.min(...columns.map((column) => column.length));
  return Array.from({ length: height }, (_unused, index) =>
    readProtocolRow(
      kind,
      Object.fromEntries(
        fields.map((name, column) => [name, columns[column][index] ?? ""]),
      ),
    ),
  );
};

export const renameTemplateAction = async (
  formData: FormData,
): Promise<TemplateWriteResult> => {
  const operator = await requireOperator();
  const id = String(formData.get("templateId") ?? "");
  const name = String(formData.get("name") ?? "");

  const renamed = await renameProtocolTemplate(id, operator.id, name);
  if (!renamed.ok) {
    return { error: renamed.message };
  }
  await audit(operator, "template.renamed", {
    type: "protocol_template",
    id,
    label: renamed.data.name,
  });
  return { error: null };
};

export const deleteTemplateAction = async (
  formData: FormData,
): Promise<TemplateWriteResult> => {
  const operator = await requireOperator();
  const id = String(formData.get("templateId") ?? "");

  const removed = await deleteProtocolTemplate(id, operator.id);
  if (!removed.ok) {
    return { error: removed.message };
  }
  await audit(operator, "template.deleted", {
    type: "protocol_template",
    id,
    label: removed.data.name,
  });
  return { error: null };
};

export const shareTemplateAction = async (
  formData: FormData,
): Promise<TemplateWriteResult> => {
  const operator = await requireOperator();
  const id = String(formData.get("templateId") ?? "");
  const shared = String(formData.get("shared") ?? "") === "true";

  const updated = await setProtocolTemplateShared(id, operator.id, shared);
  if (!updated.ok) {
    return { error: updated.message };
  }
  await audit(operator, shared ? "template.shared" : "template.unshared", {
    type: "protocol_template",
    id,
    label: updated.data.name,
  });
  return { error: null };
};
