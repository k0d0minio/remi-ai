import type { Entity, Id } from "../../types";
import type { Locale } from "../../shared/i18n";

/**
 * The five dimensions a plan is personalised along ("personnalisation à 360°").
 *
 * Four of them describe the person and live on their profile below. The fifth —
 * `preceptes` — is not theirs to hold: it comes from their practitioner's
 * `TherapeuticFrame`. Keeping it in the union but out of the profile is what
 * stops the person's record from ever becoming the authority on clinical intent.
 */
export type PersonalisationDimension =
  "genotype" | "preceptes" | "psychology" | "habits" | "rhythm";

export type GenotypeMarker = {
  gene: string;
  variant: string;
  note: string;
};

export type PsychologyProfile = {
  changeReadiness: "exploring" | "committed" | "struggling";
  motivators: readonly string[];
  barriers: readonly string[];
};

export type HabitsProfile = {
  dislikes: readonly string[];
  allergies: readonly string[];
  /** How many people they cook for — a plan for one is not a plan for four. */
  cooksFor: number;
  cookingConfidence: "low" | "medium" | "high";
};

export type RhythmProfile = {
  weekdayCookingMinutes: number;
  mealsOutPerWeek: number;
  /** Day name, so the shopping list can arrive before it, not after. */
  shoppingDay: string | null;
};

export type PersonalisationProfile = {
  /** Null is the normal case — most people have no genetic report. */
  genotype: readonly GenotypeMarker[] | null;
  psychology: PsychologyProfile;
  habits: HabitsProfile;
  rhythm: RhythmProfile;
};

export type PersonStatus = "invited" | "active" | "paused" | "ended";

/**
 * The person a practitioner supports. They arrive through their practitioner —
 * there is no self-serve path — so `practitionerId` is never null.
 */
export type Person = Entity & {
  practitionerId: Id;
  name: string;
  email: string;
  locale: Locale;
  status: PersonStatus;
  startedAt: Date;
  profile: PersonalisationProfile;
  nextConsultationAt: Date | null;
  lastActiveAt: Date | null;
};
