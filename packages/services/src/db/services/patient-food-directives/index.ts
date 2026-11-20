import { z } from "zod";
import type { TotalEviction } from "../../../ai/compatibility";
import {
  evictionsOfDirectives,
  foodDirectiveFaults,
  foodDirectiveKinds,
  foodDirectiveTermKey,
  foodLimitLevels,
  type FoodDirectiveDraft,
  type FoodDirectiveKind,
} from "../../../shared/food-directives";
import { err, ok, type Result } from "../../../shared/result";
import type { Id } from "../../../types";
import { getDatabase, type DatabaseClient } from "../../client";
import type { PatientFoodDirective } from "../../models/patient-food-directive";
import type { PatientProfile } from "../../models/patient-profile";
import { byPatient, noSuchPatient } from "../access";
import { recordAuditEvent, type OperatorActor } from "../audit";
import { moveToValidateAfterSave } from "../first-recommendation";
import { touchPatient } from "../patients";
import {
  countSectionPlan,
  isEmptySave,
  planSectionSave,
  type SectionSaveCounts,
} from "../section-save";

/**
 * The food directives of a patient file — REM-54, story 13.
 *
 * The practitioner saves the three fields in one act. What is submitted is
 * what is in force: an active row that is not submitted is disabled, never
 * deleted. A row is found again by its kind and its term, so a term that is
 * typed differently is a new row and the old one is disabled with its history.
 *
 * A total eviction is safety data (story 14, D-30). `listPatientEvictions`
 * gives the evictions in force to the compatibility gate. It returns a
 * `Result`: a refused or failed read is never an empty list.
 */

const directives = (db: DatabaseClient = getDatabase()) =>
  db.collection<PatientFoodDirective>("patient_food_directives");

const uuidSchema = z.uuid();

const draftSchema = z.object({
  kind: z.enum(foodDirectiveKinds),
  term: z.string(),
  limitLevel: z.enum(foodLimitLevels).nullable(),
  startsOn: z.string().nullable(),
  endsOn: z.string().nullable(),
  durable: z.boolean(),
});

/** The order of the fields on the page, then the practitioner's order. */
const byKindThenPosition = (
  a: PatientFoodDirective,
  b: PatientFoodDirective,
) => {
  const kinds =
    foodDirectiveKinds.indexOf(a.kind) - foodDirectiveKinds.indexOf(b.kind);
  if (kinds !== 0) {
    return kinds;
  }
  if (a.position !== b.position) {
    return a.position - b.position;
  }
  return a.createdAt.getTime() - b.createdAt.getTime();
};

/** Every row of the patient, paged: the disabled rows add up with time. */
const allForPatient = async (
  patientId: Id,
  db?: DatabaseClient,
): Promise<PatientFoodDirective[]> => {
  const rows: PatientFoodDirective[] = [];
  let cursor: string | undefined;
  do {
    const page = await directives(db).findMany(
      { patientId },
      { limit: 500, cursor },
    );
    rows.push(...page.items);
    cursor = page.nextCursor ?? undefined;
  } while (cursor);
  return rows;
};

const activeOf = async (patientId: Id): Promise<PatientFoodDirective[]> =>
  (await allForPatient(patientId))
    .filter((row) => row.disabledAt === null)
    .sort(byKindThenPosition);

/** The directives in force. */
const unscopedListPatientFoodDirectives = async (
  patientId: Id,
): Promise<readonly PatientFoodDirective[]> =>
  uuidSchema.safeParse(patientId).success ? activeOf(patientId) : [];

/** The disabled directives, the latest one first. */
const unscopedListDisabledPatientFoodDirectives = async (
  patientId: Id,
): Promise<readonly PatientFoodDirective[]> => {
  if (!uuidSchema.safeParse(patientId).success) {
    return [];
  }
  return (await allForPatient(patientId))
    .filter((row) => row.disabledAt !== null)
    .sort(
      (a, b) => (b.disabledAt?.getTime() ?? 0) - (a.disabledAt?.getTime() ?? 0),
    );
};

/**
 * The total evictions in force on the file, as the compatibility gate reads
 * them: one for each active `exclude` row, with the term as typed and its
 * period. No row is dropped: not a term that REMI does not recognise, and not
 * an eviction past its end date.
 *
 * This reads the practitioner's working copy. A reader of validated content
 * uses `getValidatedProtocol` and `evictionsOfDirectives` on
 * `snapshot.foodDirectives`.
 *
 * A caller must stop on `ok: false`. It must not continue with no eviction.
 */
const unscopedListPatientEvictions = async (
  patientId: Id,
): Promise<Result<TotalEviction[]>> => {
  if (!uuidSchema.safeParse(patientId).success) {
    return noSuchPatient();
  }
  return ok(evictionsOfDirectives(await activeOf(patientId)));
};

const sameKey = (kind: FoodDirectiveKind, term: string) =>
  `${kind}:${foodDirectiveTermKey(term)}`;

const fieldsOf = (draft: FoodDirectiveDraft) => ({
  term: draft.term,
  limitLevel: draft.limitLevel,
  startsOn: draft.startsOn,
  endsOn: draft.endsOn,
  durable: draft.durable,
});

/** The counts of one save, for the audit event. No term: no patient text. */
const auditDetailOf = (
  counts: SectionSaveCounts,
  drafts: readonly FoodDirectiveDraft[],
) =>
  JSON.stringify({
    added: counts.added,
    updated: counts.updated,
    disabled: counts.archived,
    reordered: counts.reordered,
    inForce: Object.fromEntries(
      foodDirectiveKinds.map((kind) => [
        kind,
        drafts.filter((draft) => draft.kind === kind).length,
      ]),
    ),
  });

/**
 * Save the three fields in one act.
 *
 * 1. Each draft is checked before the first write. A fault refuses the whole
 *    save as `invalid_input`, and nothing is written. The message names the
 *    fault code and the term: the same term in « À favoriser » and in
 *    « Éviction totale », an eviction with no end date and no durable status,
 *    and the other faults of `foodDirectiveFaults`.
 * 2. An active row that is not submitted is disabled. `known` limits that to
 *    the rows that the editor showed (see `planSectionSave`).
 * 3. One `food_directive.batch_saved` event has the counts (D-32).
 * 4. A save that leaves content moves a file at « Prêt pour consultation » to
 *    « Recommandations à valider » (D-31).
 */
const unscopedSavePatientFoodDirectives = async (
  patientId: Id,
  operator: OperatorActor,
  submitted: readonly FoodDirectiveDraft[],
  known?: readonly Id[],
): Promise<Result<SectionSaveCounts>> => {
  if (!uuidSchema.safeParse(patientId).success) {
    return noSuchPatient();
  }
  const file = await getDatabase()
    .collection<PatientProfile>("patient_profiles")
    .findById(patientId);
  if (!file) {
    return noSuchPatient();
  }

  const drafts: FoodDirectiveDraft[] = [];
  for (const [index, row] of submitted.entries()) {
    const parsed = draftSchema.safeParse(row);
    if (!parsed.success) {
      return err(
        "invalid_input",
        `row ${index + 1}: ${parsed.error.issues[0]?.message ?? "not valid"}`,
      );
    }
    drafts.push({
      ...parsed.data,
      term: parsed.data.term.replace(/\s+/g, " ").trim(),
    });
  }
  const [fault] = foodDirectiveFaults(drafts);
  if (fault) {
    return err("invalid_input", `${fault.code}: « ${fault.term} »`);
  }

  const existing = await activeOf(patientId);
  const idByKey = new Map(
    existing.map((row) => [sameKey(row.kind, row.term), row.id]),
  );
  const plan = planSectionSave<FoodDirectiveDraft, PatientFoodDirective>({
    existing,
    groups: foodDirectiveKinds.map((kind) =>
      drafts.filter((draft) => draft.kind === kind),
    ),
    idOf: (draft) => idByKey.get(sameKey(draft.kind, draft.term)),
    known,
    changed: (draft, stored) =>
      draft.term !== stored.term ||
      draft.limitLevel !== stored.limitLevel ||
      draft.startsOn !== stored.startsOn ||
      draft.endsOn !== stored.endsOn ||
      draft.durable !== stored.durable,
  });

  const counts = countSectionPlan(plan);
  if (isEmptySave(counts)) {
    return ok(counts);
  }

  await getDatabase().transaction(async (tx) => {
    const disabledAt = new Date();
    for (const id of plan.archives) {
      await directives(tx).update(id, { disabledAt });
    }
    for (const update of plan.updates) {
      if (!update.fieldsChanged && !update.moved) {
        continue;
      }
      await directives(tx).update(update.id, {
        ...fieldsOf(update.row),
        position: update.position,
      });
    }
    for (const insert of plan.inserts) {
      await directives(tx).insert({
        patientId,
        kind: insert.row.kind,
        ...fieldsOf(insert.row),
        position: insert.position,
        disabledAt: null,
      });
    }
    await touchPatient(patientId, tx);
  });

  await recordAuditEvent({
    actor: operator,
    action: "food_directive.batch_saved",
    targetType: "patient",
    targetId: patientId,
    targetLabel: file.pseudonym,
    detail: auditDetailOf(counts, drafts),
  });
  // After the transaction, and only for a save that leaves content (D-31).
  if (counts.added > 0 || counts.updated > 0) {
    await moveToValidateAfterSave(patientId);
  }
  return ok(counts);
};

/**
 * The scoped surface (story 3, D-27). The actor comes first, and
 * `db/services/access` checks it before the body runs. A refused call answers
 * as a missing file.
 */
export const listPatientFoodDirectives = byPatient(
  "read",
  unscopedListPatientFoodDirectives,
  () => [],
);
export const listDisabledPatientFoodDirectives = byPatient(
  "read",
  unscopedListDisabledPatientFoodDirectives,
  () => [],
);
export const listPatientEvictions = byPatient(
  "read",
  unscopedListPatientEvictions,
  noSuchPatient,
);
export const savePatientFoodDirectives = byPatient(
  "write",
  unscopedSavePatientFoodDirectives,
  noSuchPatient,
);
