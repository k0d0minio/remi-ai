import type { Id, Plan, Recommendation, Step } from "@remi/services/shared";
import { plans, recommendations, steps } from "@/lib/fixtures/plan";

/** Reads for the person's surface. See the note in `./clients.ts`. */
export const getActivePlan = async (personId: Id): Promise<Plan | null> =>
  plans.find(
    (plan) => plan.personId === personId && plan.status === "published",
  ) ?? null;

export const listSteps = async (planId: Id): Promise<Step[]> =>
  steps
    .filter((step) => step.planId === planId)
    .sort((a, b) => a.order - b.order);

/**
 * The one step in flight. Only ever one — "no overhaul on day one" is a product
 * rule, so the surface asks for *the* current step rather than filtering a list
 * and hoping.
 */
export const getCurrentStep = async (planId: Id): Promise<Step | null> =>
  steps.find((step) => step.planId === planId && step.status === "current") ??
  null;

/**
 * The plan's recommendations, confirmed ones only.
 *
 * The filter belongs here rather than in a screen. An unconfirmed
 * recommendation is a draft REMI proposed and the practitioner has not signed
 * off; "nothing reaches the person until a human confirmed it" is a product
 * rule, and a rule enforced once at the seam cannot be forgotten by the next
 * surface that reads a plan.
 */
/**
 * Everything REMI structured out of a consultation, drafts included.
 *
 * The one read allowed to return `confirmed: false`, and it is the practitioner's
 * — the plan composer is where those drafts are ticked or dropped. Any read on
 * the person's side goes through `listRecommendations` below instead.
 */
export const listDraftRecommendations = async (
  consultationId: Id,
): Promise<Recommendation[]> =>
  recommendations.filter(
    (recommendation) => recommendation.consultationId === consultationId,
  );

export const listRecommendations = async (
  planId: Id,
): Promise<Recommendation[]> => {
  const plan = plans.find((candidate) => candidate.id === planId);

  if (!plan) {
    return [];
  }

  return plan.recommendationIds
    .map((id) =>
      recommendations.find((recommendation) => recommendation.id === id),
    )
    .filter(
      (recommendation): recommendation is Recommendation =>
        recommendation !== undefined && recommendation.confirmed,
    );
};
