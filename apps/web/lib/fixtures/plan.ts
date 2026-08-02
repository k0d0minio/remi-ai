import type { Plan, Step } from "@remi/services/shared";
import { practitioner } from "./practitioner";

/** Fixture data — see the note in `./practitioner.ts`. */
export const plans: readonly Plan[] = [
  {
    id: "plan_camille_jul",
    personId: "per_camille",
    practitionerId: practitioner.id,
    consultationId: "cons_camille_jul",
    status: "published",
    publishedAt: new Date("2026-07-22T16:30:00Z"),
    summary:
      "Settle the digestive terrain first, then rebuild steady energy across the day.",
    recommendationIds: ["rec_ferment", "rec_breakfast", "rec_oils"],
    stepIds: ["step_ferment", "step_breakfast", "step_oils"],
    createdAt: new Date("2026-07-22T16:05:00Z"),
    updatedAt: new Date("2026-07-22T16:30:00Z"),
  },
];

export const steps: readonly Step[] = [
  {
    id: "step_ferment",
    planId: "plan_camille_jul",
    personId: "per_camille",
    order: 1,
    title: "One fermented food a day",
    why: "Your practitioner wants to settle digestion before anything else changes.",
    recommendationId: "rec_ferment",
    status: "done",
    startsOn: new Date("2026-07-23T00:00:00Z"),
    completedDays: 14,
    targetDays: 14,
    createdAt: new Date("2026-07-22T16:30:00Z"),
    updatedAt: new Date("2026-08-01T19:42:00Z"),
  },
  {
    id: "step_breakfast",
    planId: "plan_camille_jul",
    personId: "per_camille",
    order: 2,
    title: "Protein at breakfast, five mornings a week",
    why: "To stop the 11am dip that sends you looking for something sweet.",
    recommendationId: "rec_breakfast",
    status: "current",
    startsOn: new Date("2026-08-06T00:00:00Z"),
    completedDays: 4,
    targetDays: 14,
    createdAt: new Date("2026-07-22T16:30:00Z"),
    updatedAt: new Date("2026-08-01T19:42:00Z"),
  },
  {
    id: "step_oils",
    planId: "plan_camille_jul",
    personId: "per_camille",
    order: 3,
    title: "Swap the cooking oil for olive oil",
    why: "One of the seed oils your practitioner asked you to move away from.",
    recommendationId: "rec_oils",
    status: "upcoming",
    startsOn: null,
    completedDays: 0,
    targetDays: 14,
    createdAt: new Date("2026-07-22T16:30:00Z"),
    updatedAt: new Date("2026-07-22T16:30:00Z"),
  },
];
