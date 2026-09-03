import type { Entity, Id } from "../../types";

/**
 * The living summary of a patient — brainstorm § C's PATIENT_SUMMARY. The
 * synthesis Morgane re-reads first at the start of a consultation: context and
 * motif, points of vigilance, current medications, main difficulties, useful
 * habits, what is already going well, what still needs clarifying.
 *
 * One living value per patient, revised in place (owner decision #7). No
 * `archivedAt`: the consultation notes carry the history, this is the current
 * state of the file. Written by Morgane now; drafted by the AI in a later
 * round, which reads and writes `body` rather than adding a table.
 */
export type PatientSummary = Entity & {
  patientId: Id;
  body: string;
};
