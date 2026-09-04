import type { Entity, Id } from "../../types";

/**
 * One of the two or three things a patient is working on — brainstorm § D.
 *
 * The goal in Morgane's words, its rank in her priority order, and an optional
 * starting point to compare later check-ins against. Archiving is how a goal
 * leaves the list: the trail of what was worked on and when is the record.
 *
 * The "2-3 active maximum" § D states is the service's rule rather than the
 * type's — a cap is a count, and counting is what a service does.
 */
export type PatientGoal = Entity & {
  patientId: Id;
  /** As she says it — "améliorer l'énergie". */
  title: string;
  /** The simple starting point, free text: "énergie 3/10". */
  baseline: string;
  /** Rank within the active list, ascending. */
  position: number;
  /** Set when the goal leaves the list without leaving the record. */
  archivedAt: Date | null;
};
