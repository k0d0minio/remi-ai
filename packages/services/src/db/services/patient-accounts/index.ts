import { z } from "zod";
import { err, ok, type Result } from "../../../shared/result";
import { getDatabase, type DatabaseClient } from "../../client";
import type { Page } from "../../../types";
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

/**
 * With `db`, the write joins a transaction the caller opened: the sign-up
 * writes the profile and the account as one unit. Without it, it opens its own.
 */
export const createPatientAccount = async (
  input: PatientAccountInput,
  db?: DatabaseClient,
): Promise<Result<PatientAccount>> => {
  const parsed = accountInput.safeParse(input);
  if (!parsed.success) {
    return err(
      "invalid_input",
      "a patient account needs a patient, an e-mail and an auth subject",
    );
  }
  const { patientProfileId, email, authSubject } = parsed.data;

  const write = async (db: DatabaseClient): Promise<Result<PatientAccount>> => {
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
      lastSeenAt: null,
      inactivityNoticeSentAt: null,
    });
    return ok(created);
  };
  return db ? write(db) : getDatabase().transaction(write);
};

/** How stale `lastSeenAt` must be before a live session writes it again. */
const SEEN_WRITE_INTERVAL_MS = 24 * 60 * 60 * 1000;

/**
 * Records that the patient is here: a sign-in, or a live session that opens
 * the app (`inactive-account-deletion`). The inactivity clock starts again
 * from it. A session writes at most once a day, so a page view costs no write.
 * A sign-in passes `everyTime` and always writes.
 *
 * It never fails the caller. A sign-in that cannot stamp the column still
 * signs the patient in. The log names the failure.
 */
export const recordPatientAccountSeen = async (
  account: PatientAccount,
  options: { everyTime?: boolean; now?: Date } = {},
  db?: DatabaseClient,
): Promise<PatientAccount> => {
  const now = options.now ?? new Date();
  const last = account.lastSeenAt?.getTime() ?? 0;
  if (!options.everyTime && now.getTime() - last < SEEN_WRITE_INTERVAL_MS) {
    return account;
  }
  try {
    return (
      (await accounts(db).update(account.id, { lastSeenAt: now })) ?? account
    );
  } catch (cause) {
    console.error("[patient-account] the last sign-in was not recorded", {
      account: account.id,
      cause,
    });
    return account;
  }
};

/** Every patient account, page by page. The inactivity sweep reads them all. */
export const listPatientAccounts = async (
  db?: DatabaseClient,
): Promise<readonly PatientAccount[]> => {
  const all: PatientAccount[] = [];
  let cursor: string | null = null;
  do {
    const page: Page<PatientAccount> = await accounts(db).findMany(
      {},
      { limit: 500, cursor },
    );
    all.push(...page.items);
    cursor = page.nextCursor;
  } while (cursor);
  return all;
};

/** Sets or clears the inactivity notice's timestamp. */
export const setInactivityNoticeSentAt = async (
  id: string,
  at: Date | null,
  db?: DatabaseClient,
): Promise<void> => {
  await accounts(db).update(id, { inactivityNoticeSentAt: at });
};
