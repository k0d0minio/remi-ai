import type { Entity, Id } from "../../types";
import type { goalDirections } from "../../shared/patient";

/** How a goal moved since the last check-in — § D's mieux / stable / moins bien. */
export type GoalDirection = (typeof goalDirections)[number];

/**
 * One dated observation against one goal — the manual seed of § D's evolution
 * trail, and the row the later AI round drafts into.
 *
 * `checkedOn` is a plain calendar date (`YYYY-MM-DD`), not an instant: the day
 * of a follow-up has no timezone.
 *
 * `direction` and `measure` are alternatives in § D rather than a pair, so both
 * are optional and the service requires only that one of the three carries
 * something — a dated row saying nothing records nothing.
 */
export type PatientGoalCheckIn = Entity & {
  goalId: Id;
  /** `YYYY-MM-DD`. */
  checkedOn: string;
  direction: GoalDirection | null;
  /** The simple measure on the day — "4/10". Free text, never a scale. */
  measure: string;
  note: string;
};
