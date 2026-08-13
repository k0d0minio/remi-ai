import type { Person } from "@remi/services/shared";
import { practitioner } from "./practitioner";

/** Fixture data — see the note in `./practitioner.ts`. */
export const people: readonly Person[] = [
  {
    id: "per_camille",
    practitionerId: practitioner.id,
    name: "Camille Dubois",
    email: "camille.dubois@example.com",
    locale: "fr",
    status: "active",
    startedAt: new Date("2026-05-12T00:00:00Z"),
    profile: {
      genotype: [
        {
          gene: "MTHFR",
          variant: "C677T heterozygous",
          note: "Favour folate-rich vegetables.",
        },
      ],
      psychology: {
        changeReadiness: "committed",
        motivators: ["Sleeping through the night", "Keeping up with her sons"],
        barriers: ["Evenings run late", "Cooks for four"],
      },
      habits: {
        dislikes: ["Liver", "Anchovies"],
        allergies: ["Walnuts"],
        cooksFor: 4,
        cookingConfidence: "medium",
      },
      rhythm: {
        weekdayCookingMinutes: 30,
        mealsOutPerWeek: 2,
        shoppingDay: "Saturday",
      },
    },
    nextConsultationAt: new Date("2026-08-19T10:00:00Z"),
    lastActiveAt: new Date("2026-08-01T19:42:00Z"),
    createdAt: new Date("2026-05-12T08:15:00Z"),
    updatedAt: new Date("2026-08-01T19:42:00Z"),
  },
  {
    id: "per_thomas",
    practitionerId: practitioner.id,
    name: "Thomas Lemaire",
    email: "t.lemaire@example.com",
    locale: "fr",
    status: "active",
    startedAt: new Date("2026-06-03T00:00:00Z"),
    profile: {
      genotype: null,
      psychology: {
        changeReadiness: "struggling",
        motivators: ["Getting back on the bike"],
        barriers: ["Travels three days a week", "Skips breakfast"],
      },
      habits: {
        dislikes: ["Cooked fish"],
        allergies: [],
        cooksFor: 1,
        cookingConfidence: "low",
      },
      rhythm: {
        weekdayCookingMinutes: 15,
        mealsOutPerWeek: 6,
        shoppingDay: null,
      },
    },
    nextConsultationAt: new Date("2026-08-11T14:30:00Z"),
    lastActiveAt: new Date("2026-07-24T08:03:00Z"),
    createdAt: new Date("2026-06-03T10:40:00Z"),
    updatedAt: new Date("2026-07-24T08:03:00Z"),
  },
  {
    id: "per_naima",
    practitionerId: practitioner.id,
    name: "Naïma Benali",
    email: "naima.benali@example.com",
    locale: "fr",
    status: "active",
    startedAt: new Date("2026-04-21T00:00:00Z"),
    profile: {
      genotype: null,
      psychology: {
        changeReadiness: "exploring",
        motivators: ["Less bloating", "More steady energy"],
        barriers: ["Shared kitchen at work"],
      },
      habits: {
        dislikes: ["Goat cheese"],
        allergies: ["Shellfish"],
        cooksFor: 2,
        cookingConfidence: "high",
      },
      rhythm: {
        weekdayCookingMinutes: 45,
        mealsOutPerWeek: 1,
        shoppingDay: "Sunday",
      },
    },
    nextConsultationAt: new Date("2026-09-02T09:00:00Z"),
    lastActiveAt: new Date("2026-08-02T07:15:00Z"),
    createdAt: new Date("2026-04-21T13:22:00Z"),
    updatedAt: new Date("2026-08-02T07:15:00Z"),
  },
  {
    id: "per_pierre",
    practitionerId: practitioner.id,
    name: "Pierre Janssens",
    email: "p.janssens@example.com",
    locale: "fr",
    status: "invited",
    startedAt: new Date("2026-07-30T00:00:00Z"),
    profile: {
      genotype: null,
      psychology: {
        changeReadiness: "exploring",
        motivators: [],
        barriers: [],
      },
      habits: {
        dislikes: [],
        allergies: [],
        cooksFor: 2,
        cookingConfidence: "medium",
      },
      rhythm: {
        weekdayCookingMinutes: 25,
        mealsOutPerWeek: 3,
        shoppingDay: null,
      },
    },
    nextConsultationAt: new Date("2026-08-14T11:00:00Z"),
    lastActiveAt: null,
    createdAt: new Date("2026-07-30T16:05:00Z"),
    updatedAt: new Date("2026-07-30T16:05:00Z"),
  },
];
