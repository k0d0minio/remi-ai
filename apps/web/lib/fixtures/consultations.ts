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
];
