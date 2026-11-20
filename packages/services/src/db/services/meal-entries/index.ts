import { z } from "zod";
import { err, ok, type Result } from "../../../shared/result";
import { mealIntents, mealSlots } from "../../../shared/patient";
import { todayAtPractice } from "../../../shared/format";
import {
  checkPlannedMealText,
  PLANNED_MEALS_PER_DAY,
} from "../../../shared/planned-meal";
import type { Id } from "../../../types";
import { getDatabase } from "../../client";
import type { MealEntry, WrittenBy } from "../../models/meal-entry";
import { getPatient, touchPatient } from "../patients";
import { byPatient, byRecord, noSuchPatient, systemActor } from "../access";

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
  /**
   * Which of § 8's two sentences this is. Validated like any other posted
   * value rather than set by the code path the way `writtenBy` is: claiming an
   * intent forges nothing, where claiming an authorship would.
   */
  intent: z.enum(mealIntents),
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
const unscopedListMealEntries = async (
  patientId: Id,
): Promise<readonly MealEntry[]> =>
  (await allForPatient(patientId)).filter((entry) => entry.archivedAt === null);

/** What was taken out of the journal, newest archive first. */
const unscopedListArchivedMealEntries = async (
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
const unscopedCountMealEntriesAwaitingFeedback = async (
  patientId: Id,
): Promise<number> =>
  (await unscopedListMealEntries(patientId)).filter(
    (entry) => entry.feedbackWrittenAt === null,
  ).length;

const unscopedGetMealEntry = async (id: Id): Promise<Result<MealEntry>> => {
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
type FeedbackPatch = Partial<Pick<MealEntry, "feedback" | "feedbackWrittenAt">>;

const feedbackPatch = (
  feedback: string | undefined,
  existing: MealEntry | null,
): FeedbackPatch => {
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

/**
 * `writtenBy` is a third argument rather than a field of `input`, and that is
 * the point: `input` is parsed from what a form posted, so an attribution
 * living there could be claimed by whoever posts it. This one is set by the
 * code path — the console's form leaves the default, and a patient's entry
 * arrives through `writeThroughPatientLink`, which is the only caller that
 * knows the token resolved.
 */
const unscopedAddMealEntry = async (
  patientId: Id,
  input: MealEntryInput,
  writtenBy: WrittenBy = "practitioner",
): Promise<Result<MealEntry>> => {
  if (!uuidSchema.safeParse(patientId).success) {
    return err("not_found", "no such patient");
  }
  const parsed = entryFields
    .partial({
      slot: true,
      intent: true,
      patientComment: true,
      feedback: true,
      learning: true,
    })
    .safeParse(input);
  if (!parsed.success) {
    return err("invalid_input", parsed.error.issues[0].message);
  }
  if (!(await getPatient(systemActor, patientId)).ok) {
    return err("not_found", "no such patient");
  }

  // Feedback at transcription time is unusual but legal — she sometimes
  // answers as she logs — so the stamp is decided here on the same rule the
  // patch uses, rather than left for a second write to set.
  const feedback = parsed.data.feedback ?? "";
  const created = await entries().insert({
    patientId,
    eatenOn: parsed.data.eatenOn,
    slot: parsed.data.slot ?? null,
    description: parsed.data.description,
    patientComment: parsed.data.patientComment ?? "",
    learning: parsed.data.learning ?? "",
    intent: parsed.data.intent ?? "eaten",
    feedback,
    feedbackWrittenAt: feedback === "" ? null : new Date(),
    archivedAt: null,
    writtenBy,
  });
  await touchPatient(patientId);
  return ok(created);
};

const unscopedUpdateMealEntry = async (
  id: Id,
  input: MealEntryInput,
): Promise<Result<MealEntry>> => {
  if (!uuidSchema.safeParse(id).success) {
    return err("not_found", "no such meal entry");
  }
  // `intent` is omitted rather than ignored: the transition is one-way and
  // belongs to `markMealEntryEaten` alone, so there is no second path that
  // could quietly move a meal back to planned.
  const parsed = entryFields.omit({ intent: true }).partial().safeParse(input);
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

/**
 * The meal a patient types on the home page (stories 28 and 31): one planned
 * entry, dated today at the practice, with the patient as the author. The
 * suggestion of the next ticket reads this row.
 *
 * The limit of a day counts the patient's own entries of that day, archived
 * ones included. Two sends at the same instant can pass the count together:
 * the limit is a guard against a runaway client, not a quota to the unit.
 *
 * It does not call `touchPatient`: `lastEditedAt` orders the practitioner's
 * list by her own work on a file, and a patient's meal is not that work.
 */
const unscopedPlanPatientMeal = async (
  patientId: Id,
  description: unknown,
  at: Date = new Date(),
): Promise<Result<MealEntry>> => {
  if (!uuidSchema.safeParse(patientId).success) {
    return err("not_found", "no such patient");
  }
  const checked = checkPlannedMealText(description);
  if (!checked.ok) {
    return err(
      "invalid_input",
      checked.error === "empty"
        ? "a description is required"
        : "that description is too long",
    );
  }
  if (!(await getPatient(systemActor, patientId)).ok) {
    return err("not_found", "no such patient");
  }

  const eatenOn = todayAtPractice(at);
  const today = await entries().findMany(
    { patientId, eatenOn, writtenBy: "patient" },
    { limit: PLANNED_MEALS_PER_DAY },
  );
  if (today.items.length >= PLANNED_MEALS_PER_DAY) {
    return err("rate_limited", "the limit of meals for this day is reached");
  }

  const created = await entries().insert({
    patientId,
    eatenOn,
    slot: null,
    description: checked.text,
    patientComment: "",
    learning: "",
    intent: "planned",
    feedback: "",
    feedbackWrittenAt: null,
    archivedAt: null,
    writtenBy: "patient",
  });
  return ok(created);
};

/** A moment between two writes of a row, so that `updatedAt` moves. */
const nextMillisecond = () =>
  new Promise<void>((resolve) => {
    setTimeout(resolve, 2);
  });

/** How many times the claim writes the row to move its `updatedAt`. */
const CLAIM_WRITES_MAX = 4;

/**
 * Uses the one second suggestion of a meal that the patient typed (REM-103,
 * story 28: two suggestions for a meal, never three).
 *
 * No table holds a suggestion yet, and no column of this table is free for a
 * mark: the console and the patient's old link show each one. Thus the row's
 * `updatedAt` is the state. `version` is the `updatedAt` that the server signed
 * into the ticket at the first answer (`server/meals/retry-ticket.ts`). The
 * claim holds only while the row still has that value, and the claim writes the
 * row, which moves `updatedAt`. The same ticket is then refused, and no code
 * path signs a second ticket for a meal.
 *
 * It fails closed: each other write of the row (an edit or an archive in the
 * console) moves `updatedAt` too, and the second suggestion is then refused.
 *
 * The seam has no conditional update. Two requests that arrive in the same few
 * milliseconds can both read the old value. The debt is recorded with the
 * ticket: a `meal_suggestions` table with one row for each attempt closes it.
 */
const unscopedClaimMealRetry = async (
  patientId: Id,
  mealId: Id,
  version: number,
): Promise<Result<MealEntry>> => {
  if (!uuidSchema.safeParse(mealId).success) {
    return err("not_found", "no such meal entry");
  }
  return getDatabase().transaction(async (tx) => {
    const rows = tx.collection<MealEntry>("patient_meal_entries");
    const entry = await rows.findById(mealId);
    if (
      !entry ||
      entry.patientId !== patientId ||
      entry.writtenBy !== "patient" ||
      entry.archivedAt !== null
    ) {
      return err("not_found", "no such meal entry");
    }
    if (entry.updatedAt.getTime() !== version) {
      return err("conflict", "the second suggestion of this meal is used");
    }
    for (let write = 0; write < CLAIM_WRITES_MAX; write += 1) {
      const touched = await rows.update(mealId, {});
      if (!touched) {
        return err("not_found", "no such meal entry");
      }
      if (touched.updatedAt.getTime() !== version) {
        return ok(touched);
      }
      // The write fell in the millisecond of `version`: the claim is not held.
      await nextMillisecond();
    }
    return err("conflict", "the claim on this meal was not written");
  });
};

/**
 * « Je vais manger » becomes « J'ai mangé », on the row that already exists.
 *
 * One meal is one record: the patient wrote the plan, and the outcome is the
 * same meal further along rather than a second entry to reconcile against the
 * first. So nothing else moves — the description, the slot and any answer
 * already written against the plan are all still about this meal.
 *
 * It only ever goes one way. A meal that has happened cannot un-happen, and a
 * second press on a stale page is the ordinary case rather than an attack, so
 * it reads as "no such planned meal" instead of silently rewriting a row.
 */
const unscopedMarkMealEntryEaten = async (
  id: Id,
): Promise<Result<MealEntry>> => {
  if (!uuidSchema.safeParse(id).success) {
    return err("not_found", "no such meal entry");
  }
  const existing = await entries().findById(id);
  if (!existing || existing.intent !== "planned") {
    return err("not_found", "no such planned meal");
  }
  const updated = await entries().update(id, { intent: "eaten" });
  if (!updated) {
    return err("not_found", "no such meal entry");
  }
  await touchPatient(existing.patientId);
  return ok(updated);
};

/**
 * Whose entry is this? The ownership answer `writeThroughPatientLink` needs
 * before it lets a token touch a row it named by id.
 *
 * It lives here because the question is the journal's to answer, and a caller
 * that had to assemble it from `getMealEntry` could assemble it differently —
 * which is one patient reading another's record away from being wrong.
 */
export const mealEntryOwner = async (id: Id): Promise<Id | null> => {
  const entry = await unscopedGetMealEntry(id);
  return entry.ok ? entry.data.patientId : null;
};

const unscopedArchiveMealEntry = async (
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
const unscopedDeleteMealEntry = async (id: Id): Promise<Result<true>> => {
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

/**
 * The scoped surface (story 3, D-27). Each service takes the actor first, and
 * `db/services/access` checks it before the body runs. A refused call answers
 * as a missing file.
 */
export const listMealEntries = byPatient(
  "read",
  unscopedListMealEntries,
  () => [],
);
export const listArchivedMealEntries = byPatient(
  "read",
  unscopedListArchivedMealEntries,
  () => [],
);
export const countMealEntriesAwaitingFeedback = byPatient(
  "read",
  unscopedCountMealEntriesAwaitingFeedback,
  () => 0,
);
export const getMealEntry = byRecord(
  "mealEntry",
  "read",
  unscopedGetMealEntry,
  noSuchPatient,
);
export const addMealEntry = byPatient(
  "write",
  unscopedAddMealEntry,
  noSuchPatient,
);
export const planPatientMeal = byPatient(
  "write",
  unscopedPlanPatientMeal,
  noSuchPatient,
);
export const claimMealRetry = byPatient(
  "write",
  unscopedClaimMealRetry,
  noSuchPatient,
);
export const updateMealEntry = byRecord(
  "mealEntry",
  "write",
  unscopedUpdateMealEntry,
  noSuchPatient,
);
export const markMealEntryEaten = byRecord(
  "mealEntry",
  "write",
  unscopedMarkMealEntryEaten,
  noSuchPatient,
);
export const archiveMealEntry = byRecord(
  "mealEntry",
  "write",
  unscopedArchiveMealEntry,
  noSuchPatient,
);
export const deleteMealEntry = byRecord(
  "mealEntry",
  "write",
  unscopedDeleteMealEntry,
  noSuchPatient,
);
