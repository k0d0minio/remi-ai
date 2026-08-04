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

/**
 * The design system's intent vocabulary, spelled locally so a fixture can carry
 * the intent a row renders with instead of every screen re-deriving it from a
 * threshold. The names are `@remi/ui`'s — `success | warning | error | info |
 * neutral` — because a demo that invents a sixth intent is a demo drifting.
 */
export type Intent = "success" | "warning" | "error" | "info" | "neutral";

export type TrendPoint = {
  /** Read out in the point's tooltip and in the table view under the chart. */
  label: string;
  value: number;
};

export type CohortWeek = {
  id: string;
  /** The axis label — abbreviated, because eight sit side by side. */
  label: string;
  /** The whole week, for the tooltip and the table view. */
  range: string;
  /** Share of the cohort's planned step-days actually applied that week. */
  adherence: number;
};

export type EngagementLevel =
  "very-engaged" | "regular" | "irregular" | "dropped" | "pending";

export type EngagementBand = {
  level: EngagementLevel;
  label: string;
  /** The rule that puts someone in the band, shown so a bar can be audited. */
  criterion: string;
  count: number;
  intent: Intent;
};

export type SuggestedAction = {
  label: string;
  /** Why this action rather than another — never "l'IA a décidé". */
  why: string;
  /** Where the action starts. A suggestion nobody can act on is a decoration. */
  href: string;
};

export type AtRiskClient = {
  /** The `Client` id when the roster holds them — the cohort is wider than it. */
  clientId: string | null;
  name: string;
  initials: string;
  adherence: number;
  /** Change in points across the eight weeks. Negative — that is the point. */
  delta: number;
  lastActive: string;
  /** The band they land in, spelled as `engagementBands` spells it. */
  band: string;
  /** Narrower than `Intent` on purpose: nobody is on this list to be praised. */
  intent: Extract<Intent, "warning" | "error">;
  trend: TrendPoint[];
  /** What the cohort read shows, one line per signal. */
  reasons: string[];
  action: SuggestedAction;
};

export type ImpactStat = {
  id: string;
  label: string;
  value: string;
  /** The signed change, with the intent its direction carries here. */
  delta: { text: string; intent: Intent } | null;
  /** What the figure is measured against. A number without it is a claim. */
  detail: string;
};

export type LabPanel = {
  id: string;
  /** The column header — abbreviated, because three sit side by side. */
  label: string;
  date: string;
  lab: string;
};

export type BiomarkerStatus = "in-range" | "below" | "above";

/** Which way it moved is not the same question as whether that is good news. */
export type BiomarkerReading = "improving" | "stable" | "worsening";

export type Biomarker = {
  id: string;
  name: string;
  unit: string;
  /** One value per panel, in `labPanels` order. */
  values: number[];
  /** Written as the lab writes it — an interval, a ceiling, or a floor. */
  range: string;
  status: BiomarkerStatus;
  reading: BiomarkerReading;
};

export type ResultDrivenStep = {
  id: string;
  /** The marker that motivated the step, spelled as the table above spells it. */
  marker: string;
  /** The measurement itself, with the panel it came from. */
  measured: string;
  /** The `Step` it became, spelled as `steps.ts` spells it — the thread back. */
  step: string;
  /** The practitioner's reasoning, in their words. */
  rationale: string;
};

/**
 * A line of a genetic report. The field names are the domain model's
 * (`GenotypeMarker` in `packages/services/src/db/models/person.ts`) so the two
 * vocabularies do not drift — but the type is declared here, because the demo is
 * lint-blocked from `@remi/services` and that guard stays.
 */
export type GenotypeMarker = {
  gene: string;
  variant: string;
  note: string;
};
