import type { Entity, Id } from "../../types";
import type { auditActions } from "../../shared/audit";

export type AuditAction = (typeof auditActions)[number];

/**
 * One recorded operator action.
 *
 * The actor is denormalised rather than referenced: a trail whose rows vanish
 * with the account that made them cannot answer the question it exists for.
 * `targetId` is a plain string for the same reason — it may name a row that
 * has since been deleted, which is precisely the case worth recording.
 */
export type AuditEvent = Entity & {
  actorId: Id | null;
  actorEmail: string;
  actorName: string;
  action: AuditAction;
  targetType: string;
  targetId: string | null;
  /** How the target read at the time — a pseudonym, an email, a title. */
  targetLabel: string;
  detail: string;
};
