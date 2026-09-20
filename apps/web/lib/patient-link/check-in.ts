import {
  awaitsCheckInOn,
  firstRecommendationPerCategory,
  isCheckInCategory,
  orderCheckInRotation,
  todayAtPractice,
  type CheckInCategory,
} from "@remi/services/shared";
import type { PatientLinkData } from "./load";

/**
 * Turning the patient's record into the rotation the home asks from.
 *
 * The *rule* — least-recently-answered first, one answer a calendar day —
 * lives in `@remi/services/shared`, where it is tested against the acceptance
 * criteria and where the console could read it too. What is here is the
 * assembly: which rows count as subjects, and what each one's question is
 * asked about.
 */

/** One thing the prompt can ask about, ready to render. */
export type CheckInPromptSubject = {
  id: string;
  kind: "goal" | "recommendation";
  /** The goal's or the recommendation's own words — never authored per patient. */
  title: string;
  /** Null for a goal; the category is what picks a recommendation's verb. */
  category: CheckInCategory | null;
};

/**
 * The rotation, in the order it will be asked.
 *
 * Goals first, then the first active recommendation of each askable category —
 * that is the caller's order, and it only decides ties: a subject answered
 * longer ago always leads, whichever kind it is.
 *
 * `nutrition` and `supplement` recommendations never enter: the meal loop and
 * the compléments segment already carry those, and `checkInCategories` is the
 * one place that set is written down.
 */
export const checkInRotation = (
  data: PatientLinkData,
): readonly CheckInPromptSubject[] => {
  const goals = data.goals.map((goal) => ({
    id: goal.id,
    kind: "goal" as const,
    title: goal.title,
    category: null,
    lastAnsweredOn: lastGoalAnswer(data.checkIns.goals, goal.id),
  }));

  const askable = firstRecommendationPerCategory(
    data.recommendations.filter((recommendation) =>
      isCheckInCategory(recommendation.category),
    ),
  );
  const recommendations = askable.flatMap((recommendation) =>
    isCheckInCategory(recommendation.category)
      ? [
          {
            id: recommendation.id,
            kind: "recommendation" as const,
            title: recommendation.title,
            category: recommendation.category,
            lastAnsweredOn: lastRecommendationAnswer(
              data.checkIns.recommendations,
              recommendation.id,
            ),
          },
        ]
      : [],
  );

  return orderCheckInRotation([...goals, ...recommendations]).map(
    ({ id, kind, title, category }) => ({ id, kind, title, category }),
  );
};

/**
 * Whether the home asks at all today.
 *
 * Computed here, at render, from dates already loaded — there is no scheduler
 * and nothing to poll, which is the whole of decision D-9's "in-page, no
 * outbound channel".
 */
export const awaitsCheckIn = (data: PatientLinkData): boolean =>
  awaitsCheckInOn(
    [
      ...data.checkIns.goals.map((trail) => ({
        id: trail.goal.id,
        kind: "goal" as const,
        lastAnsweredOn: trail.checkIns[0]?.checkedOn ?? null,
      })),
      ...data.checkIns.recommendations.map((trail) => ({
        id: trail.recommendation.id,
        kind: "recommendation" as const,
        lastAnsweredOn: trail.checkIns[0]?.checkedOn ?? null,
      })),
    ],
    todayAtPractice(),
  ) && checkInRotation(data).length > 0;

/**
 * The day a subject was last answered — each trail is newest first, so the head
 * is the answer, and a subject with no answers yet is a real state rather than
 * a missing row.
 *
 * Two lookups rather than one generic one: the two trails are keyed by
 * different parents, and the type is what keeps a goal's id from being looked
 * up among the recommendations.
 */
const lastGoalAnswer = (
  trails: PatientLinkData["checkIns"]["goals"],
  goalId: string,
): string | null =>
  trails.find((trail) => trail.goal.id === goalId)?.checkIns[0]?.checkedOn ??
  null;

const lastRecommendationAnswer = (
  trails: PatientLinkData["checkIns"]["recommendations"],
  recommendationId: string,
): string | null =>
  trails.find((trail) => trail.recommendation.id === recommendationId)
    ?.checkIns[0]?.checkedOn ?? null;
