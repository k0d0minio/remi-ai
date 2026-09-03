import type { Entity, Id } from "../../types";

/**
 * The standing consigne Morgane steers a patient's accompaniment by —
 * brainstorm § E. "Priorité énergie et anti-inflammatoire, peu de changements
 * la première semaine."
 *
 * Many rows per patient, one of them active: a replacement archives the
 * current row rather than overwriting it, so the superseded wording stays
 * readable with the date it stopped applying.
 */
export type PatientInstruction = Entity & {
  patientId: Id;
  body: string;
  /** Set when a replacement supersedes it. Null on the one in force. */
  archivedAt: Date | null;
};
