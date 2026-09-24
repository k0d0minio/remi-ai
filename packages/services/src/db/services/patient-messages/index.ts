import { z } from "zod";
import { err, ok, type Result } from "../../../shared/result";
import type { Id } from "../../../types";
import { getDatabase, type DatabaseClient } from "../../client";
import type {
  PatientMessage,
  PatientMessageEntry,
} from "../../models/patient-message";
import { getOperator } from "../operators";
import { touchPatient } from "../patients";

/**
 * The general thread — her 14 Sept document, § 6: « un endroit très simple où
 * le consultant peut laisser un commentaire général ». One thread per patient,
 * and three rules:
 *
 * - **Append-only.** Nothing here edits or deletes a message; the thread goes
 *   with the patient.
 * - **Unread is hers to clear** (D-32). A patient message stays unread until
 *   she replies after it or marks it read; reading the page clears nothing.
 * - **A reply clears what it answers.** Every patient message sent up to the
 *   reply is marked read with it, so answering once settles the backlog.
 */

/** The meal journal's ceiling, and the link's body class — one limit. */
const MESSAGE_MAX = 2000;

const messages = (db: DatabaseClient = getDatabase()) =>
  db.collection<PatientMessage>("patient_messages");

const uuidSchema = z.uuid();

const bodySchema = z
  .string()
  .trim()
  .min(1, "a message is required")
  .max(MESSAGE_MAX, "that message is too long");

/**
 * Every row for one patient. A patient who writes weekly and gets a reply each
 * time accumulates about a hundred rows a year, so one page holds them.
 */
const allForPatient = async (
  patientId: Id,
  db?: DatabaseClient,
): Promise<readonly PatientMessage[]> => {
  if (!uuidSchema.safeParse(patientId).success) {
    return [];
  }
  const page = await messages(db).findMany({ patientId }, { limit: 1000 });
  return page.items;
};

const newestFirst = (a: PatientMessage, b: PatientMessage) =>
  b.sentAt.getTime() - a.sentAt.getTime() ||
  b.createdAt.getTime() - a.createdAt.getTime();

const isUnread = (message: PatientMessage) =>
  message.author === "patient" && message.readAt === null;

/**
 * The thread, newest first, each reply carrying its author's name. Names are
 * read per distinct operator — one or two per patient — rather than per row.
 */
export const listPatientMessages = async (
  patientId: Id,
): Promise<readonly PatientMessageEntry[]> => {
  const rows = [...(await allForPatient(patientId))].sort(newestFirst);
  const operatorIds = [
    ...new Set(rows.flatMap((row) => (row.operatorId ? [row.operatorId] : []))),
  ];
  const names = new Map<Id, string>();
  for (const id of operatorIds) {
    const operator = await getOperator(id);
    if (operator) {
      names.set(id, operator.name);
    }
  }
  return rows.map((row) => ({
    ...row,
    operatorName: row.operatorId ? (names.get(row.operatorId) ?? null) : null,
  }));
};

/** What the console marks: the patient's messages she has not dealt with. */
export const countUnreadPatientMessages = async (
  patientId: Id,
): Promise<number> => (await allForPatient(patientId)).filter(isUnread).length;

/**
 * Every patient's unread count in one pass, for the roster — paged like the
 * challenge signals, never one read per row. The unread filter runs here: the
 * seam's filter is equality, and `read_at = null` matches nothing in SQL.
 */
export const listUnreadMessageCounts = async (): Promise<
  ReadonlyMap<Id, number>
> => {
  const counts = new Map<Id, number>();
  let cursor: string | undefined;
  do {
    const page = await messages().findMany(
      { author: "patient" },
      { limit: 500, cursor },
    );
    for (const message of page.items) {
      if (isUnread(message)) {
        counts.set(message.patientId, (counts.get(message.patientId) ?? 0) + 1);
      }
    }
    cursor = page.nextCursor ?? undefined;
  } while (cursor);
  return counts;
};

/**
 * The patient's message, written through their link. The caller is
 * `writeThroughPatientLink`, which resolves the token and attributes the
 * write, so this does not touch the roster timestamp: a patient writing is not
 * her working on the patient.
 */
export const sendPatientMessage = async (
  patientId: Id,
  body: string,
): Promise<Result<PatientMessage>> => {
  if (!uuidSchema.safeParse(patientId).success) {
    return err("not_found", "no such patient");
  }
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return err("invalid_input", parsed.error.issues[0].message);
  }
  const created = await messages().insert({
    patientId,
    author: "patient",
    body: parsed.data,
    sentAt: new Date(),
    readAt: null,
    operatorId: null,
  });
  return ok(created);
};

export type SentReply = {
  reply: PatientMessage;
  /** How many patient messages the reply marked read. */
  markedRead: number;
};

/**
 * Her reply, and the backlog it answers marked read in the same transaction —
 * every patient message sent up to the reply, so a message that arrives while
 * she types stays unread.
 */
export const replyToPatient = async (
  patientId: Id,
  operatorId: Id,
  body: string,
): Promise<Result<SentReply>> => {
  if (!uuidSchema.safeParse(patientId).success) {
    return err("not_found", "no such patient");
  }
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return err("invalid_input", parsed.error.issues[0].message);
  }
  const sentAt = new Date();
  const unread = (await allForPatient(patientId)).filter(
    (message) => isUnread(message) && message.sentAt <= sentAt,
  );

  const sent = await getDatabase().transaction(async (tx) => {
    for (const message of unread) {
      await messages(tx).update(message.id, { readAt: sentAt });
    }
    const reply = await messages(tx).insert({
      patientId,
      author: "practitioner",
      body: parsed.data,
      sentAt,
      readAt: null,
      operatorId,
    });
    await touchPatient(patientId, tx);
    return { reply, markedRead: unread.length };
  });
  return ok(sent);
};

/**
 * « Marquer comme lu » — for a message that needs no answer. Only a patient
 * message has a read state; marking one already read is a no-op, not a
 * refusal, so a double tap lands where she meant.
 */
export const markPatientMessageRead = async (
  id: Id,
): Promise<Result<PatientMessage>> => {
  if (!uuidSchema.safeParse(id).success) {
    return err("not_found", "no such message");
  }
  const existing = await messages().findById(id);
  if (!existing || existing.author !== "patient") {
    return err("not_found", "no such patient message");
  }
  if (existing.readAt !== null) {
    return ok(existing);
  }
  const updated = await messages().update(id, { readAt: new Date() });
  return updated ? ok(updated) : err("not_found", "no such message");
};
