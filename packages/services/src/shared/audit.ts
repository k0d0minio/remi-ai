/**
 * The audit vocabulary — every operator action the console records.
 *
 * A closed list rather than free-form strings: the journal filters on it, the
 * labels are keyed by it, and a typo in an action name is a row that silently
 * never appears under its own filter. Adding an action means adding it here
 * first, which is the point.
 */

/**
 * Who took the action. `operator` is Morgane or a founder in the console, and
 * was the only possibility until the patient link began accepting writes
 * (`link-writes`): a patient holding their token is an actor with no account,
 * so the trail records the kind explicitly rather than leaving it inferred
 * from an empty email — an empty email is also what a system write would
 * leave, and "nobody" and "the patient" are not the same answer.
 */
export const auditActorKinds = ["operator", "patient"] as const;

export type AuditActorKindName = (typeof auditActorKinds)[number];

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
  "recommendation.batch_saved",
  "supplement.added",
  "supplement.updated",
  "supplement.archived",
  "supplement.restored",
  "supplement.deleted",
  "supplement.reordered",
  "supplement.batch_saved",
  "pantry.added",
  "pantry.updated",
  "pantry.archived",
  "pantry.restored",
  "pantry.deleted",
  "pantry.reordered",
  "pantry.batch_saved",
  "recipe.created",
  "recipe.updated",
  "recipe.archived",
  "recipe.restored",
  "recipe.assigned",
  "recipe.created_and_assigned",
  "recipe.duplicated_as_variant",
  "recipe.assigned_bulk",
  "recipe.assignment_updated",
  "recipe.assignment_archived",
  "recipe.assignment_restored",
  "recipe.assignment_removed",
  "meal.logged",
  "meal.updated",
  "meal.feedback_written",
  "meal.feedback_cleared",
  "meal.archived",
  "meal.restored",
  "meal.deleted",
  "observation.added",
  "observation.updated",
  "observation.archived",
  "observation.restored",
  "observation.deleted",
  "consultation.recorded",
  "note.added",
  "note.updated",
  "note.deleted",
  "anamnesis.updated",
  "goal.added",
  "goal.updated",
  "goal.archived",
  "goal.restored",
  "goal.deleted",
  "goal.reordered",
  "goal.checked_in",
  "goal.check_in_updated",
  "goal.check_in_deleted",
  "instruction.updated",
  "instruction.cleared",
  "summary.updated",
  "summary.cleared",
  "next_consultation_prep.updated",
  "share_link.regenerated",
  "share_link.emailed",
  /**
   * The patient's pseudonymous context copied out of the console to be pasted
   * into a model of the operator's choosing. Health data leaving the console is
   * worth a line in the trail even when what leaves carries no real identity.
   */
  "context.exported",
  "operator.invited",
  "operator.invite_revoked",
  "operator.joined",
  "operator.role_changed",
  "operator.removed",
  "operator.signed_in",
] as const;

export type AuditActionName = (typeof auditActions)[number];
