import { z } from "zod";
import { goalDirections } from "../../../shared/patient";
import { err, ok, type Result } from "../../../shared/result";
import type { Id } from "../../../types";
import { getDatabase } from "../../client";
import type { PatientGoal } from "../../models/patient-goal";
import type { PatientGoalCheckIn } from "../../models/patient-goal-check-in";
import { touchPatient } from "../patients";

/**
 * The two or three priority goals Morgane steers an accompaniment by, and the
 * dated check-ins that make each one's evolution legible — brainstorm § D.
 *
 * Two rules live here rather than in the schema, and both are deliberate. The
 * active cap is a count of rows, which a constraint cannot express without a
 * trigger, and § D's "2-3 maximum" is a rule about the accompaniment that
 * Morgane may still want relaxed — a branch here, not a migration. And a
 * check-in must carry something: § D offers a direction *or* a measure, so
 * either will do, but a dated row saying neither records nothing.
 */

/** § D's "2-3 maximum", enforced at the top of the range. */
export const MAX_ACTIVE_GOALS = 3;

const goals = () => getDatabase().collection<PatientGoal>("patient_goals");

const checkIns = () =>
  getDatabase().collection<PatientGoalCheckIn>("patient_goal_check_ins");

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
export const listPatientGoals = async (
  patientId: Id,
): Promise<readonly PatientGoal[]> =>
  (await allForPatient(patientId)).filter((goal) => goal.archivedAt === null);

/** What has been worked on and set down, newest archive first. */
export const listArchivedPatientGoals = async (
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

export const addPatientGoal = async (
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
  const active = await listPatientGoals(patientId);
  if (active.length >= MAX_ACTIVE_GOALS) {
    return err(
      "conflict",
      `at most ${MAX_ACTIVE_GOALS} active goals — archive one first`,
    );
  }
  const created = await goals().insert({
    patientId,
    title: parsed.data.title,
    baseline: parsed.data.baseline ?? "",
    position: await nextPosition(patientId),
    archivedAt: null,
  });
  await touchPatient(patientId);
  return ok(created);
};

export const updatePatientGoal = async (
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
export const movePatientGoal = async (
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
  const run = await listPatientGoals(existing.patientId);
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
 * Archiving is the everyday exit; restoring is the undo. A restore has to pass
 * the same cap an add does, or the refusal would be trivially routed around.
 */
export const archivePatientGoal = async (
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
    const active = await listPatientGoals(existing.patientId);
    if (active.length >= MAX_ACTIVE_GOALS) {
      return err(
        "conflict",
        `at most ${MAX_ACTIVE_GOALS} active goals — archive one first`,
      );
    }
  }
  const updated = await goals().update(id, {
    archivedAt: archived ? new Date() : null,
  });
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
export const deletePatientGoal = async (id: Id): Promise<Result<true>> => {
  if (!uuidSchema.safeParse(id).success) {
    return err("not_found", "no such goal");
  }
  const existing = await goals().findById(id);
  for (const checkIn of await listGoalCheckIns(id)) {
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
export const listGoalCheckIns = async (
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

export const addGoalCheckIn = async (
  goalId: Id,
  input: GoalCheckInInput,
): Promise<Result<PatientGoalCheckIn>> => {
  if (!uuidSchema.safeParse(goalId).success) {
    return err("not_found", "no such goal");
  }
  const goal = await goals().findById(goalId);
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
  const created = await checkIns().insert({ goalId, ...entry });
  await touchPatient(goal.patientId);
  return ok(created);
};

export const updateGoalCheckIn = async (
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

export const deleteGoalCheckIn = async (id: Id): Promise<Result<true>> => {
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
