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
 *
 * `system` is REMI itself, with no person behind the act: the daily
 * inactivity sweep (`inactive-account-deletion`) is the first such actor.
 */
export const auditActorKinds = ["operator", "patient", "system"] as const;

export type AuditActorKindName = (typeof auditActorKinds)[number];

export const auditActions = [
  "patient.created",
  /** A patient created their own account from a practitioner's sign-up link. */
  "patient.signed_up",
  /**
   * A patient took over a file their practitioner created
   * (`patient-takes-over-file`). The detail names the path: `activation` or
   * `claim`.
   */
  "patient.file_taken_over",
  /**
   * A sign-up found the e-mail on a file with no account, and REMI sent the
   * one-time claim link to that address.
   */
  "patient.file_claim_sent",
  /** A patient signed in. The detail names the method. */
  "patient.signed_in",
  /** A patient asked for a password reset link. */
  "patient.password_reset_requested",
  /** A patient set a new password from the reset link. */
  "patient.password_reset",
  "patient.updated",
  /** The file moved to its next status (D-31). The detail names both and why. */
  "patient.file_status_changed",
  /**
   * The file's consultation date (`consultation_date`) changed: set, changed or
   * cleared. The detail names the old and the new value (`appointment-date`).
   */
  "patient.consultation_date_changed",
  "patient.deleted",
  /**
   * The inactivity sweep sent the notice of deletion (`inactive-account-
   * deletion`). The detail names the deletion date. The deletion itself is
   * `patient.deleted` with the `system` actor and the detail `inactivity`.
   */
  "patient.inactivity_notice_sent",
  /**
   * An admin opened a file of another practitioner, read-only (story 3, D-27).
   * The detail is the reason the admin typed.
   */
  "patient.admin_opened",
  /** An admin set or cleared the retention hold that blocks that deletion. */
  "patient.retention_hold_set",
  "patient.retention_hold_cleared",
  /**
   * The practitioner validated an automatic calculation (D-30, D-32). The
   * detail is JSON: the kind, the value and the parameters used.
   */
  "calculation.validated",
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
  "nutrition_rule.created",
  "nutrition_rule.updated",
  "nutrition_rule.revised",
  "nutrition_rule.validated",
  "nutrition_rule.archived",
  "nutrition_rule.restored",
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
  /**
   * Her « vu » on a patient's lower weekly score (`check-in-and-progression`,
   * D-33). The patient's own weekly answer is `goal.checked_in` under the
   * `patient` actor, the same action her consultation check-in records.
   */
  "goal.check_in_seen",
  "instruction.updated",
  "instruction.cleared",
  /**
   * The challenge lifecycle (`challenges`). `started`, `updated` and `closed`
   * are hers; the four tap events are the patient's, recorded with the
   * `patient` actor through the link — set and cleared are separate actions so
   * the journal reads « prêt(e) pour le prochain » without opening the row.
   */
  "challenge.started",
  "challenge.updated",
  "challenge.closed",
  "challenge.acquired",
  "challenge.acquired_cleared",
  "challenge.ready_for_next",
  "challenge.ready_for_next_cleared",
  /**
   * Her documents and links on the patient's page (`patient-documents-and-
   * links`). The target label is the document's title; a removal is recorded
   * after the file has left the store, so the line never claims a deletion
   * the store refused.
   */
  "document.added",
  "document.updated",
  "document.removed",
  /**
   * The general thread (`general-feedback`). `sent` is the patient's, through
   * the link; `replied` and `marked_read` are hers — both clear the unread
   * count, so both are worth a line.
   */
  "message.sent",
  "message.replied",
  "message.marked_read",
  "summary.updated",
  "summary.cleared",
  "next_consultation_prep.updated",
  /**
   * A consent decision (`consent-texts-and-records`, D-32). One action per
   * decision so the journal filters a withdrawal without opening the row. The
   * detail names the key, the text version and the language shown.
   */
  "consent.given",
  "consent.refused",
  "consent.withdrawn",
  /**
   * The genotype emptied because the genetic consent is no longer in force
   * (`genetic-consent-and-optional-data`). The detail names the decision.
   */
  "genotype.cleared",
  /**
   * A genotype result changed (`genotype-section`). One event per field. The
   * detail names the field, never the value: the trail holds no genetic data
   * (Jamie, 2026-11-11).
   */
  "genotype.changed",
  "share_link.regenerated",
  "share_link.emailed",
  /**
   * The patient's pseudonymous context copied out of the console to be pasted
   * into a model of the operator's choosing. Health data leaving the console is
   * worth a line in the trail even when what leaves carries no real identity.
   */
  "context.exported",
  /**
   * Rows read out of one patient's record and into another's open grid
   * (`reuse-and-duplicate`). Recorded at the moment of the copy rather than at
   * the section's save: the copy is when the data crossed records, and she may
   * then abandon the grid without saving — which would otherwise leave health
   * data having moved between two patients with no trace at all. The source
   * patient is named on the event.
   */
  "protocol.copied_from_patient",
  /**
   * Her own named sets. A template holds no patient's data by the time it is
   * stored — the personal fields are blanked into the preview before she names
   * it — so inserting one records nothing; only the writes below do.
   */
  "template.saved",
  "template.overwritten",
  "template.renamed",
  "template.deleted",
  "template.shared",
  "template.unshared",
  /** Morgane marked a waiting-list row as written back to, or took the mark off. */
  "lead.contacted",
  "lead.reopened",
  "operator.invited",
  "operator.invite_revoked",
  "operator.joined",
  "operator.role_changed",
  "operator.removed",
  "operator.signed_in",
] as const;

export type AuditActionName = (typeof auditActions)[number];
