import { auditActions } from "../../../shared/audit";
import type { Id } from "../../../types";
import { getDatabase } from "../../client";
import type { AuditAction, AuditEvent } from "../../models/audit-event";

/**
 * The audit trail — `apps/admin/AGENTS.md`'s "an admin action with no trace is
 * how an incident becomes unexplainable", made into a table.
 *
 * Recording never throws and never returns a `Result`. A trail that can fail a
 * user's action is a trail that gets removed from the hot path the first time
 * it does; the failure goes to the log instead, where it is a deployment
 * problem rather than a lost patient edit. The trade is deliberate: this
 * records what happened, it does not gate it.
 */

const events = () => getDatabase().collection<AuditEvent>("audit_events");

export type AuditActor = {
  id: Id;
  email: string;
  name: string;
};

export type AuditRecord = {
  actor: AuditActor | null;
  action: AuditAction;
  targetType?: string;
  targetId?: string | null;
  /** How the target read at the time — a pseudonym, an email, a title. */
  targetLabel?: string;
  detail?: string;
};

export const recordAuditEvent = async (record: AuditRecord): Promise<void> => {
  if (!auditActions.includes(record.action)) {
    return;
  }
  try {
    await events().insert({
      actorId: record.actor?.id ?? null,
      actorEmail: record.actor?.email ?? "",
      actorName: record.actor?.name ?? "",
      action: record.action,
      targetType: record.targetType ?? "",
      targetId: record.targetId ?? null,
      targetLabel: record.targetLabel ?? "",
      detail: record.detail ?? "",
    });
  } catch (cause) {
    console.error("[audit] failed to record an operator action", {
      action: record.action,
      cause,
    });
  }
};

export type AuditQuery = {
  action?: AuditAction | "all";
  /** Everything an operator did, by their account id. */
  actorId?: Id;
  targetId?: string;
  limit?: number;
};

/** Newest first — a journal is read from the top. */
export const listAuditEvents = async (
  query: AuditQuery = {},
): Promise<readonly AuditEvent[]> => {
  const limit = Math.min(Math.max(query.limit ?? 100, 1), 500);
  // Filtered in memory for the same reason the roster is: the seam does exact
  // match only, and the journal is read at a scale where that is honest.
  const page = await events().findMany({}, { limit: 500 });
  return page.items
    .filter((event) =>
      query.action && query.action !== "all"
        ? event.action === query.action
        : true,
    )
    .filter((event) => (query.actorId ? event.actorId === query.actorId : true))
    .filter((event) =>
      query.targetId ? event.targetId === query.targetId : true,
    )
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, limit);
};
