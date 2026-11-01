import { z } from "zod";
import { err, ok, type Result } from "../../../shared/result";
import type { Id } from "../../../types";
import { getDatabase, type DatabaseClient } from "../../client";
import type { PatientAccount } from "../../models/patient-account";
import { getPatient } from "../patients";

/**
 * The patient's account row — the link between a patient file and the auth
 * adapter's user. The schema holds the three unique constraints. This service
 * checks them first, so a duplicate comes back as a `conflict` the sign-up page
 * can render, not as a driver error.
 */

const accounts = (db: DatabaseClient = getDatabase()) =>
  db.collection<PatientAccount>("patient_accounts");

/** One spelling per address: the unique constraint compares exact text. */
const normaliseEmail = (email: string) => email.trim().toLowerCase();

const accountInput = z.object({
  patientProfileId: z.uuid(),
  email: z.string().trim().toLowerCase().pipe(z.email()),
  authSubject: z.string().trim().min(1),
});

export type PatientAccountInput = z.input<typeof accountInput>;

const findOne = async (
  filter: Partial<PatientAccount>,
  db?: DatabaseClient,
): Promise<PatientAccount | null> => {
  const page = await accounts(db).findMany(filter, { limit: 1 });
  return page.items[0] ?? null;
};

export const getPatientAccountBySubject = async (
  authSubject: string,
  db?: DatabaseClient,
): Promise<PatientAccount | null> => {
  const subject = authSubject.trim();
  if (!subject) {
    return null;
  }
  return findOne({ authSubject: subject }, db);
};

export const getPatientAccountByEmail = async (
  email: string,
  db?: DatabaseClient,
): Promise<PatientAccount | null> => {
  const address = normaliseEmail(email);
  if (!address) {
    return null;
  }
  return findOne({ email: address }, db);
};

export const createPatientAccount = async (
  input: PatientAccountInput,
): Promise<Result<PatientAccount>> => {
  const parsed = accountInput.safeParse(input);
  if (!parsed.success) {
    return err(
      "invalid_input",
      "a patient account needs a patient, an e-mail and an auth subject",
    );
  }
  const { patientProfileId, email, authSubject } = parsed.data;

  return getDatabase().transaction(async (db) => {
    const patient = await getPatient(patientProfileId, db);
    if (!patient.ok) {
      return err("not_found", "no such patient");
    }
    if (await findOne({ patientProfileId }, db)) {
      return err("conflict", "this patient already has an account");
    }
    if (await findOne({ email }, db)) {
      return err("conflict", "this e-mail already has an account");
    }
    if (await findOne({ authSubject }, db)) {
      return err("conflict", "this auth user already has an account");
    }
    const created = await accounts(db).insert({
      patientProfileId,
      email,
      authSubject,
      activatedAt: null,
    });
    return ok(created);
  });
};
