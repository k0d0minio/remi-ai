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

export type MessageAuthor = "practitioner" | "person";

export type Message = {
  id: string;
  author: MessageAuthor;
  /** The day separator this message sits under, already written for display. */
  day: string;
  time: string;
  body: string;
};

export type Conversation = {
  id: string;
  /** The `Client` this thread belongs to — the roster is the source of truth. */
  clientId: string;
  clientName: string;
  /** How the practitioner addresses them in the thread — a bubble is not a row. */
  firstName: string;
  initials: string;
  /** What the exchange is about, so a list of threads reads clinically. */
  subject: string;
  lastAt: string;
  /** Unread from the practitioner's side. */
  unread: number;
  messages: Message[];
};

export type QuickReply = {
  id: string;
  label: string;
  /** What the chip drops into the composer. Nothing is sent by clicking it. */
  text: string;
};

export type MealSlot = "petit-déjeuner" | "déjeuner" | "collation" | "dîner";

/**
 * Which styled tile stands in for the photo. The demo ships no binary images —
 * a prototype that needs a photographer before it can be reviewed is a
 * prototype nobody reviews — so the tile is drawn from tokens and the tone says
 * what kind of plate it was.
 */
export type PhotoTone = "greens" | "protein" | "grains" | "fruit" | "sweet";

/**
 * `matches` is a tick against a recommendation; `discuss` is a question for the
 * next consultation. Deliberately not "écart" or "erreur" — REMI does not grade
 * a plate, it flags what the practitioner may want to look at.
 */
export type RecognitionVerdict = "matches" | "discuss";

export type Recognition = {
  /** Spelled as the recommendation is in `plan.ts` — the thread back. */
  recommendation: string;
  verdict: RecognitionVerdict;
  detail: string;
};

export type JournalEntry = {
  id: string;
  /** The day separator this entry sits under, already written for display. */
  day: string;
  time: string;
  slot: MealSlot;
  photoTone: PhotoTone;
  /** What the recognition returned, as the sentence the person reads. */
  identified: string;
  items: string[];
  /** How sure the recognition is, 0–100. Always shown, never rounded away. */
  confidence: number;
  recognitions: Recognition[];
  /** What she typed under the photo, when she did. */
  note: string | null;
};

export type RecapSectionKind = "went-well" | "was-hard" | "suggestion";

export type RecapSection = {
  kind: RecapSectionKind;
  title: string;
  body: string;
  points: string[];
};

export type AdherencePoint = {
  day: string;
  /** The axis label — abbreviated, because the sparkline is 240px wide. */
  label: string;
  /** Percentage of the day's plan applied. */
  value: number;
};

export type Recap = {
  id: string;
  weekLabel: string;
  preparedOn: string;
  /** A recap is a draft until the practitioner has read it. Never auto-sent. */
  reviewStatus: "awaiting-review" | "reviewed";
  opening: string;
  sections: RecapSection[];
  adherence: AdherencePoint[];
  /** Average of `adherence`, written out rather than recomputed per screen. */
  adherenceAverage: number;
  /** Change in points against the previous week — the delta on the stat tile. */
  adherenceDelta: number;
  closing: string;
};
