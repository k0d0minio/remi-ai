import type { PatientGoal } from "./patient-goal";
import type { PatientGoalCheckIn } from "./patient-goal-check-in";
import type { PatientRecommendation } from "./patient-recommendation";
import type { PatientRecommendationCheckIn } from "./patient-recommendation-check-in";

/**
 * The check-in picture for one patient, across both tables — what the patient
 * link's « Ma progression » and the console's goals slot both render.
 *
 * The shape lives in `models/` rather than beside the service that assembles
 * it because both apps name it in their props, and `models/` is the half of
 * `db/` that `shared/` may re-export: it is types only, so the browser bundle
 * pays nothing for it.
 */

export type GoalCheckInTrail = {
  goal: PatientGoal;
  /** Newest first. */
  checkIns: readonly PatientGoalCheckIn[];
};

export type RecommendationCheckInTrail = {
  recommendation: PatientRecommendation;
  /** Newest first. */
  checkIns: readonly PatientRecommendationCheckIn[];
};

export type PatientCheckIns = {
  goals: readonly GoalCheckInTrail[];
  recommendations: readonly RecommendationCheckInTrail[];
};
