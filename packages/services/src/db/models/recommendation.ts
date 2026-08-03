import type { Entity, Id } from "../../types";

export type RecommendationCategory =
  "nutrition" | "habit" | "supplement" | "activity" | "monitoring";

/**
 * One recommendation, structured out of a consultation's notes.
 *
 * `confirmed` is the load-bearing field: REMI may propose a structuring, but
 * nothing reaches the person until the practitioner has confirmed it. An
 * unconfirmed recommendation is a draft suggestion, never an instruction.
 */
export type Recommendation = Entity & {
  consultationId: Id;
  category: RecommendationCategory;
  title: string;
  detail: string;
  confirmed: boolean;
};
