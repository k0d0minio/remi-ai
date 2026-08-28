import type { Entity, Id } from "../../types";

/**
 * One dated note per consultation — the working record behind a profile.
 *
 * Never reaches the patient link. `occurredAt` is the consultation's date, not
 * the moment the note was typed, because Morgane writes them up afterwards and
 * the timeline has to read in the order the consultations happened.
 */
export type PatientNote = Entity & {
  patientId: Id;
  /** `YYYY-MM-DD` — the day of the consultation. */
  occurredAt: string;
  title: string;
  body: string;
  /** Denormalised: the note outlives the account that wrote it. */
  authorName: string;
};
