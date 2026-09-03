import { z } from "zod";
import { err, ok, type Result } from "../../../shared/result";
import { mealSlots } from "../../../shared/patient";
import type { Id } from "../../../types";
import { getDatabase } from "../../client";
import type { MealEntry } from "../../models/meal-entry";
import { getPatient, touchPatient } from "../patients";

/**
 * The meal journal — § 5's loop, transcribed out of WhatsApp and answered here.
 *
 * Two facts shape every read. A meal belongs to the day it was eaten, not the
 * evening it was typed up, so the order is `eatenOn` and backdating is the
 * normal case rather than a correction. And feedback arrives *after* the meal:
 * an entry with none is a valid, listable entry, and `feedbackWrittenAt` — set
 * when feedback first exists, cleared when it is emptied — is what turns "not
 * answered yet" into something the console can mark and `patient-link-segments`
 * can later read.
 *
 * Nothing here deletes by default. A meal she gave feedback on is part of the
 * record; the permanent delete exists for the row that should never have been
 * written, the same split as the pantry list next door.
 */

const entries = () =>
  getDatabase().collection<MealEntry>("patient_meal_entries");

const uuidSchema = z.uuid();

/** A day, not an instant — the same shape as the consultation date. */
const isoDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "a date is required")
  .refine(
    (value) => !Number.isNaN(new Date(`${value}T00:00:00Z`).getTime()),
    "that date is not valid",
  );

const entryFields = z.object({
  eatenOn: isoDate,
  /** `null` clears the slot; omitting the key leaves it as it was. */
  slot: z.enum(mealSlots).nullable(),
  description: z
    .string()
    .trim()
    .min(1, "a description is required")
    .max(2000, "that description is too long"),
  patientComment: z.string().trim().max(1000, "that comment is too long"),
  feedback: z.string().trim().max(2000, "that feedback is too long"),
  learning: z.string().trim().max(500, "that learning is too long"),
});

export type MealEntryInput = Partial<z.infer<typeof entryFields>>;

/** Newest meal first, with the transcription order breaking a shared day. */
const byMealDate = (a: MealEntry, b: MealEntry) => {
  if (a.eatenOn !== b.eatenOn) {
    return b.eatenOn.localeCompare(a.eatenOn);
  }
  return b.createdAt.getTime() - a.createdAt.getTime();
};

const allForPatient = async (patientId: Id): Promise<readonly MealEntry[]> => {
  if (!uuidSchema.safeParse(patientId).success) {
    return [];
  }
  const page = await entries().findMany({ patientId }, { limit: 500 });
  return [...page.items].sort(byMealDate);
};

/** The journal as Morgane reads it — newest meal first, archived excluded. */
export const listMealEntries = async (
  patientId: Id,
): Promise<readonly MealEntry[]> =>
  (await allForPatient(patientId)).filter((entry) => entry.archivedAt === null);

/** What was taken out of the journal, newest archive first. */
export const listArchivedMealEntries = async (
  patientId: Id,
): Promise<readonly MealEntry[]> =>
  (await allForPatient(patientId))
    .filter((entry) => entry.archivedAt !== null)
    .sort(
      (a, b) => (b.archivedAt?.getTime() ?? 0) - (a.archivedAt?.getTime() ?? 0),
    );

/**
 * The week's backlog, in one number: entries she has transcribed but not yet
 * answered. It is what the card marks — the journal chases nothing on its own.
 */
export const countMealEntriesAwaitingFeedback = async (
  patientId: Id,
): Promise<number> =>
  (await listMealEntries(patientId)).filter(
    (entry) => entry.feedbackWrittenAt === null,
  ).length;

export const getMealEntry = async (id: Id): Promise<Result<MealEntry>> => {
  if (!uuidSchema.safeParse(id).success) {
    return err("not_found", "no such meal entry");
  }
  const entry = await entries().findById(id);
  return entry ? ok(entry) : err("not_found", "no such meal entry");
};

/**
 * Feedback and its timestamp move together or not at all.
 *
 * Written as one helper because the two can never be allowed to disagree:
 * feedback with no timestamp reads as unanswered forever, and a timestamp with
 * no feedback marks a meal answered that nobody answered.
 */
const feedbackPatch = (
  feedback: string | undefined,
  existing: MealEntry | null,
) => {
  if (feedback === undefined) {
    return {};
  }
  if (feedback === "") {
    return { feedback: "", feedbackWrittenAt: null };
  }
  return {
    feedback,
    // An edit to feedback that already exists keeps the moment she first
    // answered — that is the fact the backlog and the link are reading.
    feedbackWrittenAt: existing?.feedbackWrittenAt ?? new Date(),
  };
};

export const addMealEntry = async (
  patientId: Id,
  input: MealEntryInput,
): Promise<Result<MealEntry>> => {
  if (!uuidSchema.safeParse(patientId).success) {
    return err("not_found", "no such patient");
  }
  const parsed = entryFields
    .partial({
      slot: true,
      patientComment: true,
      feedback: true,
      learning: true,
    })
    .safeParse(input);
  if (!parsed.success) {
    return err("invalid_input", parsed.error.issues[0].message);
  }
  if (!(await getPatient(patientId)).ok) {
    return err("not_found", "no such patient");
  }

  const created = await entries().insert({
    patientId,
    eatenOn: parsed.data.eatenOn,
    slot: parsed.data.slot ?? null,
    description: parsed.data.description,
    patientComment: parsed.data.patientComment ?? "",
    learning: parsed.data.learning ?? "",
    feedback: "",
    feedbackWrittenAt: null,
    archivedAt: null,
    ...feedbackPatch(parsed.data.feedback, null),
  });
  await touchPatient(patientId);
  return ok(created);
};

export const updateMealEntry = async (
  id: Id,
  input: MealEntryInput,
): Promise<Result<MealEntry>> => {
  if (!uuidSchema.safeParse(id).success) {
    return err("not_found", "no such meal entry");
  }
  const parsed = entryFields.partial().safeParse(input);
  if (!parsed.success) {
    return err("invalid_input", parsed.error.issues[0].message);
  }
  const existing = await entries().findById(id);
  if (!existing) {
    return err("not_found", "no such meal entry");
  }

  const { feedback, ...rest } = parsed.data;
  const updated = await entries().update(id, {
    ...rest,
    ...feedbackPatch(feedback, existing),
  });
  if (!updated) {
    return err("not_found", "no such meal entry");
  }
  await touchPatient(existing.patientId);
  return ok(updated);
};

export const archiveMealEntry = async (
  id: Id,
  archived: boolean,
): Promise<Result<MealEntry>> => {
  if (!uuidSchema.safeParse(id).success) {
    return err("not_found", "no such meal entry");
  }
  const updated = await entries().update(id, {
    archivedAt: archived ? new Date() : null,
  });
  if (!updated) {
    return err("not_found", "no such meal entry");
  }
  await touchPatient(updated.patientId);
  return ok(updated);
};

/**
 * The permanent one. Archiving is the everyday move; this is for the entry
 * logged against the wrong patient and caught immediately.
 */
export const deleteMealEntry = async (id: Id): Promise<Result<true>> => {
  if (!uuidSchema.safeParse(id).success) {
    return err("not_found", "no such meal entry");
  }
  const existing = await entries().findById(id);
  const removed = await entries().remove(id);
  if (!removed) {
    return err("not_found", "no such meal entry");
  }
  if (existing) {
    await touchPatient(existing.patientId);
  }
  return ok(true);
};
