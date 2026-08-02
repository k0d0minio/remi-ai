import type { Entity, Id } from "../../types";

export type SignalKind = "adherence" | "difficulty" | "engagement" | "win";

/**
 * `positive | neutral | attention` rather than the design system's intent
 * vocabulary: what a signal *means* is a domain fact, how it is coloured is the
 * surface's decision. Mapping one to the other is the UI's job.
 */
export type SignalSeverity = "positive" | "neutral" | "attention";

/**
 * What flows back up the loop. This is the answer to "then you go blind" — the
 * practitioner sees progress, sticking points and engagement between sessions,
 * so the next consultation starts from evidence instead of recall.
 */
export type ProgressSignal = Entity & {
  personId: Id;
  kind: SignalKind;
  severity: SignalSeverity;
  observedAt: Date;
  summary: string;
  /** What it came from — a step, a meal — when the signal is traceable to one. */
  sourceId: Id | null;
};
