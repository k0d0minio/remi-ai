import { z } from "zod";
import { acceptStoredFile, getFileStore } from "../../../files";
import {
  documentTags,
  isPatientFileKey,
  type DocumentFileType,
} from "../../../shared/files";
import { todayAtPractice } from "../../../shared/format";
import { err, ok, type Result } from "../../../shared/result";
import type { Id } from "../../../types";
import { getDatabase, type DatabaseClient } from "../../client";
import type { PatientDocument } from "../../models/patient-document";
import type { PatientGoal } from "../../models/patient-goal";
import type { RecipeAssignment } from "../../models/recipe-assignment";
import { touchPatient } from "../patients";

/**
 * The documents Morgane puts on a patient's page — her 14 Sept document, § 3
 * option 2 and § 4: « Un document accessible dans son espace est suffisant. »
 *
 * Three rules live here:
 *
 * - **A file row points only at a checked object.** The browser uploads the
 *   bytes; this service asks the files seam what actually landed under the key,
 *   under this patient's prefix, before the row exists (`acceptStoredFile`).
 * - **One parent at most, and always this patient's** (D-26): a goal or a
 *   recipe assignment of the same patient, never both. The schema's check
 *   holds the "never both"; the ownership is checked here.
 * - **A removed file leaves the store first.** The row goes only once the
 *   object is gone, so a store failure leaves both in place rather than a
 *   file nothing points at.
 */

const documents = (db: DatabaseClient = getDatabase()) =>
  db.collection<PatientDocument>("patient_documents");

const uuidSchema = z.uuid();

const optionalId = z
  .union([z.uuid(), z.literal(""), z.null()])
  .optional()
  .transform((value) => value || null);

const commonFields = z.object({
  title: z.string().trim().min(1, "a title is required").max(200),
  tag: z.enum(documentTags),
  goalId: optionalId,
  recipeAssignmentId: optionalId,
});

const linkFields = commonFields.extend({
  url: z
    .url({ protocol: /^https$/, error: "a link starts with https://" })
    .max(2000),
});

const fileFields = commonFields.extend({
  key: z.string().min(1).max(500),
});

export type DocumentInput = z.input<typeof commonFields>;
export type DocumentLinkInput = z.input<typeof linkFields>;
export type DocumentFileInput = z.input<typeof fileFields>;

type Attachment = { goalId: Id | null; recipeAssignmentId: Id | null };

/** The parent, when there is one, must be this patient's — and only one. */
const checkAttachment = async (
  patientId: Id,
  attachment: Attachment,
): Promise<Result<Attachment>> => {
  if (attachment.goalId && attachment.recipeAssignmentId) {
    return err(
      "invalid_input",
      "a document attaches to a goal or a recipe, not both",
    );
  }
  if (attachment.goalId) {
    const goal = await getDatabase()
      .collection<PatientGoal>("patient_goals")
      .findById(attachment.goalId);
    if (!goal || goal.patientId !== patientId) {
      return err("invalid_input", "that goal is not this patient's");
    }
  }
  if (attachment.recipeAssignmentId) {
    const assignment = await getDatabase()
      .collection<RecipeAssignment>("patient_recipe_assignments")
      .findById(attachment.recipeAssignmentId);
    if (!assignment || assignment.patientId !== patientId) {
      return err("invalid_input", "that recipe is not this patient's");
    }
  }
  return ok(attachment);
};

const newestFirst = (a: PatientDocument, b: PatientDocument) => {
  const byDay = b.addedOn.localeCompare(a.addedOn);
  return byDay !== 0 ? byDay : b.createdAt.getTime() - a.createdAt.getTime();
};

/**
 * Every document of one patient, newest first. She adds a handful a month, so
 * a year is a few dozen rows and one page holds them all.
 */
export const listPatientDocuments = async (
  patientId: Id,
): Promise<readonly PatientDocument[]> => {
  if (!uuidSchema.safeParse(patientId).success) {
    return [];
  }
  const page = await documents().findMany({ patientId }, { limit: 500 });
  return [...page.items].sort(newestFirst);
};

export const getPatientDocument = async (
  id: Id,
): Promise<PatientDocument | null> => {
  if (!uuidSchema.safeParse(id).success) {
    return null;
  }
  return documents().findById(id);
};

/** Add a link — a title and an https URL she wants the patient to open. */
export const addPatientDocumentLink = async (
  patientId: Id,
  input: DocumentLinkInput,
  addedByEmail: string,
): Promise<Result<PatientDocument>> => {
  if (!uuidSchema.safeParse(patientId).success) {
    return err("not_found", "no such patient");
  }
  const parsed = linkFields.safeParse(input);
  if (!parsed.success) {
    return err("invalid_input", parsed.error.issues[0].message);
  }
  const attachment = await checkAttachment(patientId, parsed.data);
  if (!attachment.ok) {
    return attachment;
  }
  const created = await documents().insert({
    patientId,
    kind: "link",
    tag: parsed.data.tag,
    title: parsed.data.title,
    url: parsed.data.url,
    blobKey: null,
    mime: null,
    size: null,
    goalId: attachment.data.goalId,
    recipeAssignmentId: attachment.data.recipeAssignmentId,
    addedByEmail,
    addedOn: todayAtPractice(),
  });
  await touchPatient(patientId);
  return ok(created);
};

/**
 * A refused add leaves nothing behind: the browser already put the bytes in
 * the store, so a refusal before `acceptStoredFile` (which removes on its own
 * refusals) removes them here — only ever a key of this patient's, and never
 * one a row already points at. Best effort: a store that fails here leaves an
 * object the patient's deletion still sweeps.
 */
const discardUpload = async (patientId: Id, key: unknown) => {
  if (typeof key !== "string" || !isPatientFileKey(key, patientId)) {
    return;
  }
  const held = await documents().findMany(
    { patientId, blobKey: key },
    {
      limit: 1,
    },
  );
  if (held.items.length > 0) {
    return;
  }
  try {
    await getFileStore().remove(key);
  } catch {
    // Swept with the patient; nothing a caller could do differently.
  }
};

/**
 * Record a file the browser has uploaded under `key`. The seam checks the key
 * is under this patient's prefix and that what landed is an accepted type
 * within the cap — and removes it from the store when it is not.
 */
export const addPatientDocumentFile = async (
  patientId: Id,
  input: DocumentFileInput,
  addedByEmail: string,
): Promise<Result<PatientDocument>> => {
  if (!uuidSchema.safeParse(patientId).success) {
    return err("not_found", "no such patient");
  }
  const parsed = fileFields.safeParse(input);
  if (!parsed.success) {
    await discardUpload(patientId, input.key);
    return err("invalid_input", parsed.error.issues[0].message);
  }
  const attachment = await checkAttachment(patientId, parsed.data);
  if (!attachment.ok) {
    await discardUpload(patientId, parsed.data.key);
    return attachment;
  }
  // A replayed or retried submit names a key a row already holds: that row is
  // the answer, and a second one would lose its file when either is removed.
  const existing = await documents().findMany(
    { patientId, blobKey: parsed.data.key },
    { limit: 1 },
  );
  if (existing.items.length > 0) {
    return ok(existing.items[0]);
  }
  const stored = await acceptStoredFile(parsed.data.key, patientId);
  if (!stored.ok) {
    return stored;
  }
  const created = await documents().insert({
    patientId,
    kind: "file",
    tag: parsed.data.tag,
    title: parsed.data.title,
    url: null,
    blobKey: stored.data.key,
    mime: stored.data.contentType satisfies DocumentFileType,
    size: stored.data.size,
    goalId: attachment.data.goalId,
    recipeAssignmentId: attachment.data.recipeAssignmentId,
    addedByEmail,
    addedOn: todayAtPractice(),
  });
  await touchPatient(patientId);
  return ok(created);
};

/** Edit the title, the tag and the attachment. The file or URL stays. */
export const updatePatientDocument = async (
  id: Id,
  input: DocumentInput,
): Promise<Result<PatientDocument>> => {
  const existing = await getPatientDocument(id);
  if (!existing) {
    return err("not_found", "no such document");
  }
  const parsed = commonFields.safeParse(input);
  if (!parsed.success) {
    return err("invalid_input", parsed.error.issues[0].message);
  }
  const attachment = await checkAttachment(existing.patientId, parsed.data);
  if (!attachment.ok) {
    return attachment;
  }
  const updated = await documents().update(id, {
    title: parsed.data.title,
    tag: parsed.data.tag,
    goalId: attachment.data.goalId,
    recipeAssignmentId: attachment.data.recipeAssignmentId,
  });
  if (!updated) {
    return err("not_found", "no such document");
  }
  await touchPatient(existing.patientId);
  return ok(updated);
};

/**
 * Remove a document. A file leaves the store before its row does; when the
 * store refuses, nothing is removed and the caller says so.
 */
export const removePatientDocument = async (
  id: Id,
): Promise<Result<PatientDocument>> => {
  const existing = await getPatientDocument(id);
  if (!existing) {
    return err("not_found", "no such document");
  }
  if (existing.kind === "file" && existing.blobKey) {
    try {
      await getFileStore().remove(existing.blobKey);
    } catch {
      return err(
        "upstream_failed",
        "the file could not be removed from the store — nothing was removed",
      );
    }
  }
  const removed = await documents().remove(id);
  if (!removed) {
    return err("not_found", "no such document");
  }
  await touchPatient(existing.patientId);
  return ok(existing);
};
