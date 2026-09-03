import type { Entity, Id } from "../../types";

/**
 * One supplement Morgane prescribes into a patient's protocol — brainstorm § G,
 * as structured text rather than prose.
 *
 * The shape follows `PatientRecommendation` minus the category: § G is one flat
 * ordered list, not category-grouped. `name` is the only required field; `dose`,
 * `timing` and `reason` are § G's other three columns and default to empty. What
 * the patient already takes outside the protocol stays prose in the profile's
 * `supplements` field — a different fact, a different home.
 */
export type PatientSupplement = Entity & {
  patientId: Id;
  name: string;
  dose: string;
  timing: string;
  reason: string;
  /** Rank within the patient's protocol, ascending. */
  position: number;
  /** Set when the entry leaves the active protocol without leaving the record. */
  archivedAt: Date | null;
};
