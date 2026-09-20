import type { Entity, Id } from "../../types";
import type { GoalDirection } from "./patient-goal-check-in";

/**
 * One dated answer from the patient about one non-food recommendation —
 * decision D-9's in-page check-in, the half with no console counterpart.
 *
 * It mirrors `PatientGoalCheckIn` deliberately: the same `checkedOn` calendar
 * date, the same three directions, so one strip renders both.
 *
 * Two fields are missing on purpose. There is no `measure` — the measure is
 * Morgane's field, taken in consultation, and a patient tapping a face has
 * none. And there is no `writtenBy`, because only the patient ever writes one.
 */
export type PatientRecommendationCheckIn = Entity & {
  recommendationId: Id;
  /** `YYYY-MM-DD`. */
  checkedOn: string;
  /**
   * Required, unlike a goal's: a goal check-in may carry a measure or a note
   * instead, but the face is the whole of this answer.
   */
  direction: GoalDirection;
  note: string;
  /** Set when Morgane marks a « moins bien » seen. */
  acknowledgedAt: Date | null;
};
