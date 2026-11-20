import { z } from "zod";
import { todayAtPractice } from "../../../shared/format";
import {
  goalDirections,
  goalScores,
  scoreDirection,
  weeklyCheckInState,
  type WeeklyCheckInState,
} from "../../../shared/patient";
import { err, ok, type Result } from "../../../shared/result";
import type { Id } from "../../../types";
import { getDatabase, type DatabaseClient } from "../../client";
import type { PatientGoal } from "../../models/patient-goal";
import type { WrittenBy } from "../../models/meal-entry";
import type { PatientGoalCheckIn } from "../../models/patient-goal-check-in";
import { touchPatient } from "../patients";
import { moveToValidateAfterSave } from "../first-recommendation";
import { byPatient, byRecord, noSuchPatient } from "../access";

/**
 * The patient's goals, in the practitioner's order, and the dated check-ins
 * that make each one's evolution legible.
 *
 * A goal is one free text, and their number has no limit (story 16). The first
 * goal of the active list is the main goal; the others are secondary (D-30).
 * A disabled goal keeps its row: `archivedAt` is the date it was disabled.
 *
 * One rule lives here rather than in the schema. A check-in must carry
 * something: a direction, a measure or a note. A dated row that says none of
 * the three records nothing.
 */

const goals = (db: DatabaseClient = getDatabase()) =>
  db.collection<PatientGoal>("patient_goals");

/** On the pooled client, or on a transaction when one is handed in. */
const checkIns = (db: DatabaseClient = getDatabase()) =>
  db.collection<PatientGoalCheckIn>("patient_goal_check_ins");

const uuidSchema = z.uuid();

/** Same shape as the consultation date next door: a day, not an instant. */
const isoDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "a date is required")
  .refine(
    (value) => !Number.isNaN(new Date(`${value}T00:00:00Z`).getTime()),
    "that date is not valid",
  );

const goalFields = z.object({
  title: z.string().trim().min(1, "a goal is required").max(160),
  baseline: z.string().trim().max(160),
});

export type PatientGoalInput = Partial<z.infer<typeof goalFields>>;

const checkInFields = z.object({
  checkedOn: isoDate,
  direction: z.enum(goalDirections).nullable(),
  measure: z.string().trim().max(160),
  note: z.string().trim().max(2000),
});

export type GoalCheckInInput = Partial<
  Omit<z.infer<typeof checkInFields>, "direction">
> & {
  direction?: string | null;
};

/**
 * Zod's `.partial()` keeps a key that was handed to it as `undefined`, and
 * spreading that over the stored row clears the column. A patch carries only
 * what the caller actually supplied.
 */
const supplied = <T extends object>(value: T): Partial<T> =>
  Object.fromEntries(
    Object.entries(value).filter((entry) => entry[1] !== undefined),
  ) as Partial<T>;

/** Her order, with creation time as the tiebreak for rows that predate it. */
const byPosition = (a: PatientGoal, b: PatientGoal) => {
  if (a.position !== b.position) {
    return a.position - b.position;
  }
  return a.createdAt.getTime() - b.createdAt.getTime();
};

const allForPatient = async (
  patientId: Id,
): Promise<readonly PatientGoal[]> => {
  if (!uuidSchema.safeParse(patientId).success) {
    return [];
  }
  const page = await goals().findMany({ patientId }, { limit: 200 });
  return [...page.items].sort(byPosition);
};

/** The goals in force, in her priority order. */
const unscopedListPatientGoals = async (
  patientId: Id,
): Promise<readonly PatientGoal[]> =>
  (await allForPatient(patientId)).filter((goal) => goal.archivedAt === null);

/** What has been worked on and set down, newest archive first. */
const unscopedListArchivedPatientGoals = async (
  patientId: Id,
): Promise<readonly PatientGoal[]> =>
  (await allForPatient(patientId))
    .filter((goal) => goal.archivedAt !== null)
    .sort(
      (a, b) => (b.archivedAt?.getTime() ?? 0) - (a.archivedAt?.getTime() ?? 0),
    );

/** Appends to the end of the list, leaving the existing run untouched. */
const nextPosition = async (patientId: Id) => {
  const siblings = await allForPatient(patientId);
  return siblings.reduce(
    (highest, goal) => Math.max(highest, goal.position + 1),
    0,
  );
};

const unscopedAddPatientGoal = async (
  patientId: Id,
  input: PatientGoalInput,
): Promise<Result<PatientGoal>> => {
  if (!uuidSchema.safeParse(patientId).success) {
    return err("not_found", "no such patient");
  }
  const parsed = goalFields.partial({ baseline: true }).safeParse(input);
  if (!parsed.success) {
    return err("invalid_input", parsed.error.issues[0].message);
  }
  const created = await goals().insert({
    patientId,
    title: parsed.data.title,
    baseline: parsed.data.baseline ?? "",
    position: await nextPosition(patientId),
    archivedAt: null,
  });
  await touchPatient(patientId);
  await moveToValidateAfterSave(patientId);
  return ok(created);
};

const unscopedUpdatePatientGoal = async (
  id: Id,
  input: PatientGoalInput,
): Promise<Result<PatientGoal>> => {
  if (!uuidSchema.safeParse(id).success) {
    return err("not_found", "no such goal");
  }
  const parsed = goalFields.partial().safeParse(supplied(input));
  if (!parsed.success) {
    return err("invalid_input", parsed.error.issues[0].message);
  }
  const existing = await goals().findById(id);
  if (!existing) {
    return err("not_found", "no such goal");
  }
  const updated = await goals().update(id, { ...parsed.data });
  if (!updated) {
    return err("not_found", "no such goal");
  }
  await touchPatient(existing.patientId);
  return ok(updated);
};

/**
 * Moves a goal one slot up or down the active list.
 *
 * The move happens in an array and the whole run is renumbered 0…n-1 rather
 * than swapping the two stored ranks — the same reasoning as the pantry and
 * recommendation services: rows that predate a position all carry 0, so
 * swapping stored values would swap two zeroes.
 */
const unscopedMovePatientGoal = async (
  id: Id,
  direction: "up" | "down",
): Promise<Result<PatientGoal>> => {
  if (!uuidSchema.safeParse(id).success) {
    return err("not_found", "no such goal");
  }
  const existing = await goals().findById(id);
  if (!existing) {
    return err("not_found", "no such goal");
  }
  const run = await unscopedListPatientGoals(existing.patientId);
  const index = run.findIndex((goal) => goal.id === id);
  const target = direction === "up" ? index - 1 : index + 1;
  if (index === -1 || target < 0 || target >= run.length) {
    // Already at the end of the list: not an error, just nothing to do.
    return ok(existing);
  }

  const reordered = [...run];
  reordered[index] = run[target];
  reordered[target] = run[index];

  for (const [position, goal] of reordered.entries()) {
    if (goal.position !== position) {
      await goals().update(goal.id, { position });
    }
  }
  await touchPatient(existing.patientId);

  const moved = await goals().findById(id);
  return moved ? ok(moved) : err("not_found", "no such goal");
};

/**
 * Disabling is the everyday exit, and enabling again is the undo. The row
 * stays in both directions. A goal that comes back goes to the end of the
 * order: its old rank now belongs to another goal, and two goals on one rank
 * would leave the main goal to the creation date.
 */
const unscopedArchivePatientGoal = async (
  id: Id,
  archived: boolean,
): Promise<Result<PatientGoal>> => {
  if (!uuidSchema.safeParse(id).success) {
    return err("not_found", "no such goal");
  }
  const existing = await goals().findById(id);
  if (!existing) {
    return err("not_found", "no such goal");
  }
  if (!archived && existing.archivedAt !== null) {
    const restored = await goals().update(id, {
      archivedAt: null,
      position: await nextPosition(existing.patientId),
    });
    if (!restored) {
      return err("not_found", "no such goal");
    }
    await touchPatient(restored.patientId);
    return ok(restored);
  }
  if (!archived || existing.archivedAt !== null) {
    // Already in the state that was asked for: nothing to write, and the date
    // of a goal that is disabled stays the date it was first disabled.
    return ok(existing);
  }
  const updated = await goals().update(id, { archivedAt: new Date() });
  if (!updated) {
    return err("not_found", "no such goal");
  }
  await touchPatient(updated.patientId);
  return ok(updated);
};

/**
 * The permanent one, and it takes the trail with it. Postgres cascades the
 * check-ins through the foreign key; removing them here is what makes the
 * behaviour the same through any client satisfying the seam.
 */
const unscopedDeletePatientGoal = async (id: Id): Promise<Result<true>> => {
  if (!uuidSchema.safeParse(id).success) {
    return err("not_found", "no such goal");
  }
  const existing = await goals().findById(id);
  for (const checkIn of await unscopedListGoalCheckIns(id)) {
    await checkIns().remove(checkIn.id);
  }
  const removed = await goals().remove(id);
  if (!removed) {
    return err("not_found", "no such goal");
  }
  if (existing) {
    await touchPatient(existing.patientId);
  }
  return ok(true);
};

/** The goal's history, newest first — the date is the order, not the write. */
const unscopedListGoalCheckIns = async (
  goalId: Id,
): Promise<readonly PatientGoalCheckIn[]> => {
  if (!uuidSchema.safeParse(goalId).success) {
    return [];
  }
  const page = await checkIns().findMany({ goalId }, { limit: 200 });
  return [...page.items].sort((a, b) => {
    if (a.checkedOn !== b.checkedOn) {
      return a.checkedOn < b.checkedOn ? 1 : -1;
    }
    return b.createdAt.getTime() - a.createdAt.getTime();
  });
};

/** A direction, a measure or a note — one of the three is what makes it a record. */
const saysSomething = (entry: {
  direction: string | null;
  measure: string;
  note: string;
}) => entry.direction !== null || entry.measure !== "" || entry.note !== "";

const parseCheckIn = (input: GoalCheckInInput) =>
  checkInFields
    .partial({ measure: true, note: true, direction: true })
    .safeParse({
      ...input,
      direction: input.direction === "" ? null : (input.direction ?? null),
    });

/** `writtenBy` is set by the code path, never by the payload — see `addMealEntry`. */
const unscopedAddGoalCheckIn = async (
  goalId: Id,
  input: GoalCheckInInput,
  writtenBy: WrittenBy = "practitioner",
  db?: DatabaseClient,
): Promise<Result<PatientGoalCheckIn>> => {
  if (!uuidSchema.safeParse(goalId).success) {
    return err("not_found", "no such goal");
  }
  const goal = await goals(db).findById(goalId);
  if (!goal) {
    return err("not_found", "no such goal");
  }
  const parsed = parseCheckIn(input);
  if (!parsed.success) {
    return err("invalid_input", parsed.error.issues[0].message);
  }
  const entry = {
    checkedOn: parsed.data.checkedOn,
    direction: parsed.data.direction ?? null,
    measure: parsed.data.measure ?? "",
    note: parsed.data.note ?? "",
  };
  if (!saysSomething(entry)) {
    return err(
      "invalid_input",
      "a check-in needs a direction, a measure or a note",
    );
  }
  const created = await checkIns(db).insert({
    goalId,
    ...entry,
    writtenBy,
    score: null,
    seenAt: null,
  });
  await touchPatient(goal.patientId, db);
  return ok(created);
};

const unscopedUpdateGoalCheckIn = async (
  id: Id,
  input: GoalCheckInInput,
): Promise<Result<PatientGoalCheckIn>> => {
  if (!uuidSchema.safeParse(id).success) {
    return err("not_found", "no such check-in");
  }
  const existing = await checkIns().findById(id);
  if (!existing) {
    return err("not_found", "no such check-in");
  }
  const parsed = checkInFields.partial().safeParse(
    supplied({
      checkedOn: input.checkedOn,
      direction: input.direction === "" ? null : input.direction,
      measure: input.measure,
      note: input.note,
    }),
  );
  if (!parsed.success) {
    return err("invalid_input", parsed.error.issues[0].message);
  }
  const merged = { ...existing, ...parsed.data };
  if (!saysSomething(merged)) {
    return err(
      "invalid_input",
      "a check-in needs a direction, a measure or a note",
    );
  }
  const updated = await checkIns().update(id, { ...parsed.data });
  if (!updated) {
    return err("not_found", "no such check-in");
  }
  const goal = await goals().findById(existing.goalId);
  if (goal) {
    await touchPatient(goal.patientId);
  }
  return ok(updated);
};

const unscopedDeleteGoalCheckIn = async (id: Id): Promise<Result<true>> => {
  if (!uuidSchema.safeParse(id).success) {
    return err("not_found", "no such check-in");
  }
  const existing = await checkIns().findById(id);
  const removed = await checkIns().remove(id);
  if (!removed) {
    return err("not_found", "no such check-in");
  }
  if (existing) {
    const goal = await goals().findById(existing.goalId);
    if (goal) {
      await touchPatient(goal.patientId);
    }
  }
  return ok(true);
};

/**
 * The patient's weekly score, goal by goal — her 14 Sept § 1 through the link
 * (decisions D-30 to D-33).
 *
 * Only the patient writes these rows, and only through `writeThroughPatientLink`:
 * the caller hands in the patient the token resolved, never an id from the
 * payload, and every goal named here is checked against that patient before
 * anything is written.
 */

export type WeeklyAnswer = {
  goalId: string;
  /** `null`, or absent, leaves the goal unrated — it writes nothing. */
  score?: number | null;
  note?: string;
};

const weeklyAnswer = z.object({
  goalId: z.string(),
  score: z
    .number()
    .int()
    .refine(
      (value) => (goalScores as readonly number[]).includes(value),
      "a score runs from 0 to 5",
    )
    .nullable()
    .optional(),
  note: z.string().trim().max(2000).optional(),
});

type ParsedAnswer = z.infer<typeof weeklyAnswer>;

/** The patient's own rows on one goal, oldest first. */
const patientRowsOldestFirst = async (
  goalId: Id,
  db?: DatabaseClient,
): Promise<readonly PatientGoalCheckIn[]> => {
  const page = await checkIns(db).findMany(
    { goalId, writtenBy: "patient" },
    { limit: 500 },
  );
  return [...page.items].sort((a, b) => {
    if (a.checkedOn !== b.checkedOn) {
      return a.checkedOn < b.checkedOn ? -1 : 1;
    }
    return a.createdAt.getTime() - b.createdAt.getTime();
  });
};

/** The newest score the patient gave this goal, or `null` before the first. */
const previousScore = (rows: readonly PatientGoalCheckIn[]): number | null =>
  rows.reduce<number | null>((last, row) => row.score ?? last, null);

/**
 * The day of the patient's last own check-in across their active goals — the
 * one date the weekly question is computed from (D-9: no scheduler).
 */
const lastPatientCheckInOn = async (
  patientId: Id,
  db?: DatabaseClient,
): Promise<string | null> => {
  let last: string | null = null;
  for (const goal of await unscopedListPatientGoals(patientId)) {
    for (const row of await patientRowsOldestFirst(goal.id, db)) {
      if (last === null || row.checkedOn > last) {
        last = row.checkedOn;
      }
    }
  }
  return last;
};

/** Whether the patient's weekly question is open today, and since or until when. */
const unscopedGetWeeklyCheckIn = async (
  patientId: Id,
  today: string = todayAtPractice(),
): Promise<WeeklyCheckInState> =>
  weeklyCheckInState(await lastPatientCheckInOn(patientId), today);

/**
 * Writes one row per rated goal, or nothing at all.
 *
 * Every rule refuses before the first insert — the ownership of each goal, the
 * range of each score, that at least one goal is rated, and that the week's
 * question is open — so a refusal never leaves half an answer behind. A second
 * submission inside the week (a double tap, a second tab) finds the first one's
 * rows and is refused in the same way: it writes nothing.
 */
const unscopedRecordWeeklyCheckIn = async (
  patientId: Id,
  answers: readonly WeeklyAnswer[],
  today: string = todayAtPractice(),
): Promise<Result<readonly PatientGoalCheckIn[]>> => {
  const parsed = z.array(weeklyAnswer).max(20).safeParse(answers);
  if (!parsed.success) {
    return err("invalid_input", parsed.error.issues[0].message);
  }
  const active = new Map(
    (await unscopedListPatientGoals(patientId)).map((goal) => [goal.id, goal]),
  );
  if (parsed.data.some((answer) => !active.has(answer.goalId))) {
    return err("not_found", "no such goal");
  }
  const rated = parsed.data.filter(
    (answer): answer is ParsedAnswer & { score: number } =>
      answer.score !== null && answer.score !== undefined,
  );
  if (rated.length === 0) {
    return err("invalid_input", "rate at least one goal");
  }
  if (new Set(rated.map((answer) => answer.goalId)).size !== rated.length) {
    return err("invalid_input", "one score per goal");
  }

  return getDatabase().transaction(
    async (tx): Promise<Result<readonly PatientGoalCheckIn[]>> => {
      const state = weeklyCheckInState(
        await lastPatientCheckInOn(patientId, tx),
        today,
      );
      if (!state.due) {
        return err("conflict", "this week's question is already answered");
      }
      const created: PatientGoalCheckIn[] = [];
      for (const answer of rated) {
        const previous = previousScore(
          await patientRowsOldestFirst(answer.goalId, tx),
        );
        created.push(
          await checkIns(tx).insert({
            goalId: answer.goalId,
            checkedOn: today,
            direction: scoreDirection(previous, answer.score),
            measure: "",
            note: answer.note ?? "",
            writtenBy: "patient",
            score: answer.score,
            seenAt: null,
          }),
        );
      }
      return ok(created);
    },
  );
};

export type GoalScoreStrip = {
  goalId: Id;
  /** The patient's last scores on this goal, oldest first. */
  scores: readonly { id: Id; checkedOn: string; score: number }[];
};

/** How many weekly scores a strip shows — about a season (spec, pass 4). */
export const GOAL_SCORE_STRIP_LENGTH = 12;

/**
 * « Ma progression »'s strip for each active goal, in her order — the same
 * data on the link and in the console's at-a-glance slot (D-9).
 */
const unscopedListGoalScoreStrips = async (
  patientId: Id,
): Promise<readonly GoalScoreStrip[]> => {
  const strips: GoalScoreStrip[] = [];
  for (const goal of await unscopedListPatientGoals(patientId)) {
    const scored = (await patientRowsOldestFirst(goal.id)).flatMap((row) =>
      row.score === null || row.score === undefined
        ? []
        : [{ id: row.id, checkedOn: row.checkedOn, score: row.score }],
    );
    strips.push({
      goalId: goal.id,
      scores: scored.slice(-GOAL_SCORE_STRIP_LENGTH),
    });
  }
  return strips;
};

/** A patient's lower score she has not yet marked « vu » (D-33). */
const awaitsAttention = (row: PatientGoalCheckIn) =>
  row.writtenBy === "patient" &&
  row.direction === "worse" &&
  (row.seenAt ?? null) === null;

/** How many of the patient's lower scores wait for her, across active goals. */
const unscopedCountGoalCheckInsAwaitingAttention = async (
  patientId: Id,
): Promise<number> => {
  let count = 0;
  for (const goal of await unscopedListPatientGoals(patientId)) {
    count += (await patientRowsOldestFirst(goal.id)).filter(
      awaitsAttention,
    ).length;
  }
  return count;
};

/**
 * Her « vu » on a patient's lower score. Idempotent: a row already seen keeps
 * the first time she saw it, so the trail says when she first knew.
 */
const unscopedMarkGoalCheckInSeen = async (
  id: Id,
): Promise<Result<PatientGoalCheckIn>> => {
  if (!uuidSchema.safeParse(id).success) {
    return err("not_found", "no such check-in");
  }
  const existing = await checkIns().findById(id);
  if (!existing) {
    return err("not_found", "no such check-in");
  }
  if (existing.seenAt) {
    return ok(existing);
  }
  const updated = await checkIns().update(id, { seenAt: new Date() });
  if (!updated) {
    return err("not_found", "no such check-in");
  }
  const goal = await goals().findById(existing.goalId);
  if (goal) {
    await touchPatient(goal.patientId);
  }
  return ok(updated);
};

/**
 * The scoped surface (story 3, D-27). Each service takes the actor first, and
 * `db/services/access` checks it before the body runs. A refused call answers
 * as a missing file.
 */
export const listPatientGoals = byPatient(
  "read",
  unscopedListPatientGoals,
  () => [],
);
export const listArchivedPatientGoals = byPatient(
  "read",
  unscopedListArchivedPatientGoals,
  () => [],
);
export const addPatientGoal = byPatient(
  "write",
  unscopedAddPatientGoal,
  noSuchPatient,
);
export const updatePatientGoal = byRecord(
  "goal",
  "write",
  unscopedUpdatePatientGoal,
  noSuchPatient,
);
export const movePatientGoal = byRecord(
  "goal",
  "write",
  unscopedMovePatientGoal,
  noSuchPatient,
);
export const archivePatientGoal = byRecord(
  "goal",
  "write",
  unscopedArchivePatientGoal,
  noSuchPatient,
);
export const deletePatientGoal = byRecord(
  "goal",
  "write",
  unscopedDeletePatientGoal,
  noSuchPatient,
);
export const listGoalCheckIns = byRecord(
  "goal",
  "read",
  unscopedListGoalCheckIns,
  () => [],
);
export const addGoalCheckIn = byRecord(
  "goal",
  "write",
  unscopedAddGoalCheckIn,
  noSuchPatient,
);
export const updateGoalCheckIn = byRecord(
  "goalCheckIn",
  "write",
  unscopedUpdateGoalCheckIn,
  noSuchPatient,
);
export const deleteGoalCheckIn = byRecord(
  "goalCheckIn",
  "write",
  unscopedDeleteGoalCheckIn,
  noSuchPatient,
);
export const getWeeklyCheckIn = byPatient(
  "read",
  unscopedGetWeeklyCheckIn,
  () => weeklyCheckInState(null, todayAtPractice()),
);
export const recordWeeklyCheckIn = byPatient(
  "write",
  unscopedRecordWeeklyCheckIn,
  noSuchPatient,
);
export const listGoalScoreStrips = byPatient(
  "read",
  unscopedListGoalScoreStrips,
  () => [],
);
export const countGoalCheckInsAwaitingAttention = byPatient(
  "read",
  unscopedCountGoalCheckInsAwaitingAttention,
  () => 0,
);
export const markGoalCheckInSeen = byRecord(
  "goalCheckIn",
  "write",
  unscopedMarkGoalCheckInSeen,
  noSuchPatient,
);
