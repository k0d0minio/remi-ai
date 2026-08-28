import type { AuditActionName } from "@remi/services/shared";
import type { Intent } from "@remi/ui/server";

/**
 * How each recorded action reads, and how loudly.
 *
 * A closed map keyed by the service's action vocabulary: adding an action there
 * without adding it here is a type error, which is the point — a journal row
 * rendering as a raw `patient.deleted` is a row nobody reads.
 */

export const actionLabels: Record<AuditActionName, string> = {
  "patient.created": "profil créé",
  "patient.updated": "profil modifié",
  "patient.deleted": "profil supprimé",
  "recommendation.added": "recommandation ajoutée",
  "recommendation.updated": "recommandation modifiée",
  "recommendation.archived": "recommandation archivée",
  "recommendation.restored": "recommandation réactivée",
  "recommendation.deleted": "recommandation supprimée",
  "recommendation.reordered": "recommandations réordonnées",
  "note.added": "note ajoutée",
  "note.updated": "note modifiée",
  "note.deleted": "note supprimée",
  "share_link.regenerated": "lien patient régénéré",
  "share_link.emailed": "lien patient envoyé",
  "operator.invited": "invitation envoyée",
  "operator.invite_revoked": "invitation retirée",
  "operator.joined": "compte créé",
  "operator.role_changed": "accès modifié",
  "operator.removed": "compte retiré",
  "operator.signed_in": "connexion",
};

/**
 * Only the irreversible and the access-granting carry an intent. Colouring
 * every row is the same as colouring none — the eye needs the deletions and
 * the account changes to be the ones that stand out.
 */
export const actionIntents: Record<AuditActionName, Intent> = {
  "patient.created": "neutral",
  "patient.updated": "neutral",
  "patient.deleted": "error",
  "recommendation.added": "neutral",
  "recommendation.updated": "neutral",
  "recommendation.archived": "neutral",
  "recommendation.restored": "neutral",
  "recommendation.deleted": "error",
  "recommendation.reordered": "neutral",
  "note.added": "neutral",
  "note.updated": "neutral",
  "note.deleted": "error",
  "share_link.regenerated": "warning",
  "share_link.emailed": "info",
  "operator.invited": "info",
  "operator.invite_revoked": "warning",
  "operator.joined": "info",
  "operator.role_changed": "warning",
  "operator.removed": "error",
  "operator.signed_in": "neutral",
};
