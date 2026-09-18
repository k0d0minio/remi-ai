import { auditActions } from "../../../shared/audit";
import type { Id } from "../../../types";
import { getDatabase } from "../../client";
import type {
  AuditAction,
  AuditActorKind,
  AuditEvent,
} from "../../models/audit-event";

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

/** An operator in the console — the only actor the trail had until `link-writes`. */
export type OperatorActor = {
  id: Id;
  email: string;
  name: string;
};

/**
 * A patient writing through their own link. No email, because there is no
 * account to have one: inventing an address to fill the column would be a lie
 * the trail could never correct. The name is the pseudonym as it read at the
 * time, denormalised like every other actor here so the row survives the
 * profile's deletion.
 */
export type PatientActor = {
  kind: "patient";
  id: Id;
  name: string;
};

export type AuditActor = OperatorActor | PatientActor;

const kindOf = (actor: AuditActor | null): AuditActorKind =>
  actor && "kind" in actor ? actor.kind : "operator";

const emailOf = (actor: AuditActor | null): string =>
  actor && "kind" in actor ? "" : (actor?.email ?? "");

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
      actorKind: kindOf(record.actor),
      actorId: record.actor?.id ?? null,
      actorEmail: emailOf(record.actor),
      actorName: record.actor?.name ?? "",
      action: record.action,
      targetType: record.targetType ?? "",
      targetId: record.targetId ?? null,
      targetLabel: record.targetLabel ?? "",
      detail: record.detail ?? "",
    });
  } catch (cause) {
    console.error("[audit] failed to record an action", {
      action: record.action,
      cause,
    });
  }
};

export type AuditQuery = {
  action?: AuditAction | "all";
  /** Everything one actor did, by their account or patient id. */
  actorId?: Id;
  /** Everything one kind of actor did — every patient write, say. */
  actorKind?: AuditActorKind;
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
      query.actorKind ? event.actorKind === query.actorKind : true,
    )
    .filter((event) =>
      query.targetId ? event.targetId === query.targetId : true,
    )
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, limit);
};
