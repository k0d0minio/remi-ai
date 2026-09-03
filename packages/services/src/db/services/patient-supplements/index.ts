import { z } from "zod";
import { err, ok, type Result } from "../../../shared/result";
import type { Id } from "../../../types";
import { getDatabase } from "../../client";
import type { PatientSupplement } from "../../models/patient-supplement";
import { touchPatient } from "../patients";

/**
 * The prescribed supplement protocol — brainstorm § G. What Morgane prescribes,
 * as structured rows: name, dose, timing, reason. One flat ordered list per
 * patient, not category-grouped like the recommendations, so `position` is the
 * only ordering and there is no category to append within.
 *
 * `archivedAt` splits the protocol in force from the protocol that was. Nothing
 * here deletes by default — a supplement that stopped is the answer to "why did
 * we stop it".
 */

const supplements = () =>
  getDatabase().collection<PatientSupplement>("patient_supplements");

const uuidSchema = z.uuid();

const supplementFields = z.object({
  name: z.string().trim().min(1, "a name is required").max(200),
  dose: z.string().trim().max(200),
  timing: z.string().trim().max(200),
  reason: z.string().trim().max(10_000),
});

export type SupplementInput = Partial<z.infer<typeof supplementFields>>;

/** `position` is the order Morgane chose; creation time is the tiebreak. */
const byPosition = (a: PatientSupplement, b: PatientSupplement) => {
  if (a.position !== b.position) {
    return a.position - b.position;
  }
  return a.createdAt.getTime() - b.createdAt.getTime();
};

const allForPatient = async (
  patientId: Id,
): Promise<readonly PatientSupplement[]> => {
  if (!uuidSchema.safeParse(patientId).success) {
    return [];
  }
  const page = await supplements().findMany({ patientId }, { limit: 200 });
  return [...page.items].sort(byPosition);
};

/** The protocol in force. */
export const listPatientSupplements = async (
  patientId: Id,
): Promise<readonly PatientSupplement[]> =>
  (await allForPatient(patientId)).filter(
    (supplement) => supplement.archivedAt === null,
  );

/** What was in force and no longer is, newest archive first. */
export const listArchivedPatientSupplements = async (
  patientId: Id,
): Promise<readonly PatientSupplement[]> =>
  (await allForPatient(patientId))
    .filter((supplement) => supplement.archivedAt !== null)
    .sort(
      (a, b) => (b.archivedAt?.getTime() ?? 0) - (a.archivedAt?.getTime() ?? 0),
    );

/** Appends to the end of the protocol, leaving the existing run untouched. */
const nextPosition = async (patientId: Id) => {
  const siblings = await allForPatient(patientId);
  return siblings.reduce(
    (highest, supplement) => Math.max(highest, supplement.position + 1),
    0,
  );
};

export const addPatientSupplement = async (
  patientId: Id,
  input: SupplementInput,
): Promise<Result<PatientSupplement>> => {
  if (!uuidSchema.safeParse(patientId).success) {
    return err("not_found", "no such patient");
  }
  const parsed = supplementFields
    .partial({ dose: true, timing: true, reason: true })
    .safeParse(input);
  if (!parsed.success) {
    return err("invalid_input", parsed.error.issues[0].message);
  }
  const created = await supplements().insert({
    patientId,
    name: parsed.data.name,
    dose: parsed.data.dose ?? "",
    timing: parsed.data.timing ?? "",
    reason: parsed.data.reason ?? "",
    position: await nextPosition(patientId),
    archivedAt: null,
  });
  await touchPatient(patientId);
  return ok(created);
};

export const updatePatientSupplement = async (
  id: Id,
  input: SupplementInput,
): Promise<Result<PatientSupplement>> => {
  if (!uuidSchema.safeParse(id).success) {
    return err("not_found", "no such supplement");
  }
  const parsed = supplementFields.partial().safeParse(input);
  if (!parsed.success) {
    return err("invalid_input", parsed.error.issues[0].message);
  }
  const existing = await supplements().findById(id);
  if (!existing) {
    return err("not_found", "no such supplement");
  }
  const updated = await supplements().update(id, { ...parsed.data });
  if (!updated) {
    return err("not_found", "no such supplement");
  }
  await touchPatient(existing.patientId);
  return ok(updated);
};

/**
 * Moves an entry one slot up or down in the protocol.
 *
 * The move is done in an array and the whole run is renumbered 0…n-1, rather
 * than swapping the two stored ranks — the same reasoning as the
 * recommendations: rows created before this column existed all carry position
 * 0, so swapping stored values would swap two zeroes, and a renumber leaves the
 * run canonical as a side effect of the first reorder.
 */
export const movePatientSupplement = async (
  id: Id,
  direction: "up" | "down",
): Promise<Result<PatientSupplement>> => {
  if (!uuidSchema.safeParse(id).success) {
    return err("not_found", "no such supplement");
  }
  const existing = await supplements().findById(id);
  if (!existing) {
    return err("not_found", "no such supplement");
  }
  const run = await listPatientSupplements(existing.patientId);
  const index = run.findIndex((supplement) => supplement.id === id);
  const target = direction === "up" ? index - 1 : index + 1;
  if (index === -1 || target < 0 || target >= run.length) {
    // Already at the end of the run: not an error, just nothing to do.
    return ok(existing);
  }

  const reordered = [...run];
  reordered[index] = run[target];
  reordered[target] = run[index];

  for (const [position, supplement] of reordered.entries()) {
    if (supplement.position !== position) {
      await supplements().update(supplement.id, { position });
    }
  }
  await touchPatient(existing.patientId);

  const moved = await supplements().findById(id);
  return moved ? ok(moved) : err("not_found", "no such supplement");
};

export const archivePatientSupplement = async (
  id: Id,
  archived: boolean,
): Promise<Result<PatientSupplement>> => {
  if (!uuidSchema.safeParse(id).success) {
    return err("not_found", "no such supplement");
  }
  const updated = await supplements().update(id, {
    archivedAt: archived ? new Date() : null,
  });
  if (!updated) {
    return err("not_found", "no such supplement");
  }
  await touchPatient(updated.patientId);
  return ok(updated);
};

/**
 * The permanent one. Archiving is the everyday move; this exists for a row that
 * should never have been written — a wrong patient, a test entry.
 */
export const deletePatientSupplement = async (
  id: Id,
): Promise<Result<true>> => {
  if (!uuidSchema.safeParse(id).success) {
    return err("not_found", "no such supplement");
  }
  const existing = await supplements().findById(id);
  const removed = await supplements().remove(id);
  if (!removed) {
    return err("not_found", "no such supplement");
  }
  if (existing) {
    await touchPatient(existing.patientId);
  }
  return ok(true);
};
