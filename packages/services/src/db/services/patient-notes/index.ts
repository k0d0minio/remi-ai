import { z } from "zod";
import { err, ok, type Result } from "../../../shared/result";
import type { Id } from "../../../types";
import { getDatabase } from "../../client";
import type { PatientNote } from "../../models/patient-note";
import { touchPatient } from "../patients";

/**
 * The consultation notes behind a profile — Morgane's working record, and the
 * history that accumulates before the December launch.
 *
 * These never reach the patient link. That is a property of this service's
 * callers, not a flag on the row: no read path outside the admin console asks
 * for them, and adding one would be a deliberate decision rather than a
 * default that leaked.
 */

const notes = () => getDatabase().collection<PatientNote>("patient_notes");

const uuidSchema = z.uuid();

const isoDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "a consultation date is required")
  .refine(
    (value) => !Number.isNaN(new Date(`${value}T00:00:00Z`).getTime()),
    "that date is not valid",
  );

const noteFields = z.object({
  occurredAt: isoDate,
  title: z.string().trim().max(200),
  body: z.string().trim().max(20_000),
});

export type NoteInput = Partial<z.infer<typeof noteFields>>;

/**
 * Newest consultation first — the timeline reads backwards from today, which
 * is how Morgane reaches for the last session. `createdAt` breaks a tie
 * between two notes written for the same day.
 */
export const listPatientNotes = async (
  patientId: Id,
): Promise<readonly PatientNote[]> => {
  if (!uuidSchema.safeParse(patientId).success) {
    return [];
  }
  const page = await notes().findMany({ patientId }, { limit: 200 });
  return [...page.items].sort((a, b) => {
    const dateDelta = b.occurredAt.localeCompare(a.occurredAt);
    return dateDelta !== 0
      ? dateDelta
      : b.createdAt.getTime() - a.createdAt.getTime();
  });
};

export const addPatientNote = async (
  patientId: Id,
  input: NoteInput & { authorName?: string },
): Promise<Result<PatientNote>> => {
  if (!uuidSchema.safeParse(patientId).success) {
    return err("not_found", "no such patient");
  }
  const parsed = noteFields
    .partial({ title: true, body: true })
    .safeParse(input);
  if (!parsed.success) {
    return err("invalid_input", parsed.error.issues[0].message);
  }
  if (!parsed.data.title && !parsed.data.body) {
    return err(
      "invalid_input",
      "a note needs a title or something written in it",
    );
  }
  const created = await notes().insert({
    patientId,
    occurredAt: parsed.data.occurredAt,
    title: parsed.data.title ?? "",
    body: parsed.data.body ?? "",
    authorName: input.authorName?.trim() ?? "",
  });
  await touchPatient(patientId);
  return ok(created);
};

export const updatePatientNote = async (
  id: Id,
  input: NoteInput,
): Promise<Result<PatientNote>> => {
  if (!uuidSchema.safeParse(id).success) {
    return err("not_found", "no such note");
  }
  const parsed = noteFields.partial().safeParse(input);
  if (!parsed.success) {
    return err("invalid_input", parsed.error.issues[0].message);
  }
  const updated = await notes().update(id, parsed.data);
  if (!updated) {
    return err("not_found", "no such note");
  }
  await touchPatient(updated.patientId);
  return ok(updated);
};

export const deletePatientNote = async (id: Id): Promise<Result<true>> => {
  if (!uuidSchema.safeParse(id).success) {
    return err("not_found", "no such note");
  }
  const existing = await notes().findById(id);
  const removed = await notes().remove(id);
  if (!removed) {
    return err("not_found", "no such note");
  }
  if (existing) {
    await touchPatient(existing.patientId);
  }
  return ok(true);
};
