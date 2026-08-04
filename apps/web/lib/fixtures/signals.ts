import type { ProgressSignal } from "@remi/services/shared";

/**
 * Fixture data — see the note in `./practitioner.ts`.
 *
 * What flows back up the loop between two consultations. Deliberately mixed:
 * two people are struggling, one has not accepted an invitation, and one is
 * doing well. A feed that only carried bad news would be as useless as one that
 * only carried good news — the practitioner needs to see the shape of the week.
 */
export const signals: readonly ProgressSignal[] = [
  {
    id: "sig_thomas_silence",
    personId: "per_thomas",
    kind: "adherence",
    severity: "attention",
    observedAt: new Date("2026-07-25T09:00:00Z"),
    summary:
      "Nothing applied since 24 July. Three days of travel over the period.",
    sourceId: "step_thomas_lunch",
    createdAt: new Date("2026-07-25T09:00:00Z"),
    updatedAt: new Date("2026-07-25T09:00:00Z"),
  },
  {
    id: "sig_naima_bloating",
    personId: "per_naima",
    kind: "difficulty",
    severity: "attention",
    observedAt: new Date("2026-08-01T18:20:00Z"),
    summary:
      "Bloating reported three times, always on the days she eats at the office.",
    sourceId: null,
    createdAt: new Date("2026-08-01T18:20:00Z"),
    updatedAt: new Date("2026-08-01T18:20:00Z"),
  },
  {
    id: "sig_pierre_invitation",
    personId: "per_pierre",
    kind: "engagement",
    severity: "attention",
    observedAt: new Date("2026-07-30T16:05:00Z"),
    summary: "Invitation sent three days ago, not yet accepted.",
    sourceId: null,
    createdAt: new Date("2026-07-30T16:05:00Z"),
    updatedAt: new Date("2026-07-30T16:05:00Z"),
  },
  {
    id: "sig_camille_streak",
    personId: "per_camille",
    kind: "win",
    severity: "positive",
    observedAt: new Date("2026-08-02T20:10:00Z"),
    summary:
      "Fourteen days in a row on the fermented-food step. Step held, and she said so herself.",
    sourceId: "step_ferment",
    createdAt: new Date("2026-08-02T20:10:00Z"),
    updatedAt: new Date("2026-08-02T20:10:00Z"),
  },
  {
    id: "sig_camille_breakfast",
    personId: "per_camille",
    kind: "adherence",
    severity: "positive",
    observedAt: new Date("2026-08-02T20:12:00Z"),
    summary: "New step under way: 4 mornings out of 14 already applied.",
    sourceId: "step_breakfast",
    createdAt: new Date("2026-08-02T20:12:00Z"),
    updatedAt: new Date("2026-08-02T20:12:00Z"),
  },
  {
    id: "sig_naima_kefir",
    personId: "per_naima",
    kind: "win",
    severity: "positive",
    observedAt: new Date("2026-07-28T07:40:00Z"),
    summary: "Kefir every morning for nine days, without a reminder.",
    sourceId: "step_naima_ferment",
    createdAt: new Date("2026-07-28T07:40:00Z"),
    updatedAt: new Date("2026-07-28T07:40:00Z"),
  },
];
