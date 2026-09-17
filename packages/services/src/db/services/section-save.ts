import type { Id } from "../../types";

/**
 * The shared half of a whole-section save.
 *
 * Three services — recommendations, supplements, pantry essentials — take the
 * same shape of write: the operator edits a whole section at once and submits
 * the rows she wants in force, in the order she wants them. What differs
 * between them is only the fields on a row; the diff against what is stored is
 * identical, so it lives here once rather than three times.
 *
 * The rule the diff encodes: **what is submitted is what is in force.** A row
 * that was active and is not submitted has been taken off the list, so it is
 * archived, never deleted — "why did we stop it" is answered by a row.
 */

/** What one save did, for the single audit event the console writes for it. */
export type SectionSaveCounts = {
  added: number;
  updated: number;
  archived: number;
  reordered: number;
};

export const noSectionChanges: SectionSaveCounts = {
  added: 0,
  updated: 0,
  archived: 0,
  reordered: 0,
};

export type SectionPlan<TRow> = {
  inserts: readonly { row: TRow; position: number }[];
  updates: readonly {
    id: Id;
    row: TRow;
    position: number;
    fieldsChanged: boolean;
    moved: boolean;
  }[];
  archives: readonly Id[];
};

type PlanArgs<TRow, TStored extends { id: Id; position: number }> = {
  /** Every row currently in force in the section, across all groups. */
  existing: readonly TStored[];
  /**
   * The submitted rows, pre-grouped by whatever owns `position`: one group per
   * category for recommendations, a single group for the two flat lists. A
   * row's rank is its index within its own group.
   */
  groups: readonly (readonly TRow[])[];
  /** A stored row's id, or `undefined` for a row the operator just added. */
  idOf: (row: TRow) => Id | undefined;
  /** Whether the submitted row says anything different from the stored one. */
  changed: (row: TRow, stored: TStored) => boolean;
  /**
   * The rows the editor was seeded with, when it can say. Only these are
   * candidates for archiving, so a row that appeared *after* the operator
   * opened the editor — through the quick-add form beside it, or another
   * operator's save — is left alone rather than silently taken off the list by
   * a save that never saw it. Omit it and every row in force is a candidate,
   * which is what a caller with no editor behind it means.
   */
  known?: readonly Id[];
};

/**
 * Diff the submitted section against what is stored, without touching the
 * database — so the whole save can be rejected on a bad row before the first
 * write, and so the counts are known before anything is applied.
 *
 * A submitted row carrying an id that is no longer in force is planned as an
 * insert rather than an error. That is the last-write-wins policy this beta
 * accepts: the other operator archived the row while this one was editing it,
 * and what she has on screen is what she means to prescribe.
 */
export const planSectionSave = <
  TRow,
  TStored extends { id: Id; position: number },
>({
  existing,
  groups,
  idOf,
  changed,
  known,
}: PlanArgs<TRow, TStored>): SectionPlan<TRow> => {
  const storedById = new Map(existing.map((stored) => [stored.id, stored]));
  const inserts: { row: TRow; position: number }[] = [];
  const updates: SectionPlan<TRow>["updates"][number][] = [];
  const kept = new Set<Id>();

  for (const group of groups) {
    for (const [position, row] of group.entries()) {
      const id = idOf(row);
      const stored = id ? storedById.get(id) : undefined;
      if (!stored) {
        inserts.push({ row, position });
        continue;
      }
      kept.add(stored.id);
      updates.push({
        id: stored.id,
        row,
        position,
        fieldsChanged: changed(row, stored),
        moved: stored.position !== position,
      });
    }
  }

  return {
    inserts,
    updates,
    archives: existing
      .filter((stored) => !kept.has(stored.id))
      .filter((stored) => known === undefined || known.includes(stored.id))
      .map((stored) => stored.id),
  };
};

/** The counts a plan will produce once applied — an untouched row counts for nothing. */
export const countSectionPlan = <TRow>(
  plan: SectionPlan<TRow>,
): SectionSaveCounts => ({
  added: plan.inserts.length,
  updated: plan.updates.filter((update) => update.fieldsChanged).length,
  archived: plan.archives.length,
  reordered: plan.updates.filter((update) => update.moved).length,
});

/** Whether a save is worth writing at all — an unchanged section touches nothing. */
export const isEmptySave = (counts: SectionSaveCounts): boolean =>
  counts.added === 0 &&
  counts.updated === 0 &&
  counts.archived === 0 &&
  counts.reordered === 0;
