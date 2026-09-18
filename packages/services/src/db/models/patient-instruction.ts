import type { Entity, Id } from "../../types";

/**
 * The standing consigne Morgane steers a patient's accompaniment by —
 * brainstorm § E. "Priorité énergie et anti-inflammatoire, peu de changements
 * la première semaine."
 *
 * Two audiences, one row. `body` is § E's line, written to REMI: it steers the
 * accompaniment, it is what the AI round reads as the practitioner line, and
 * the patient never sees it. `patientBody` is the same week's consigne written
 * to the patient, and it is the one the link's home renders.
 *
 * Many rows per patient, one of them active: a replacement archives the
 * current row rather than overwriting it, so the superseded wording stays
 * readable with the date it stopped applying — and because both halves live on
 * that one row, the archive keeps the pair that was in force together.
 */
export type PatientInstruction = Entity & {
  patientId: Id;
  body: string;
  /** Null when she has written only the REMI-facing line. */
  patientBody: string | null;
  /** Set when a replacement supersedes it. Null on the one in force. */
  archivedAt: Date | null;
};
