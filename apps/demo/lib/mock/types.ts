/**
 * The shapes these prototypes render.
 *
 * They are deliberately local and deliberately view-shaped. `apps/demo` is
 * lint-blocked from `@remi/services` — that is one of the three guards that keep
 * it a sandbox — so it cannot import the real domain models, and it should not:
 * a prototype is exploring what a screen needs, not committing to a schema. When
 * a design graduates to `apps/web`, the real model in
 * `packages/services/src/db/models/` is what it is written against.
 */

export type Readiness = "exploring" | "committed" | "struggling";

export type ClientStatus = "invited" | "active" | "paused";

export type Client = {
  id: string;
  name: string;
  initials: string;
  status: ClientStatus;
  readiness: Readiness;
  /** Percentage of the current step's target days actually applied. */
  adherence: number;
  since: string;
  nextConsultation: string;
  lastActive: string;
  currentStep: string;
  /** The one thing the practitioner should notice before the next session. */
  attention: string | null;
};

export type Dimension = {
  key: "genotype" | "preceptes" | "psychology" | "habits" | "rhythm";
  label: string;
  source: string;
  points: string[];
};

export type Signal = {
  id: string;
  clientName: string;
  kind: "adherence" | "difficulty" | "engagement" | "win";
  severity: "positive" | "neutral" | "attention";
  when: string;
  summary: string;
};

export type NoteBlock = {
  id: string;
  text: string;
};

export type DraftRecommendation = {
  id: string;
  category: "nutrition" | "habit" | "supplement" | "activity" | "monitoring";
  title: string;
  detail: string;
  /** Which raw note it was drawn from — the thread back to the practitioner. */
  fromNoteId: string;
  confirmed: boolean;
};

export type Step = {
  id: string;
  order: number;
  title: string;
  why: string;
  status: "upcoming" | "current" | "done" | "skipped";
  completedDays: number;
  targetDays: number;
};

export type Ingredient = {
  name: string;
  quantity: string;
  aisle: string;
};

export type Recipe = {
  id: string;
  title: string;
  summary: string;
  minutes: number;
  servings: number;
  slot: "petit-déjeuner" | "déjeuner" | "dîner";
  day: string;
  honours: string[];
  ingredients: Ingredient[];
  method: string[];
};

export type FramePrinciple = {
  id: string;
  title: string;
  detail: string;
  active: boolean;
};
