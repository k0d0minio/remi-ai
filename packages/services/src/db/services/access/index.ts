import { z } from "zod";
import { err, ok, type Result } from "../../../shared/result";
import type { Id } from "../../../types";
import { getDatabase, type DatabaseClient } from "../../client";
import type { AccessMode, Actor } from "../../models/actor";
import type { Operator } from "../../models/operator";
import type { PatientProfile } from "../../models/patient-profile";

/**
 * The care-relationship scope of every patient service (story 3, D-27).
 *
 * A service of patient data takes an `Actor` first, and `byPatient` or
 * `byRecord` checks it before the service body runs. A refused call answers
 * as if the file did not exist: « forbidden » would confirm that the id
 * exists. The check reads the file row directly, never through the patients
 * service, so this module imports no other service.
 */

/** REMI itself, or a service that already checked its own caller. */
export const systemActor: Actor = { kind: "system" };

/** A patient session or a patient link: the patient's own file only. */
export const patientActor = (patientId: Id): Actor => ({
  kind: "patient",
  patientId,
});

/**
 * A console account. `openedPatientIds` are the files of other practitioners
 * that this admin opened with a reason. The app reads them from its signed
 * cookies. A practitioner's list is always empty.
 */
export const operatorActor = (
  operator: Pick<Operator, "id" | "role">,
  openedPatientIds: readonly Id[] = [],
): Actor => ({
  kind: "operator",
  id: operator.id,
  role: operator.role,
  openedPatientIds: operator.role === "admin" ? openedPatientIds : [],
});

/** The answer of every refused call that returns a `Result`. */
export const noSuchPatient = () => err("not_found", "no such patient");

const uuidSchema = z.uuid();

const isValidId = (id: Id) => uuidSchema.safeParse(id).success;

type FileKey = Pick<PatientProfile, "id" | "practitionerId">;

/** The decision, from the actor and the file alone. */
export const allows = (
  actor: Actor,
  file: FileKey,
  mode: AccessMode,
): boolean => {
  switch (actor.kind) {
    case "system":
      return true;
    case "patient":
      return file.id === actor.patientId;
    case "operator":
      if (file.practitionerId === actor.id) {
        return true;
      }
      return (
        mode === "read" &&
        actor.role === "admin" &&
        actor.openedPatientIds.includes(file.id)
      );
  }
};

const fileOf = async (
  patientId: Id,
  db: DatabaseClient = getDatabase(),
): Promise<PatientProfile | null> =>
  isValidId(patientId)
    ? db.collection<PatientProfile>("patient_profiles").findById(patientId)
    : null;

/**
 * Whether the actor may read or write this file. The system actor needs no
 * read: it reaches every file, so its calls behave as before the scope.
 */
export const mayAccessPatient = async (
  actor: Actor,
  patientId: Id,
  mode: AccessMode,
  db?: DatabaseClient,
): Promise<boolean> => {
  if (actor.kind === "system") {
    return true;
  }
  const file = await fileOf(patientId, db);
  return file !== null && allows(actor, file, mode);
};

/**
 * The tables whose rows sit in one patient file, each by its `patientId`. A
 * service that names a row, not a file, finds the file through this map.
 */
const patientRecordCollections = {
  recommendation: "patient_recommendations",
  supplement: "patient_supplements",
  pantryEssential: "patient_pantry_essentials",
  mealEntry: "patient_meal_entries",
  observation: "patient_observations",
  goal: "patient_goals",
  challenge: "patient_challenges",
  message: "patient_messages",
  recipeAssignment: "patient_recipe_assignments",
  note: "patient_notes",
  document: "patient_documents",
  instruction: "patient_instructions",
} as const;

/** A check-in hangs from a goal, not from the file: one step more. */
export type PatientRecordKind =
  keyof typeof patientRecordCollections | "goalCheckIn";

type FileRow = { id: Id; patientId: Id };

/** The file a row sits in, or null for a missing row or a malformed id. */
export const patientIdOfRecord = async (
  kind: PatientRecordKind,
  id: Id,
): Promise<Id | null> => {
  if (!isValidId(id)) {
    return null;
  }
  const db = getDatabase();
  if (kind === "goalCheckIn") {
    const checkIn = await db
      .collection<{ id: Id; goalId: Id }>("patient_goal_check_ins")
      .findById(id);
    return checkIn ? patientIdOfRecord("goal", checkIn.goalId) : null;
  }
  const row = await db
    .collection<FileRow>(patientRecordCollections[kind])
    .findById(id);
  return row?.patientId ?? null;
};

/** Whether the actor may read or write the file this row sits in. */
export const mayAccessRecord = async (
  actor: Actor,
  kind: PatientRecordKind,
  id: Id,
  mode: AccessMode,
): Promise<boolean> => {
  if (actor.kind === "system") {
    return true;
  }
  const patientId = await patientIdOfRecord(kind, id);
  if (patientId === null) {
    return false;
  }
  return mayAccessPatient(actor, patientId, mode);
};

/**
 * Scopes a service whose first argument is the file's id. The result takes
 * the actor first, then the arguments of the service as they were. A refused
 * call returns `refused()` and runs nothing.
 */
export const byPatient =
  <A extends unknown[], R>(
    mode: AccessMode,
    service: (patientId: Id, ...rest: A) => Promise<R>,
    refused: () => NoInfer<R>,
  ) =>
  async (actor: Actor, patientId: Id, ...rest: A): Promise<R> =>
    (await mayAccessPatient(actor, patientId, mode))
      ? service(patientId, ...rest)
      : refused();

/** The same scope for a service whose first argument is the id of a row. */
export const byRecord =
  <A extends unknown[], R>(
    kind: PatientRecordKind,
    mode: AccessMode,
    service: (id: Id, ...rest: A) => Promise<R>,
    refused: () => NoInfer<R>,
  ) =>
  async (actor: Actor, id: Id, ...rest: A): Promise<R> =>
    (await mayAccessRecord(actor, kind, id, mode))
      ? service(id, ...rest)
      : refused();

/**
 * The files whose rows a list across files may show (the patient list's
 * signals): the files the operator holds, and every file for an admin, who may
 * list them all. A patient lists only its own file. `null` means every file.
 */
export const listablePatientIds = async (
  actor: Actor,
): Promise<ReadonlySet<Id> | null> => {
  if (actor.kind === "system") {
    return null;
  }
  if (actor.kind === "patient") {
    return new Set([actor.patientId]);
  }
  if (actor.role === "admin") {
    return null;
  }
  const page = await getDatabase()
    .collection<PatientProfile>("patient_profiles")
    .findMany({ practitionerId: actor.id }, { limit: 500 });
  return new Set(page.items.map((file) => file.id));
};

/**
 * The file an admin may open with a reason: any file, for an admin only. The
 * console asks for the reason before the file reads. A practitioner and a
 * patient get `not_found`.
 */
export const adminOpenablePatient = async (
  actor: Actor,
  patientId: Id,
): Promise<
  Result<Pick<PatientProfile, "id" | "pseudonym" | "practitionerId">>
> => {
  if (actor.kind !== "operator" || actor.role !== "admin") {
    return noSuchPatient();
  }
  const file = await fileOf(patientId);
  return file
    ? ok({
        id: file.id,
        pseudonym: file.pseudonym,
        practitionerId: file.practitionerId,
      })
    : noSuchPatient();
};
