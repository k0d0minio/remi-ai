import type { Id } from "../../../types";
import type { PatientCheckIns } from "../../models/patient-check-in";
import { listGoalCheckIns, listPatientGoals } from "../patient-goals";
import { listPatientRecommendations } from "../patient-recommendations";
import { listRecommendationCheckIns } from "../patient-recommendation-check-ins";

/**
 * The check-in picture for one patient, across both tables.
 *
 * The row CRUD stays with each entity's own service; what lives here is the
 * question neither of them can answer alone — "where is this person at?" —
 * which both surfaces of decision D-9 ask. The patient link's « Ma
 * progression » and the console's goals slot render the same assembly, and the
 * rotation that picks the next question reads it too, so one shape serves
 * three callers and there is no second opinion about what a subject's last
 * answer was.
 */

/**
 * Both trails for every active goal and every active recommendation.
 *
 * It reads the recommendations whole rather than pre-filtering to the
 * askable categories: the console renders a strip for anything that has
 * answers, and narrowing the set is the *rotation's* decision, made from
 * `checkInCategories` at the point the question is chosen. Filtering here
 * would hide an answer already given if Morgane later re-categorised the
 * recommendation.
 */
export const listPatientCheckIns = async (
  patientId: Id,
): Promise<PatientCheckIns> => {
  const [goals, recommendations] = await Promise.all([
    listPatientGoals(patientId),
    listPatientRecommendations(patientId),
  ]);

  const [goalTrails, recommendationTrails] = await Promise.all([
    Promise.all(
      goals.map(async (goal) => ({
        goal,
        checkIns: await listGoalCheckIns(goal.id),
      })),
    ),
    Promise.all(
      recommendations.map(async (recommendation) => ({
        recommendation,
        checkIns: await listRecommendationCheckIns(recommendation.id),
      })),
    ),
  ]);

  return { goals: goalTrails, recommendations: recommendationTrails };
};

/**
 * What a « moins bien » is waiting on: Morgane looking at it.
 *
 * Only the patient's own answers count — her consultation check-ins were never
 * waiting on her — and only until the « Vu » stamp lands. That makes the number
 * mean "you have not looked at this yet", the same thing the journal's « N
 * repas attendent un retour » means, rather than "something went badly
 * recently", which would fade on its own whether or not she ever saw it.
 */
export const countCheckInsAwaitingAttention = async (
  patientId: Id,
): Promise<number> => {
  const { goals, recommendations } = await listPatientCheckIns(patientId);

  const fromGoals = goals.flatMap((trail) =>
    trail.checkIns.filter(
      (checkIn) =>
        checkIn.writtenBy === "patient" &&
        checkIn.direction === "worse" &&
        checkIn.acknowledgedAt === null,
    ),
  );
  const fromRecommendations = recommendations.flatMap((trail) =>
    trail.checkIns.filter(
      (checkIn) =>
        checkIn.direction === "worse" && checkIn.acknowledgedAt === null,
    ),
  );

  return fromGoals.length + fromRecommendations.length;
};
