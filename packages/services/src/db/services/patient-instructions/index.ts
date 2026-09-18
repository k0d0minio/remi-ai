import { z } from "zod";
import { err, ok, type Result } from "../../../shared/result";
import type { Id } from "../../../types";
import { getDatabase, type DatabaseClient } from "../../client";
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
 * Today nothing reads `body` but the console. In the AI round it becomes the
 * generation prompt's practitioner line: a new reader, not a new table.
 * `patientBody` is the half written to the patient, and the link's home is its
 * only reader.
 */

/** On the pooled client, or on a transaction when one is handed in. */
const instructions = (db: DatabaseClient = getDatabase()) =>
  db.collection<PatientInstruction>("patient_instructions");

const uuidSchema = z.uuid();

const bodySchema = z.string().trim().max(2000);

/**
 * What she wrote this time, for each of the row's two audiences. An object
 * rather than two positional strings: the halves are easy to swap by accident,
 * and swapping them puts a line addressed to REMI in front of the patient.
 */
export type InstructionBodies = {
  /** § E's line, written to REMI. The patient never sees it. */
  body: string;
  /** The same consigne written to the patient. The link's home renders it. */
  patientBody: string;
};

/** Empty and whitespace-only mean the same thing: she has not written one. */
const orNull = (value: string): string | null => (value === "" ? null : value);

const allForPatient = async (
  patientId: Id,
  db?: DatabaseClient,
): Promise<readonly PatientInstruction[]> => {
  if (!uuidSchema.safeParse(patientId).success) {
    return [];
  }
  const page = await instructions(db).findMany({ patientId }, { limit: 200 });
  return page.items;
};

/** The consigne in force, or `null` when she has not written one. */
export const getPatientInstruction = async (
  patientId: Id,
  db?: DatabaseClient,
): Promise<PatientInstruction | null> => {
  const active = (await allForPatient(patientId, db)).filter(
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
 * Both halves clearing archives what is there and inserts nothing — "no
 * standing instruction" is a real state, and emptying the fields is how she
 * says so. Either half alone is a real state too: a week she steers by without
 * telling the patient anything, or a consigne to the patient she needs no note
 * to herself about. The result is the new instruction, or `null` when she
 * cleared both.
 */
export const setPatientInstruction = async (
  patientId: Id,
  bodies: InstructionBodies,
  db?: DatabaseClient,
): Promise<Result<PatientInstruction | null>> => {
  if (!uuidSchema.safeParse(patientId).success) {
    return err("not_found", "no such patient");
  }
  const parsed = bodySchema.safeParse(bodies.body);
  if (!parsed.success) {
    return err("invalid_input", parsed.error.issues[0].message);
  }
  const parsedPatient = bodySchema.safeParse(bodies.patientBody);
  if (!parsedPatient.success) {
    return err("invalid_input", parsedPatient.error.issues[0].message);
  }

  const body = parsed.data;
  const patientBody = orNull(parsedPatient.data);
  const current = await getPatientInstruction(patientId, db);

  // Saving the same words is not a replacement. Without this, re-saving an
  // untouched form would archive the row, insert an identical one, and reset
  // "en vigueur depuis" to today — turning a no-op into history. Both halves
  // have to match: editing one of them is a replacement.
  if (current?.body === body && current?.patientBody === patientBody) {
    return ok(current);
  }

  if (current) {
    await instructions(db).update(current.id, { archivedAt: new Date() });
  }

  if (body === "" && patientBody === null) {
    if (current) {
      await touchPatient(patientId, db);
    }
    return ok(null);
  }

  const created = await instructions(db).insert({
    patientId,
    body,
    patientBody,
    archivedAt: null,
  });
  await touchPatient(patientId, db);
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
