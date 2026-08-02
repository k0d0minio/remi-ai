import type { Entity, Id } from "../../types";

export type StepStatus = "upcoming" | "current" | "done" | "skipped";

/**
 * One small change, in order. The product's whole habit thesis is that only one
 * step is `current` at a time — "no overhaul on day one" — so `order` is what
 * the surface reads from, and a step that is struggling holds the queue rather
 * than being buried under the next four.
 */
export type Step = Entity & {
  planId: Id;
  personId: Id;
  order: number;
  title: string;
  /** Why this step, in the person's terms — the thread back to the consultation. */
  why: string;
  recommendationId: Id | null;
  status: StepStatus;
  startsOn: Date | null;
  completedDays: number;
  targetDays: number;
};
