import type { Entity, Id } from "../../types";

/**
 * A consultation as it already happens today — REMI changes nothing about it.
 * `notes` is the practitioner's raw write-up, the input to "from notes to a
 * clear plan"; it is kept verbatim so the structuring step is always reversible.
 */
export type Consultation = Entity & {
  practitionerId: Id;
  personId: Id;
  heldAt: Date;
  notes: string;
  /** The plan produced from this consultation, once one has been published. */
  planId: Id | null;
};
