import type { Id, Plan, Step } from "@remi/services/shared";
import { plans, steps } from "@/lib/fixtures/plan";

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
