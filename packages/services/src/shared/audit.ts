/**
 * The audit vocabulary — every operator action the console records.
 *
 * A closed list rather than free-form strings: the journal filters on it, the
 * labels are keyed by it, and a typo in an action name is a row that silently
 * never appears under its own filter. Adding an action means adding it here
 * first, which is the point.
 */

export const auditActions = [
  "patient.created",
  "patient.updated",
  "patient.deleted",
  "recommendation.added",
  "recommendation.updated",
  "recommendation.archived",
  "recommendation.restored",
  "recommendation.deleted",
  "recommendation.reordered",
  "pantry.added",
  "pantry.updated",
  "pantry.archived",
  "pantry.restored",
  "pantry.deleted",
  "pantry.reordered",
  "note.added",
  "note.updated",
  "note.deleted",
  "share_link.regenerated",
  "share_link.emailed",
  "operator.invited",
  "operator.invite_revoked",
  "operator.joined",
  "operator.role_changed",
  "operator.removed",
  "operator.signed_in",
] as const;

export type AuditActionName = (typeof auditActions)[number];
