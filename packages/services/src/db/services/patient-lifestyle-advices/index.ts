import { z } from "zod";
import {
  isLifestyleAdviceKey,
  lifestyleAdviceFaults,
  lifestyleAdviceKeys,
  lifestyleKeyOf,
  lifestyleRowsByKey,
  type LifestyleAdvice,
  type LifestyleAdviceDraft,
  type LifestyleAdviceEdit,
} from "../../../shared/lifestyle-advice";
import { err, ok, type Result } from "../../../shared/result";
import type { Entity, Id } from "../../../types";
import { getDatabase, type DatabaseClient } from "../../client";
import type { PatientProfile } from "../../models/patient-profile";
import { byPatient, byRecord, noSuchPatient } from "../access";
import { recordAuditEvent, type OperatorActor } from "../audit";
import { moveToValidateAfterSave } from "../first-recommendation";
import { touchPatient } from "../patients";

/**
 * The lifestyle advice of a patient file — REM-65, story 17.
 *
 * An advice is a row of `patient_recommendations` (Jamie, 2026-11-20: no table
 * of its own yet, the stub `advice-table` is open). Its category is one of the
 * six keys of `shared/lifestyle-advice`, its text is in `title` and its details
 * are in `detail`. A row of the old categories `habit` and `activity` is read
 * here in its category of the section. This service never changes the stored
 * category of a row.
 *
 * `patient-recommendations` does not return a row of the six keys, so its
 * whole-section save cannot archive an advice.
 *
 * Each write has one audit event with the operator (D-32). The detail has
 * counts and categories, and no text of the advice.
 */

/** The row as stored. The category is wider than the recommendation model. */
type StoredAdvice = Entity & {
  patientId: Id;
  category: string;
  title: string;
  detail: string;
  position: number;
  archivedAt: Date | null;
};

const rows = (db: DatabaseClient = getDatabase()) =>
  db.collection<StoredAdvice>("patient_recommendations");

const uuidSchema = z.uuid();

const noSuchAdvice = () => err("not_found", "no such advice");

const toAdvice = (row: StoredAdvice): LifestyleAdvice[] => {
  const category = lifestyleKeyOf(row.category);
  return category === null
    ? []
    : [
        {
          id: row.id,
          category,
          text: row.title,
          details: row.detail,
          position: row.position,
          disabledAt: row.archivedAt,
        },
      ];
};

/**
 * Every lifestyle row of the file. The rows of the old categories come first,
 * then the oldest row first. That is the tiebreak of two rows with one
 * position, and `validatedRecommendationsView` uses the same one.
 */
const storedOf = async (patientId: Id): Promise<StoredAdvice[]> => {
  if (!uuidSchema.safeParse(patientId).success) {
    return [];
  }
  const page = await rows().findMany({ patientId }, { limit: 200 });
  const rank = (row: StoredAdvice) =>
    isLifestyleAdviceKey(row.category) ? 1 : 0;
  return page.items
    .filter((row) => lifestyleKeyOf(row.category) !== null)
    .sort(
      (a, b) =>
        rank(a) - rank(b) || a.createdAt.getTime() - b.createdAt.getTime(),
    );
};

/** The six categories in order, then the position. */
const inSectionOrder = (stored: readonly StoredAdvice[]): LifestyleAdvice[] =>
  lifestyleRowsByKey(stored).flatMap((group) => group.rows.flatMap(toAdvice));

/** The advice in force, in the order of the section. */
const unscopedListPatientLifestyleAdvices = async (
  patientId: Id,
): Promise<readonly LifestyleAdvice[]> =>
  inSectionOrder(
    (await storedOf(patientId)).filter((row) => row.archivedAt === null),
  );

/** The disabled advice, the latest disabled first. */
const unscopedListDisabledPatientLifestyleAdvices = async (
  patientId: Id,
): Promise<readonly LifestyleAdvice[]> =>
  (await storedOf(patientId))
    .filter((row) => row.archivedAt !== null)
    .sort(
      (a, b) => (b.archivedAt?.getTime() ?? 0) - (a.archivedAt?.getTime() ?? 0),
    )
    .flatMap(toAdvice);

/**
 * The active advice of the six keys, as rows of a snapshot. The rows of the
 * old categories are not here: `listPatientRecommendations` gives them to the
 * snapshot already. For `protocol-versions` only, which has checked the actor.
 */
export const lifestyleSnapshotRowsAfterAccessCheck = async (patientId: Id) =>
  inSectionOrder(
    (await storedOf(patientId)).filter(
      (row) => row.archivedAt === null && isLifestyleAdviceKey(row.category),
    ),
  ).map((advice) => ({
    id: advice.id,
    category: advice.category,
    title: advice.text,
    detail: advice.details,
    position: advice.position,
  }));

const fileOf = async (patientId: Id) =>
  uuidSchema.safeParse(patientId).success
    ? getDatabase()
        .collection<PatientProfile>("patient_profiles")
        .findById(patientId)
    : null;

const draftSchema = z.object({
  category: z.enum(lifestyleAdviceKeys),
  text: z.string(),
  details: z.string(),
});

const editSchema = z.object({
  id: z.uuid(),
  text: z.string(),
  details: z.string(),
});

export type LifestyleAdviceSave = {
  added: readonly LifestyleAdviceDraft[];
  edited: readonly LifestyleAdviceEdit[];
};

export type LifestyleAdviceSaveCounts = { added: number; updated: number };

/**
 * Save the new advice and the changed advice of the section in one act.
 *
 * 1. Each line is checked before the first write. A fault refuses the whole
 *    save as `invalid_input`, and nothing is written. The message names the
 *    fault code, the list and the line.
 * 2. An edited line must be an active lifestyle advice of this file. If it is
 *    not, the save is refused as `conflict` and nothing is written.
 * 3. A new advice goes to the end of its category.
 * 4. An edited line with the same text and the same details is not written.
 * 5. One `lifestyle_advice.batch_saved` event has the counts (D-32).
 * 6. A save that leaves content moves a file at « Prêt pour consultation » to
 *    « Recommandations à valider » (D-31).
 */
const unscopedSavePatientLifestyleAdvices = async (
  patientId: Id,
  operator: OperatorActor,
  submitted: LifestyleAdviceSave,
): Promise<Result<LifestyleAdviceSaveCounts>> => {
  const file = await fileOf(patientId);
  if (!file) {
    return noSuchPatient();
  }
  const added: LifestyleAdviceDraft[] = [];
  for (const row of submitted.added) {
    const parsed = draftSchema.safeParse(row);
    if (!parsed.success) {
      return err("invalid_input", "a new advice is not valid");
    }
    added.push({
      category: parsed.data.category,
      text: parsed.data.text.trim(),
      details: parsed.data.details.trim(),
    });
  }
  const edited: LifestyleAdviceEdit[] = [];
  for (const row of submitted.edited) {
    const parsed = editSchema.safeParse(row);
    if (!parsed.success) {
      return err("invalid_input", "an edited advice is not valid");
    }
    edited.push({
      id: parsed.data.id,
      text: parsed.data.text.trim(),
      details: parsed.data.details.trim(),
    });
  }
  const [fault] = lifestyleAdviceFaults(added, edited);
  if (fault) {
    return err(
      "invalid_input",
      `${fault.code}: ${fault.list} line ${fault.line}`,
    );
  }

  const active = (await storedOf(patientId)).filter(
    (row) => row.archivedAt === null,
  );
  const activeById = new Map(active.map((row) => [row.id, row]));
  if (edited.some((edit) => !activeById.has(edit.id))) {
    return err("conflict", "an edited advice is not in force in this file");
  }
  const changes = edited.filter((edit) => {
    const stored = activeById.get(edit.id);
    return (
      stored !== undefined &&
      (stored.title !== edit.text || stored.detail !== edit.details)
    );
  });
  const counts = { added: added.length, updated: changes.length };
  if (counts.added === 0 && counts.updated === 0) {
    return ok(counts);
  }

  // The next free position of each category, old rows of the category included.
  const next = new Map(
    lifestyleRowsByKey(active).map((group) => [
      group.category,
      group.rows.reduce((highest, row) => Math.max(highest, row.position + 1), 0),
    ]),
  );
  await getDatabase().transaction(async (tx) => {
    for (const edit of changes) {
      await rows(tx).update(edit.id, { title: edit.text, detail: edit.details });
    }
    for (const draft of added) {
      const position = next.get(draft.category) ?? 0;
      next.set(draft.category, position + 1);
      await rows(tx).insert({
        patientId,
        category: draft.category,
        title: draft.text,
        detail: draft.details,
        position,
        archivedAt: null,
      });
    }
    await touchPatient(patientId, tx);
  });

  await recordAuditEvent({
    actor: operator,
    action: "lifestyle_advice.batch_saved",
    targetType: "patient",
    targetId: patientId,
    targetLabel: file.pseudonym,
    detail: JSON.stringify({
      added: counts.added,
      updated: counts.updated,
      addedByCategory: Object.fromEntries(
        lifestyleAdviceKeys.map((category) => [
          category,
          added.filter((draft) => draft.category === category).length,
        ]),
      ),
    }),
  });
  await moveToValidateAfterSave(patientId);
  return ok(counts);
};

/** The lifestyle row of this id, or null: a row of another category is not one. */
const adviceRowOf = async (id: Id): Promise<StoredAdvice | null> => {
  if (!uuidSchema.safeParse(id).success) {
    return null;
  }
  const row = await rows().findById(id);
  return row && lifestyleKeyOf(row.category) !== null ? row : null;
};

const auditOne = async (
  operator: OperatorActor,
  action:
    | "lifestyle_advice.disabled"
    | "lifestyle_advice.restored"
    | "lifestyle_advice.deleted",
  row: StoredAdvice,
) => {
  const file = await fileOf(row.patientId);
  await recordAuditEvent({
    actor: operator,
    action,
    targetType: "patient",
    targetId: row.patientId,
    targetLabel: file?.pseudonym ?? "",
    detail: JSON.stringify({
      advice: row.id,
      category: lifestyleKeyOf(row.category),
    }),
  });
};

/**
 * Disable an advice, or put a disabled advice back in force. A disabled advice
 * is not in the next validated version, and it stays in the fold of the
 * section. A call that changes nothing writes nothing.
 */
const unscopedSetLifestyleAdviceDisabled = async (
  id: Id,
  operator: OperatorActor,
  disabled: boolean,
): Promise<Result<true>> => {
  const row = await adviceRowOf(id);
  if (!row) {
    return noSuchAdvice();
  }
  if ((row.archivedAt !== null) === disabled) {
    return ok(true);
  }
  const updated = await rows().update(id, {
    archivedAt: disabled ? new Date() : null,
  });
  if (!updated) {
    return noSuchAdvice();
  }
  await touchPatient(row.patientId);
  await auditOne(
    operator,
    disabled ? "lifestyle_advice.disabled" : "lifestyle_advice.restored",
    row,
  );
  return ok(true);
};

/**
 * Delete an advice, active or disabled. The row leaves the table. A validated
 * version that holds the advice keeps its copy (D-30).
 */
const unscopedDeleteLifestyleAdvice = async (
  id: Id,
  operator: OperatorActor,
): Promise<Result<true>> => {
  const row = await adviceRowOf(id);
  if (!row) {
    return noSuchAdvice();
  }
  if (!(await rows().remove(id))) {
    return noSuchAdvice();
  }
  await touchPatient(row.patientId);
  await auditOne(operator, "lifestyle_advice.deleted", row);
  return ok(true);
};

/**
 * The scoped surface (story 3, D-27). The actor comes first, and
 * `db/services/access` checks it before the body runs. A refused call answers
 * as a missing file.
 */
export const listPatientLifestyleAdvices = byPatient(
  "read",
  unscopedListPatientLifestyleAdvices,
  () => [],
);
export const listDisabledPatientLifestyleAdvices = byPatient(
  "read",
  unscopedListDisabledPatientLifestyleAdvices,
  () => [],
);
export const savePatientLifestyleAdvices = byPatient(
  "write",
  unscopedSavePatientLifestyleAdvices,
  noSuchPatient,
);
export const setLifestyleAdviceDisabled = byRecord(
  "recommendation",
  "write",
  unscopedSetLifestyleAdviceDisabled,
  noSuchAdvice,
);
export const deleteLifestyleAdvice = byRecord(
  "recommendation",
  "write",
  unscopedDeleteLifestyleAdvice,
  noSuchAdvice,
);
