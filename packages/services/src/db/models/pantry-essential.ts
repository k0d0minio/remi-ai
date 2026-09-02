import type { Entity, Id } from "../../types";

/**
 * One food on a patient's placard/frigo list — brainstorm § H.
 *
 * A name and a why, and deliberately nothing else: § H warns that per-item
 * quantity, season and nutrient fields turn a list Morgane can write during a
 * consultation into a form she stops filling in. The absence of those fields
 * is the specification.
 *
 * The list is flat. Placard vs frigo is how § H frames the idea, not how it
 * stores it, and whether Morgane thinks in sections is hers to answer — so no
 * grouping is invented here.
 */
export type PantryEssential = Entity & {
  patientId: Id;
  /** The food, as she writes it. */
  item: string;
  /** Why it is on this patient's list, in one short line. */
  why: string;
  /** Rank within the active list, ascending. */
  position: number;
  /** Set when the item drops off the list without leaving the record. */
  archivedAt: Date | null;
};
