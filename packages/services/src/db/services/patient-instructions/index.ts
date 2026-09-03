import { z } from "zod";
import { err, ok, type Result } from "../../../shared/result";
import type { Id } from "../../../types";
import { getDatabase } from "../../client";
import type { PatientInstruction } from "../../models/patient-instruction";
import { touchPatient } from "../patients";

/**
 * The standing consigne Morgane steers a patient by — brainstorm § E.
 *
 * Replacing it archives rather than overwrites: "what was I steering by in
 * October" is a question the record should answer, and § E's wording is the
 * kind of thing she will rewrite between consultations. One row is in force at
 * a time, and that rule lives here rather than in a partial unique index —
 * whether she wants several concurrent consignes is § E's open question, and
 * this table already holds them if the answer changes.
 *
 * Today nothing reads it but the console. In the AI round it becomes the
 * generation prompt's practitioner line: a new reader, not a new table.
 */

const instructions = () =>
  getDatabase().collection<PatientInstruction>("patient_instructions");

const uuidSchema = z.uuid();

const bodySchema = z.string().trim().max(2000);

const allForPatient = async (
  patientId: Id,
): Promise<readonly PatientInstruction[]> => {
  if (!uuidSchema.safeParse(patientId).success) {
    return [];
  }
  const page = await instructions().findMany({ patientId }, { limit: 200 });
  return page.items;
};

/** The consigne in force, or `null` when she has not written one. */
export const getPatientInstruction = async (
  patientId: Id,
): Promise<PatientInstruction | null> => {
  const active = (await allForPatient(patientId)).filter(
    (instruction) => instruction.archivedAt === null,
  );
  if (active.length === 0) {
    return null;
  }
  // Newest wins if a concurrent write ever produced two — the record still
  // shows both, and the newer one is the one she meant.
  return [...active].sort(
    (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
  )[0];
};

/** What she used to steer by, newest replacement first. */
export const listArchivedPatientInstructions = async (
  patientId: Id,
): Promise<readonly PatientInstruction[]> =>
  (await allForPatient(patientId))
    .filter((instruction) => instruction.archivedAt !== null)
    .sort(
      (a, b) => (b.archivedAt?.getTime() ?? 0) - (a.archivedAt?.getTime() ?? 0),
    );

/**
 * Replace-and-archive, in that order: the current row is archived before the
 * new one is inserted, so a patient is never left with two in force.
 *
 * An empty body archives what is there and inserts nothing — "no standing
 * instruction" is a real state, and clearing the field is how she says so.
 * The result is the new instruction, or `null` when she cleared it.
 */
export const setPatientInstruction = async (
  patientId: Id,
  body: string,
): Promise<Result<PatientInstruction | null>> => {
  if (!uuidSchema.safeParse(patientId).success) {
    return err("not_found", "no such patient");
  }
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return err("invalid_input", parsed.error.issues[0].message);
  }

  const current = await getPatientInstruction(patientId);
  if (current) {
    await instructions().update(current.id, { archivedAt: new Date() });
  }

  if (parsed.data === "") {
    await touchPatient(patientId);
    return ok(null);
  }

  const created = await instructions().insert({
    patientId,
    body: parsed.data,
    archivedAt: null,
  });
  await touchPatient(patientId);
  return ok(created);
};

/**
 * The permanent one. Archiving is what replacing does; this exists for a row
 * that should never have been written.
 */
export const deletePatientInstruction = async (
  id: Id,
): Promise<Result<true>> => {
  if (!uuidSchema.safeParse(id).success) {
    return err("not_found", "no such instruction");
  }
  const existing = await instructions().findById(id);
  const removed = await instructions().remove(id);
  if (!removed) {
    return err("not_found", "no such instruction");
  }
  if (existing) {
    await touchPatient(existing.patientId);
  }
  return ok(true);
};
