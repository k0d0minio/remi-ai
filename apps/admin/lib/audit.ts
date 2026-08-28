import {
  recordAuditEvent,
  type AuditAction,
  type Operator,
} from "@remi/services/server";
import { ensureDatabase } from "@/lib/database";

/**
 * The console's one way of writing to the audit trail.
 *
 * It exists so an action never has to assemble an actor by hand: the operator
 * it already resolved for its own guard is the actor, and forgetting a field
 * would quietly produce a row that reads as anonymous. `recordAuditEvent`
 * swallows its own failures by design — see the service — so this returns
 * nothing and no caller branches on it.
 */
export const audit = async (
  operator: Operator | null,
  action: AuditAction,
  target?: {
    type?: string;
    id?: string | null;
    /** How the target read at the time — a pseudonym, an email, a title. */
    label?: string;
    detail?: string;
  },
): Promise<void> => {
  ensureDatabase();
  await recordAuditEvent({
    actor: operator
      ? { id: operator.id, email: operator.email, name: operator.name }
      : null,
    action,
    targetType: target?.type,
    targetId: target?.id,
    targetLabel: target?.label,
    detail: target?.detail,
  });
};
