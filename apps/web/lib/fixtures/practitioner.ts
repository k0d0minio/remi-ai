import type { Practitioner, TherapeuticFrame } from "@remi/services/shared";

/**
 * Fixture data, standing in for a storage adapter that does not exist yet.
 *
 * The whole `lib/fixtures/` folder is deleted by the PR that registers the first
 * `DatabaseClient` — `CONVENTIONS.md`: superseding deletes the superseded. The
 * query layer in `lib/queries/` is the seam that makes that a one-file change.
 *
 * The practitioner and everyone on their books are invented, and every address
 * sits on a domain RFC 2606 reserves. A fixture never names a real person: the
 * activity around it is fabricated, and fabricated activity hung on a real name
 * is personal data.
 */
export const practitioner: Practitioner = {
  id: "prac_vasseur",
  name: "Dr Hélène Vasseur",
  email: "h.vasseur@cabinetvasseur.example",
  discipline: "Functional medicine",
  clinic: "Cabinet Vasseur",
  locale: "fr",
  frameId: "frame_vasseur",
  createdAt: new Date("2026-02-16T09:00:00Z"),
  updatedAt: new Date("2026-07-28T14:12:00Z"),
};

export const frame: TherapeuticFrame = {
  id: "frame_vasseur",
  practitionerId: practitioner.id,
  name: "Functional medicine — Cabinet Vasseur",
  summary:
    "Look for the causes before treating the symptoms, and change one thing at a time.",
  principles: [
    {
      id: "prin_causes",
      title: "Causes before symptoms",
      detail:
        "A suggestion addresses what is driving the problem, not the discomfort it produces.",
      active: true,
    },
    {
      id: "prin_progressive",
      title: "One change at a time",
      detail:
        "Never more than one new habit in flight. A second waits until the first holds.",
      active: true,
    },
    {
      id: "prin_terrain",
      title: "Start from the gut",
      detail:
        "Digestive terrain comes first; the rest of the plan is built on top of it.",
      active: true,
    },
    {
      id: "prin_fasting",
      title: "Intermittent fasting",
      detail:
        "Off: kept for people whose digestive terrain has already settled.",
      active: false,
    },
  ],
  excluded: [
    "Industrial seed oils",
    "Gluten-containing grains",
    "Cow's milk",
    "Artificial sweeteners",
  ],
  emphasised: [
    "Fermented foods",
    "Oily fish",
    "Cooked vegetables",
    "Olive oil",
  ],
  createdAt: new Date("2026-02-16T09:30:00Z"),
  updatedAt: new Date("2026-06-02T11:05:00Z"),
};
