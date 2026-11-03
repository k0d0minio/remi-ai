import { isMailerRegistered, sendEmail } from "../../../email";
import {
  inactivityNoticeCopyEmail,
  inactivityNoticeEmail,
} from "../../../email/templates/inactivity-notice";
import { isLocale, type Locale } from "../../../shared/i18n";
import { err, ok, type Result } from "../../../shared/result";
import type { Id, Page } from "../../../types";
import { getDatabase, type DatabaseClient } from "../../client";
import type { AuditEvent } from "../../models/audit-event";
import type { PatientAccount } from "../../models/patient-account";
import type { PatientProfile } from "../../models/patient-profile";
import { recordAuditEvent, type OperatorActor } from "../audit";
import { getOperator } from "../operators";
import {
  listPatientAccounts,
  setInactivityNoticeSentAt,
} from "../patient-accounts";
import { deletePatient, getPatient } from "../patients";

/**
 * Retention: the inactivity sweep and the hold that stops it
 * (`inactive-account-deletion`, privacy policy § 7, D-32).
 *
 * The clock of an account starts at the latest of three instants:
 *
 * 1. the account's creation,
 * 2. `lastSeenAt`: the last sign-in, or the last day a live session opened the app,
 * 3. the patient's latest write: the newest audit event with actor kind `patient`.
 *
 * Eleven calendar months after it, the patient gets one notice e-mail and the
 * practitioner a copy. Twelve months after it, and at least thirty days after
 * the notice, the file goes through `deletePatient`, the console's cascade,
 * files first. A return after the notice voids it, and the clock starts again.
 * A retention hold on the file stops both the notice and the deletion.
 *
 * Months are calendar months in UTC. The sweep runs once a day, so an hour of
 * offset changes nothing a patient can see.
 */

const NOTICE_AFTER_MONTHS = 11;
const DELETE_AFTER_MONTHS = 12;
const NOTICE_MIN_DAYS = 30;
const DAY_MS = 24 * 60 * 60 * 1000;

/** The actor of every act of the sweep. The audit journal reads it as REMI. */
const sweepActor = { kind: "system", id: null, name: "REMI" } as const;

/**
 * `date` moved by whole calendar months, in UTC. A day the target month does
 * not have becomes its last day: 31 March + 11 months is 29 February.
 */
export const addMonthsUtc = (date: Date, months: number): Date => {
  const target = new Date(
    Date.UTC(
      date.getUTCFullYear(),
      date.getUTCMonth() + months,
      1,
      date.getUTCHours(),
      date.getUTCMinutes(),
      date.getUTCSeconds(),
      date.getUTCMilliseconds(),
    ),
  );
  const lastDay = new Date(
    Date.UTC(target.getUTCFullYear(), target.getUTCMonth() + 1, 0),
  ).getUTCDate();
  target.setUTCDate(Math.min(date.getUTCDate(), lastDay));
  return target;
};

const latest = (dates: readonly (Date | null)[]): Date =>
  new Date(Math.max(...dates.map((date) => date?.getTime() ?? 0)));

/**
 * The patient's newest write, from the audit trail. The seam promises no
 * order, so the sweep reads every page and keeps the newest.
 */
const latestPatientWrite = async (
  patientId: Id,
  db: DatabaseClient,
): Promise<Date | null> => {
  const events = db.collection<AuditEvent>("audit_events");
  let newest: Date | null = null;
  let cursor: string | null = null;
  do {
    const page: Page<AuditEvent> = await events.findMany(
      { actorKind: "patient", actorId: patientId },
      { limit: 500, cursor },
    );
    for (const event of page.items) {
      if (!newest || event.createdAt > newest) {
        newest = event.createdAt;
      }
    }
    cursor = page.nextCursor;
  } while (cursor);
  return newest;
};

/** When the inactivity clock of this account started. */
export const lastActiveAt = async (
  account: PatientAccount,
  db: DatabaseClient = getDatabase(),
): Promise<Date> =>
  latest([
    account.createdAt,
    account.lastSeenAt,
    await latestPatientWrite(account.patientProfileId, db),
  ]);

/**
 * The day the file goes: twelve months after the last activity, and never
 * less than thirty days after the notice. February makes the second rule
 * bite: eleven to twelve months can be 28 days.
 */
export const deletionDateFor = (lastActive: Date, noticeSentAt: Date): Date =>
  latest([
    addMonthsUtc(lastActive, DELETE_AFTER_MONTHS),
    new Date(noticeSentAt.getTime() + NOTICE_MIN_DAYS * DAY_MS),
  ]);

export type InactivitySweepCounts = {
  /** Notices sent this run. */
  noticed: number;
  /** Notices voided because the patient came back. */
  voided: number;
  /** Files deleted. */
  deleted: number;
  /** Files whose notice or deletion was due, skipped for a hold. */
  held: number;
  /** Sends or deletions that failed. The next run tries them again. */
  failed: number;
};

export type InactivitySweepInput = {
  now?: Date;
  /** The patient app's sign-in page in a language. The notice links it. */
  signInUrl: (locale: Locale) => string;
};

type Step = keyof InactivitySweepCounts | null;

const sendNotice = async (
  account: PatientAccount,
  patient: PatientProfile,
  deletionDate: Date,
  input: InactivitySweepInput,
  now: Date,
  db: DatabaseClient,
): Promise<Step> => {
  const locale: Locale = isLocale(patient.locale) ? patient.locale : "fr";
  try {
    await sendEmail({
      to: account.email,
      ...inactivityNoticeEmail({
        name: patient.firstName ?? "",
        deletionDate,
        signInUrl: input.signInUrl(locale),
        locale,
      }),
    });
  } catch (cause) {
    console.error("[inactivity] the notice was not sent", {
      patient: patient.id,
      cause,
    });
    return "failed";
  }
  await setInactivityNoticeSentAt(account.id, now, db);
  await recordAuditEvent({
    actor: sweepActor,
    action: "patient.inactivity_notice_sent",
    targetType: "patient",
    targetId: patient.id,
    targetLabel: patient.pseudonym,
    detail: deletionDate.toISOString().slice(0, 10),
  });

  // The patient has the notice. A failed copy is logged, never retried: a
  // retry would send the patient a second notice.
  const practitioner = await getOperator(patient.practitionerId);
  if (practitioner) {
    try {
      await sendEmail({
        to: practitioner.email,
        ...inactivityNoticeCopyEmail({
          pseudonym: patient.pseudonym,
          deletionDate,
        }),
      });
    } catch (cause) {
      console.error("[inactivity] the practitioner's copy was not sent", {
        patient: patient.id,
        cause,
      });
    }
  }
  return "noticed";
};

const removeInactive = async (patient: PatientProfile): Promise<Step> => {
  const removed = await deletePatient(patient.id);
  if (!removed.ok) {
    if (removed.error === "not_found") {
      return null;
    }
    console.error("[inactivity] the deletion failed", {
      patient: patient.id,
      message: removed.message,
    });
    return "failed";
  }
  await recordAuditEvent({
    actor: sweepActor,
    action: "patient.deleted",
    targetType: "patient",
    targetId: patient.id,
    targetLabel: patient.pseudonym,
    detail: "inactivity",
  });
  return "deleted";
};

/** One account through the rule. The answer names the counter it moves. */
const sweepAccount = async (
  account: PatientAccount,
  input: InactivitySweepInput,
  now: Date,
  db: DatabaseClient,
): Promise<readonly Step[]> => {
  const patient = await getPatient(account.patientProfileId, db);
  if (!patient.ok) {
    return [];
  }
  const steps: Step[] = [];
  const lastActive = await lastActiveAt(account, db);

  let noticeSentAt = account.inactivityNoticeSentAt;
  if (noticeSentAt && lastActive > noticeSentAt) {
    await setInactivityNoticeSentAt(account.id, null, db);
    noticeSentAt = null;
    steps.push("voided");
  }

  const noticeDue =
    !noticeSentAt && now >= addMonthsUtc(lastActive, NOTICE_AFTER_MONTHS);
  const deletionDue =
    noticeSentAt !== null && now >= deletionDateFor(lastActive, noticeSentAt);
  if (!noticeDue && !deletionDue) {
    return steps;
  }

  if (patient.data.retentionHoldAt) {
    console.info(`[inactivity] hold: ${patient.data.id} is kept`);
    return [...steps, "held"];
  }
  if (noticeDue) {
    const deletionDate = deletionDateFor(lastActive, now);
    return [
      ...steps,
      await sendNotice(account, patient.data, deletionDate, input, now, db),
    ];
  }
  return [...steps, await removeInactive(patient.data)];
};

/**
 * The daily sweep. Safe to run twice on one day: a sent notice stamps its
 * column, so no second notice goes out, and a deleted file is gone.
 *
 * With no mailer registered it does nothing at all and answers
 * `upstream_failed`. No file may go without its notice.
 */
export const runInactivitySweep = async (
  input: InactivitySweepInput,
  db: DatabaseClient = getDatabase(),
): Promise<Result<InactivitySweepCounts>> => {
  if (!isMailerRegistered()) {
    return err(
      "upstream_failed",
      "no mailer is registered, so no notice can go out: the sweep did nothing",
    );
  }
  const now = input.now ?? new Date();
  const counts: InactivitySweepCounts = {
    noticed: 0,
    voided: 0,
    deleted: 0,
    held: 0,
    failed: 0,
  };
  for (const account of await listPatientAccounts(db)) {
    for (const step of await sweepAccount(account, input, now, db)) {
      if (step) {
        counts[step] += 1;
      }
    }
  }
  return ok(counts);
};

/**
 * Sets or clears the retention hold on a file. The caller checks that the
 * operator may (an owner who holds the file). The audit event names the actor.
 */
export const setRetentionHold = async (
  patientId: Id,
  held: boolean,
  operator: OperatorActor,
): Promise<Result<PatientProfile>> => {
  const patient = await getPatient(patientId);
  if (!patient.ok) {
    return patient;
  }
  if (Boolean(patient.data.retentionHoldAt) === held) {
    return ok(patient.data);
  }
  const updated = await getDatabase()
    .collection<PatientProfile>("patient_profiles")
    .update(patientId, { retentionHoldAt: held ? new Date() : null });
  if (!updated) {
    return err("not_found", "no such patient");
  }
  await recordAuditEvent({
    actor: operator,
    action: held
      ? "patient.retention_hold_set"
      : "patient.retention_hold_cleared",
    targetType: "patient",
    targetId: patientId,
    targetLabel: updated.pseudonym,
  });
  return ok(updated);
};
