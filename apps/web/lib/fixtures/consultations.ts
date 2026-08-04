import type { Consultation } from "@remi/services/shared";
import { practitioner } from "./practitioner";

/**
 * Fixture data — see the note in `./practitioner.ts`.
 *
 * `notes` is kept as one verbatim write-up rather than pre-split into tidy
 * lines: the structuring step that turns it into recommendations has to stay
 * reversible, and it cannot be if the raw text was already edited on the way in.
 */
export const consultations: readonly Consultation[] = [
  {
    id: "cons_camille_jul",
    practitionerId: practitioner.id,
    personId: "per_camille",
    heldAt: new Date("2026-07-22T14:00:00Z"),
    notes: [
      "Camille, 41. Post-meal bloating for ~18 months, worse late in the day. Fragmented sleep, wakes at 3-4am.",
      "Digestive terrain first. Fermented foods daily, build up gradually. No raw vegetables in the evening.",
      "Systematic 11am dip → sweet snacking. Protein breakfast to be installed once the fermented step holds.",
      "Move off seed oils. Olive oil for cooking. Oily fish 2x/week if she takes to it.",
      "Review in 4 weeks. Do not stack changes, she judges herself hard.",
    ].join("\n"),
    planId: "plan_camille_jul",
    createdAt: new Date("2026-07-22T15:48:00Z"),
    updatedAt: new Date("2026-07-22T16:30:00Z"),
  },
  {
    id: "cons_thomas_jun",
    practitionerId: practitioner.id,
    personId: "per_thomas",
    heldAt: new Date("2026-06-03T09:30:00Z"),
    notes: [
      "Thomas, 38. Travels three days a week, eats at the wheel. Skips breakfast, big evening meal.",
      "Nothing to add before something is taken away: the point is a real lunch, sitting down.",
      "Refuses to cook. Work with what a service station actually sells.",
      "Review in six weeks. Expect gaps on travel weeks — do not treat them as failure.",
    ].join("\n"),
    planId: "plan_thomas_jun",
    createdAt: new Date("2026-06-03T10:20:00Z"),
    updatedAt: new Date("2026-06-03T10:55:00Z"),
  },
  {
    id: "cons_naima_jul",
    practitionerId: practitioner.id,
    personId: "per_naima",
    heldAt: new Date("2026-07-15T08:00:00Z"),
    notes: [
      "Naïma, 34. Bloating on office days, none at the weekend. Cooks well, shared kitchen at work.",
      "Fermented food daily — she already likes kefir, start there.",
      "Office lunches are the whole problem. Cooked vegetables from home rather than the salad bar.",
      "Shellfish allergy. Watch the fish suggestions.",
    ].join("\n"),
    planId: "plan_naima_jul",
    createdAt: new Date("2026-07-15T09:05:00Z"),
    updatedAt: new Date("2026-07-15T09:40:00Z"),
  },
];
