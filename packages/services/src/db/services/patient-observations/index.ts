import { z } from "zod";
import { err, ok, type Result } from "../../../shared/result";
import type { Id } from "../../../types";
import { getDatabase } from "../../client";
import type {
  PatientLearning,
  PatientObservation,
} from "../../models/patient-observation";
import { listMealEntries } from "../meal-entries";
import { getPatient, touchPatient } from "../patients";

/**
 * Standalone observations, and the merged learnings view they belong to.
 *
 * The merge lives here rather than beside the meal entries because it is the
 * observations that need the join: a meal journal is complete without knowing
 * about observations, while a learnings view that showed only one source would
 * be answering half the question. The dependency runs one way, and stays that
 * way.
 */

const observations = () =>
  getDatabase().collection<PatientObservation>("patient_observations");

const uuidSchema = z.uuid();

const isoDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "a date is required")
  .refine(
    (value) => !Number.isNaN(new Date(`${value}T00:00:00Z`).getTime()),
    "that date is not valid",
  );

const observationFields = z.object({
  body: z
    .string()
    .trim()
    .min(1, "an observation is required")
    .max(1000, "that observation is too long"),
  observedOn: isoDate,
});

export type PatientObservationInput = Partial<
  z.infer<typeof observationFields>
>;

/** Newest first, with write order breaking a shared day. */
const byObservedDate = (a: PatientObservation, b: PatientObservation) => {
  if (a.observedOn !== b.observedOn) {
    return b.observedOn.localeCompare(a.observedOn);
  }
  return b.createdAt.getTime() - a.createdAt.getTime();
};

const allForPatient = async (
  patientId: Id,
): Promise<readonly PatientObservation[]> => {
  if (!uuidSchema.safeParse(patientId).success) {
    return [];
  }
  const page = await observations().findMany({ patientId }, { limit: 500 });
  return [...page.items].sort(byObservedDate);
};

export const listPatientObservations = async (
  patientId: Id,
): Promise<readonly PatientObservation[]> =>
  (await allForPatient(patientId)).filter(
    (observation) => observation.archivedAt === null,
  );

export const listArchivedPatientObservations = async (
  patientId: Id,
): Promise<readonly PatientObservation[]> =>
  (await allForPatient(patientId))
    .filter((observation) => observation.archivedAt !== null)
    .sort(
      (a, b) => (b.archivedAt?.getTime() ?? 0) - (a.archivedAt?.getTime() ?? 0),
    );

/**
 * The per-patient learnings view: both write paths, one reverse-chronological
 * list.
 *
 * This is the epic's half of PROGRESS. Goal check-ins live in the
 * `patient-record` epic and are deliberately not merged in here — consolidating
 * the two into a single feed is the AI round's question, not this run's.
 *
 * Only entries that actually carry a learning appear: the journal is the place
 * to read every meal, and a view padded with blanks is one nobody scrolls.
 */
export const listPatientLearnings = async (
  patientId: Id,
): Promise<readonly PatientLearning[]> => {
  const [entries, standalone] = await Promise.all([
    listMealEntries(patientId),
    listPatientObservations(patientId),
  ]);

  const fromMeals: PatientLearning[] = entries
    .filter((entry) => entry.learning !== "")
    .map((entry) => ({
      kind: "meal",
      id: entry.id,
      body: entry.learning,
      on: entry.eatenOn,
      entry,
    }));

  const fromObservations: PatientLearning[] = standalone.map((observation) => ({
    kind: "observation",
    id: observation.id,
    body: observation.body,
    on: observation.observedOn,
    observation,
  }));

  return [...fromMeals, ...fromObservations].sort((a, b) =>
    b.on.localeCompare(a.on),
  );
};

export const addPatientObservation = async (
  patientId: Id,
  input: PatientObservationInput,
): Promise<Result<PatientObservation>> => {
  if (!uuidSchema.safeParse(patientId).success) {
    return err("not_found", "no such patient");
  }
  const parsed = observationFields.safeParse(input);
  if (!parsed.success) {
    return err("invalid_input", parsed.error.issues[0].message);
  }
  if (!(await getPatient(patientId)).ok) {
    return err("not_found", "no such patient");
  }
  const created = await observations().insert({
    patientId,
    body: parsed.data.body,
    observedOn: parsed.data.observedOn,
    archivedAt: null,
  });
  await touchPatient(patientId);
  return ok(created);
};

export const updatePatientObservation = async (
  id: Id,
  input: PatientObservationInput,
): Promise<Result<PatientObservation>> => {
  if (!uuidSchema.safeParse(id).success) {
    return err("not_found", "no such observation");
  }
  const parsed = observationFields.partial().safeParse(input);
  if (!parsed.success) {
    return err("invalid_input", parsed.error.issues[0].message);
  }
  const updated = await observations().update(id, { ...parsed.data });
  if (!updated) {
    return err("not_found", "no such observation");
  }
  await touchPatient(updated.patientId);
  return ok(updated);
};

export const archivePatientObservation = async (
  id: Id,
  archived: boolean,
): Promise<Result<PatientObservation>> => {
  if (!uuidSchema.safeParse(id).success) {
    return err("not_found", "no such observation");
  }
  const updated = await observations().update(id, {
    archivedAt: archived ? new Date() : null,
  });
  if (!updated) {
    return err("not_found", "no such observation");
  }
  await touchPatient(updated.patientId);
  return ok(updated);
};

/** The permanent one, for the row that should never have been written. */
export const deletePatientObservation = async (
  id: Id,
): Promise<Result<true>> => {
  if (!uuidSchema.safeParse(id).success) {
    return err("not_found", "no such observation");
  }
  const existing = await observations().findById(id);
  const removed = await observations().remove(id);
  if (!removed) {
    return err("not_found", "no such observation");
  }
  if (existing) {
    await touchPatient(existing.patientId);
  }
  return ok(true);
};
