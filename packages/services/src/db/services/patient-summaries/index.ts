import { z } from "zod";
import { err, ok, type Result } from "../../../shared/result";
import type { Id } from "../../../types";
import { getDatabase, type DatabaseClient } from "../../client";
import type { PatientSummary } from "../../models/patient-summary";
import { touchPatient } from "../patients";

/**
 * The living summary — brainstorm § C's PATIENT_SUMMARY.
 *
 * One row per patient, revised in place: § C's synthesis is the current state
 * of the file, not a log of its versions, so `setPatientSummary` upserts rather
 * than archiving (owner decision #7 — the consultation notes carry history).
 * The one-per-patient rule is the `patient_id` unique constraint in the schema;
 * this service keeps that promise by finding the existing row before writing.
 *
 * Writing it *for* the patient is the point: it is patient-visible by design
 * (§ J). Nothing renders it at the link this round, though — that is the
 * `patient-surface` epic's — so the read path here is the console's alone.
 */

/** On the pooled client, or on a transaction when one is handed in. */
const summaries = (db: DatabaseClient = getDatabase()) =>
  db.collection<PatientSummary>("patient_summaries");

const uuidSchema = z.uuid();

const bodySchema = z.string().trim().max(8000);

const rowFor = async (
  patientId: Id,
  db?: DatabaseClient,
): Promise<PatientSummary | null> => {
  if (!uuidSchema.safeParse(patientId).success) {
    return null;
  }
  const page = await summaries(db).findMany({ patientId }, { limit: 1 });
  return page.items[0] ?? null;
};

/** The patient's living summary, or `null` when she has not written one. */
export const getPatientSummary = async (
  patientId: Id,
  db?: DatabaseClient,
): Promise<PatientSummary | null> => rowFor(patientId, db);

/**
 * Upsert the one summary: insert when none exists, update the body in place
 * when one does — revising at each consultation overwrites the living value
 * rather than accumulating rows.
 *
 * A whitespace-only body deletes the row and returns `null` — "no summary yet"
 * is a real state, and a blank row would make that `null` a lie. Saving the
 * same words is a no-op, so re-saving an untouched textarea does not bump
 * `updatedAt` and read as freshly revised.
 */
export const setPatientSummary = async (
  patientId: Id,
  body: string,
  db?: DatabaseClient,
): Promise<Result<PatientSummary | null>> => {
  if (!uuidSchema.safeParse(patientId).success) {
    return err("not_found", "no such patient");
  }
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return err("invalid_input", parsed.error.issues[0].message);
  }

  const current = await rowFor(patientId, db);

  if (parsed.data === "") {
    if (current) {
      await summaries(db).remove(current.id);
      await touchPatient(patientId, db);
    }
    return ok(null);
  }

  if (current) {
    if (current.body === parsed.data) {
      return ok(current);
    }
    const updated = await summaries(db).update(current.id, {
      body: parsed.data,
    });
    await touchPatient(patientId, db);
    return ok(updated);
  }

  const created = await summaries(db).insert({ patientId, body: parsed.data });
  await touchPatient(patientId, db);
  return ok(created);
};
