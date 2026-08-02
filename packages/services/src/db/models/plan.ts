import type { Entity, Id } from "../../types";

export type PlanStatus = "draft" | "published" | "superseded";

/**
 * The practitioner's recommendations turned into something a person can follow
 * at home. A plan is never edited in place once published — the next
 * consultation supersedes it — so the person always knows which advice is live
 * and the practitioner keeps an honest history of what they asked for and when.
 */
export type Plan = Entity & {
  personId: Id;
  practitionerId: Id;
  consultationId: Id;
  status: PlanStatus;
  publishedAt: Date | null;
  summary: string;
  recommendationIds: readonly Id[];
  stepIds: readonly Id[];
};
