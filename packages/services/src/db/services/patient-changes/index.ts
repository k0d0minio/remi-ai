import { z } from "zod";
import {
  isWatchedPatientField,
  type PatientChangeValue,
  type WatchedPatientField,
} from "../../../shared/patient-changes";
import { err, ok, type Result } from "../../../shared/result";
import type { Id } from "../../../types";
import { getDatabase, type DatabaseClient } from "../../client";
import type { PatientChange } from "../../models/patient-change";
import type { PatientProfile } from "../../models/patient-profile";
import type { ProtocolVersion } from "../../models/protocol-version";
import type { Actor } from "../../models/actor";
import { recordAuditEvent, type OperatorActor } from "../audit";
import { byPatient, listablePatientIds, noSuchPatient } from "../access";

/**
 * The patient's change signals — story 21, `patient-change-signals`.
 *
 * Every patient-side write of a watched field passes its values before and
 * after to `recordPatientChanges`. On a file with a validated version, or
 * whose care is active, each field that differs leaves one open signal. The practitioner's own writes never
 * come here: the services call it only for a `patient` actor.
 *
 * The reads serve the file's markers (`listOpenPatientChanges`) and the
 * patient list's indicator (`countOpenPatientChanges`). The practitioner
 * clears a signal with `acknowledgePatientChanges`: the row stays, closed. The seam's filter is
 * equality, and `acknowledged_at = null` matches nothing in SQL, so the open
 * filter runs here, as for the unread messages.
 */

const changes = (db: DatabaseClient = getDatabase()) =>
  db.collection<PatientChange>("patient_changes");

const uuidSchema = z.uuid();

/** The values of the watched fields a write named, before or after it. */
export type WatchedValues = Partial<Record<WatchedPatientField, unknown>>;

/** The file facts the helper needs. The caller read the row already. */
export type ChangedPatient = Pick<PatientProfile, "id" | "pseudonym"> & {
  fileStatus: PatientProfile["fileStatus"];
};

/**
 * Whether the file status alone arms the signal. « Accompagnement actif »
 * follows the practitioner's validation of the recommendations. A file that
 * became active before the versions existed has no version, and its status
 * arms the signal.
 */
export const isChangeSignalArmed = (
  patient: Pick<ChangedPatient, "fileStatus">,
) => patient.fileStatus === "active";

/**
 * Whether a patient change on this file raises a signal.
 *
 * Story 21 says « after validation ». The fact is a validated version of the
 * protocol (`protocol_versions`): a change between the validation and the
 * activation raises a signal too. An active file is armed with no read. The
 * first questionnaire fill happens before each of them and raises nothing.
 *
 * The read goes to the table, not to the protocol-versions service: that
 * service imports the services that call this module.
 */
const changeSignalArmed = async (
  patient: Pick<ChangedPatient, "id" | "fileStatus">,
  db: DatabaseClient = getDatabase(),
): Promise<boolean> => {
  if (isChangeSignalArmed(patient)) {
    return true;
  }
  const page = await db
    .collection<ProtocolVersion>("protocol_versions")
    .findMany({ patientId: patient.id }, { limit: 1 });
  return page.items.length > 0;
};

/**
 * The stored form of a value: an empty text or an empty list is `null`, a list
 * is sorted, a text is trimmed. Two values are the same change when their
 * stored forms are equal.
 */
export const storedChangeValue = (value: unknown): PatientChangeValue => {
  if (value === undefined || value === null) {
    return null;
  }
  if (Array.isArray(value)) {
    const items = value.map(String).sort();
    return items.length === 0 ? null : items;
  }
  if (typeof value === "string") {
    const text = value.trim();
    return text === "" ? null : text;
  }
  if (typeof value === "number" || typeof value === "boolean") {
    return value;
  }
  return String(value);
};

const sameValue = (a: PatientChangeValue, b: PatientChangeValue) =>
  JSON.stringify(a) === JSON.stringify(b);

/** Every row of the patient, paged. A file has few: one per change. */
const rowsOf = async (
  patientId: Id,
  db?: DatabaseClient,
): Promise<PatientChange[]> => {
  const rows: PatientChange[] = [];
  let cursor: string | undefined;
  do {
    const page = await changes(db).findMany(
      { patientId },
      { limit: 500, cursor },
    );
    rows.push(...page.items);
    cursor = page.nextCursor ?? undefined;
  } while (cursor);
  return rows;
};

const isOpen = (row: PatientChange) =>
  row.acknowledgedAt === null || row.acknowledgedAt === undefined;

/**
 * Record the patient's changes of one write. Call it after the write, with the
 * values the write named, before and after. A field in only one of the two
 * maps is ignored.
 *
 * For each watched field whose stored value differs:
 *
 * 1. With no open signal: insert one row.
 * 2. With an open signal: keep `old_value`, move `new_value` and `changed_at`.
 * 3. When the new value equals the open signal's `old_value`: delete the
 *    signal. The patient reverted the change (Jamie, question 2, 2026-11-11).
 *
 * Then one `patient.changed` audit event names the fields (D-32). The result
 * holds the open signals the write left: inserted or moved.
 */
export const recordPatientChanges = async (
  patient: ChangedPatient,
  before: WatchedValues,
  after: WatchedValues,
  db?: DatabaseClient,
): Promise<Result<PatientChange[]>> => {
  const changed: WatchedPatientField[] = [];
  for (const field of Object.keys(after)) {
    if (!isWatchedPatientField(field) || !(field in before)) {
      continue;
    }
    if (
      !sameValue(
        storedChangeValue(before[field]),
        storedChangeValue(after[field]),
      )
    ) {
      changed.push(field);
    }
  }
  if (changed.length === 0) {
    return ok([]);
  }

  try {
    if (!(await changeSignalArmed(patient, db))) {
      return ok([]);
    }
    const open = new Map(
      (await rowsOf(patient.id, db))
        .filter(isOpen)
        .map((row) => [row.fieldKey, row] as const),
    );
    const now = new Date();
    const written: PatientChange[] = [];
    for (const field of changed) {
      const next = storedChangeValue(after[field]);
      const row = open.get(field);
      if (!row) {
        written.push(
          await changes(db).insert({
            patientId: patient.id,
            fieldKey: field,
            oldValue: storedChangeValue(before[field]),
            newValue: next,
            changedAt: now,
            acknowledgedAt: null,
            acknowledgedBy: null,
          }),
        );
      } else if (sameValue(row.oldValue, next)) {
        await changes(db).remove(row.id);
      } else {
        const moved = await changes(db).update(row.id, {
          newValue: next,
          changedAt: now,
        });
        if (moved) {
          written.push(moved);
        }
      }
    }
    await recordAuditEvent({
      actor: { kind: "patient", id: patient.id, name: patient.pseudonym },
      action: "patient.changed",
      targetType: "patient",
      targetId: patient.id,
      targetLabel: patient.pseudonym,
      detail: changed.join(", "),
    });
    return ok(written);
  } catch (cause) {
    // The patient's write already landed. A lost signal must not undo it, so
    // the failure is logged and returned, never thrown.
    console.error("[patient-changes] could not record the changes", cause);
    return err("upstream_failed", "the change signals were not recorded");
  }
};

const byNewest = (a: PatientChange, b: PatientChange) =>
  b.changedAt.getTime() - a.changedAt.getTime();

/**
 * The open signals of one file, newest first — the file's markers
 * (`patient-file-view/post-validation-change-markers`) and the console's list
 * (`change-signals-in-console`).
 */
const unscopedListOpenPatientChanges = async (
  patientId: Id,
): Promise<Result<PatientChange[]>> => {
  if (!uuidSchema.safeParse(patientId).success) {
    return err("not_found", "no such patient");
  }
  return ok((await rowsOf(patientId)).filter(isOpen).sort(byNewest));
};

export const listOpenPatientChanges = byPatient(
  "read",
  unscopedListOpenPatientChanges,
  noSuchPatient,
);

/**
 * Every file's count of open signals in one pass, for the patient list's
 * « Modifié par le patient » (`patient-list-and-status/list-indicators`). A
 * file with none is absent. The actor's own files only (story 3).
 */
export const countOpenPatientChanges = async (
  actor: Actor,
): Promise<ReadonlyMap<Id, number>> => {
  const listable = await listablePatientIds(actor);
  const counts = new Map<Id, number>();
  let cursor: string | undefined;
  do {
    const page = await changes().findMany({}, { limit: 500, cursor });
    for (const row of page.items) {
      if (listable && !listable.has(row.patientId)) {
        continue;
      }
      if (isOpen(row)) {
        counts.set(row.patientId, (counts.get(row.patientId) ?? 0) + 1);
      }
    }
    cursor = page.nextCursor ?? undefined;
  } while (cursor);
  return counts;
};

/** What the practitioner acknowledges: each open signal, or the named ones. */
export type AcknowledgeSelection = "all" | readonly Id[];

/**
 * « Pris en compte » (story 21): the practitioner acknowledges open signals of
 * one file. Each row gets `acknowledged_at` and `acknowledged_by`. The row
 * stays in the table: it leaves the card and the list, not the data.
 *
 * 1. A named id that is not an open signal of this file is ignored. A second
 *    click, or an id of another file, changes nothing and is not an error.
 * 2. One `patient.change_acknowledged` event names the field keys (D-32). The
 *    old and the new values are health data: they never go to the trail.
 * 3. Nothing else is written. A validated recommendation, a protocol version
 *    and a calculation do not change here.
 *
 * The result holds the rows that this call closed.
 */
const unscopedAcknowledgePatientChanges = async (
  patientId: Id,
  actor: OperatorActor,
  selection: AcknowledgeSelection,
): Promise<Result<PatientChange[]>> => {
  if (!uuidSchema.safeParse(patientId).success) {
    return noSuchPatient();
  }
  const file = await getDatabase()
    .collection<PatientProfile>("patient_profiles")
    .findById(patientId);
  if (!file) {
    return noSuchPatient();
  }
  const open = (await rowsOf(patientId)).filter(isOpen);
  const chosen =
    selection === "all"
      ? open
      : open.filter((row) => selection.includes(row.id));
  if (chosen.length === 0) {
    return ok([]);
  }
  const now = new Date();
  const closed: PatientChange[] = [];
  for (const row of chosen) {
    const updated = await changes().update(row.id, {
      acknowledgedAt: now,
      acknowledgedBy: actor.id,
    });
    if (updated) {
      closed.push(updated);
    }
  }
  if (closed.length > 0) {
    await recordAuditEvent({
      actor,
      action: "patient.change_acknowledged",
      targetType: "patient",
      targetId: patientId,
      targetLabel: file.pseudonym,
      detail: closed.map((row) => row.fieldKey).join(", "),
    });
  }
  return ok(closed);
};

/**
 * The scoped surface (story 3, D-27). Only the practitioner who holds the
 * file may acknowledge. An admin's read-only open is refused, as a missing
 * file.
 */
export const acknowledgePatientChanges = byPatient(
  "write",
  unscopedAcknowledgePatientChanges,
  noSuchPatient,
);
