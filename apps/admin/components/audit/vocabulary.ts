import {
  fileStatusLabels,
  isFileStatus,
  type AuditActionName,
} from "@remi/services/shared";
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
  "patient.signed_up": "inscription par le lien",
  "patient.file_taken_over": "dossier repris par le patient",
  "patient.file_claim_sent": "lien de reprise envoyé",
  "patient.signed_in": "connexion",
  "patient.password_reset_requested": "lien de nouveau mot de passe demandé",
  "patient.password_reset": "nouveau mot de passe défini",
  "patient.updated": "profil modifié",
  "patient.file_status_changed": "statut du dossier changé",
  "patient.consultation_date_changed": "date de consultation changée",
  "patient.changed": "modifié par le patient",
  "patient.change_acknowledged": "modification du patient prise en compte",
  "patient.deleted": "profil supprimé",
  "patient.inactivity_notice_sent":
    "avis de suppression pour inactivité envoyé",
  "patient.admin_opened": "accès admin",
  "patient.retention_hold_set": "conservation posée",
  "patient.retention_hold_cleared": "conservation levée",
  "calculation.validated": "calcul validé",
  "calculation.revalidation_needed": "calcul à revalider",
  "protocol.validated": "recommandations validées",
  "recommendation.added": "recommandation ajoutée",
  "recommendation.updated": "recommandation modifiée",
  "recommendation.archived": "recommandation archivée",
  "recommendation.restored": "recommandation réactivée",
  "recommendation.deleted": "recommandation supprimée",
  "recommendation.reordered": "recommandations réordonnées",
  "recommendation.batch_saved": "section recommandations enregistrée",
  "supplement.added": "complément ajouté",
  "supplement.updated": "complément modifié",
  "supplement.archived": "complément archivé",
  "supplement.restored": "complément réactivé",
  "supplement.deleted": "complément supprimé",
  "supplement.reordered": "compléments réordonnés",
  "supplement.batch_saved": "protocole de compléments enregistré",
  "food_directive.batch_saved": "consignes alimentaires enregistrées",
  "lifestyle_advice.batch_saved": "conseils d'hygiène de vie enregistrés",
  "lifestyle_advice.disabled": "conseil d'hygiène de vie désactivé",
  "lifestyle_advice.restored": "conseil d'hygiène de vie réactivé",
  "lifestyle_advice.deleted": "conseil d'hygiène de vie supprimé",
  "meal_configuration.updated": "repas et jeûne intermittent modifiés",
  "pantry.added": "essentiel ajouté",
  "pantry.updated": "essentiel modifié",
  "pantry.archived": "essentiel archivé",
  "pantry.restored": "essentiel réactivé",
  "pantry.deleted": "essentiel supprimé",
  "pantry.reordered": "essentiels réordonnés",
  "pantry.batch_saved": "liste d'essentiels enregistrée",
  "recipe.created": "recette créée",
  "recipe.updated": "recette modifiée",
  "recipe.archived": "recette archivée",
  "recipe.restored": "recette réactivée",
  "recipe.assigned": "recette attribuée",
  "recipe.created_and_assigned": "recette créée et attribuée",
  "recipe.duplicated_as_variant": "variante créée",
  "recipe.verified": "recette vérifiée",
  "recipe.verification_removed": "vérification retirée",
  "recipe.assigned_bulk": "recettes attribuées",
  "recipe.assignment_updated": "attribution modifiée",
  "recipe.assignment_archived": "attribution archivée",
  "recipe.assignment_restored": "attribution réactivée",
  "recipe.assignment_removed": "attribution supprimée",
  "nutrition_rule.created": "règle créée",
  "nutrition_rule.updated": "règle modifiée",
  "nutrition_rule.revised": "nouvelle version de la règle",
  "nutrition_rule.validated": "règle validée",
  "nutrition_rule.archived": "règle archivée",
  "nutrition_rule.restored": "règle réactivée",
  "ai_model.set": "modèle d'IA modifié",
  "ai_model.reset": "modèle d'IA remis à la valeur par défaut",
  "meal.logged": "repas ajouté",
  "meal.updated": "repas modifié",
  "meal.feedback_written": "retour écrit",
  "meal.feedback_cleared": "retour effacé",
  "meal.archived": "repas archivé",
  "meal.restored": "repas réactivé",
  "meal.deleted": "repas supprimé",
  "observation.added": "observation ajoutée",
  "observation.updated": "observation modifiée",
  "observation.archived": "observation archivée",
  "observation.restored": "observation réactivée",
  "observation.deleted": "observation supprimée",
  "consultation.recorded": "consultation enregistrée",
  "note.added": "note ajoutée",
  "note.updated": "note modifiée",
  "note.deleted": "note supprimée",
  "anamnesis.updated": "anamnèse modifiée",
  "goal.added": "objectif ajouté",
  "goal.updated": "objectif modifié",
  "goal.archived": "objectif archivé",
  "goal.restored": "objectif réactivé",
  "goal.deleted": "objectif supprimé",
  "goal.reordered": "objectifs réordonnés",
  "goal.checked_in": "point d'étape ajouté",
  "goal.check_in_updated": "point d'étape modifié",
  "goal.check_in_deleted": "point d'étape supprimé",
  "goal.check_in_seen": "baisse vue",
  "instruction.updated": "consigne modifiée",
  "instruction.cleared": "consigne retirée",
  "challenge.started": "challenge lancé",
  "challenge.updated": "challenge modifié",
  "challenge.closed": "challenge clos",
  "challenge.acquired": "challenge acquis",
  "challenge.acquired_cleared": "challenge acquis retiré",
  "challenge.ready_for_next": "prêt(e) pour le prochain challenge",
  "challenge.ready_for_next_cleared": "prêt(e) pour le prochain retiré",
  "document.added": "document ajouté",
  "document.updated": "document modifié",
  "document.removed": "document retiré",
  "message.sent": "message envoyé",
  "message.replied": "réponse envoyée",
  "message.marked_read": "message marqué comme lu",
  "summary.updated": "résumé modifié",
  "summary.cleared": "résumé retiré",
  "next_consultation_prep.updated": "note de préparation modifiée",
  "consent.given": "consentement donné",
  "consent.refused": "consentement refusé",
  "consent.withdrawn": "consentement retiré",
  "genotype.cleared": "génotype effacé",
  "genotype.changed": "génotype modifié",
  "share_link.regenerated": "lien patient régénéré",
  "share_link.emailed": "lien patient envoyé",
  "activation_email.sent": "e-mail « Votre espace REMI est prêt » envoyé",
  "activation_email.failed": "e-mail « Votre espace REMI est prêt » non envoyé",
  "context.exported": "contexte copié",
  "protocol.copied_from_patient": "lignes reprises d'un autre patient",
  "template.saved": "modèle enregistré",
  "template.overwritten": "modèle remplacé",
  "template.renamed": "modèle renommé",
  "template.deleted": "modèle supprimé",
  "template.shared": "modèle partagé",
  "template.unshared": "partage du modèle retiré",
  "lead.contacted": "inscription marquée contactée",
  "lead.reopened": "inscription remise à contacter",
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
  "patient.signed_up": "neutral",
  "patient.file_taken_over": "neutral",
  "patient.file_claim_sent": "neutral",
  "patient.signed_in": "neutral",
  "patient.password_reset_requested": "neutral",
  "patient.password_reset": "warning",
  "patient.updated": "neutral",
  "patient.file_status_changed": "neutral",
  "patient.consultation_date_changed": "neutral",
  "patient.changed": "info",
  "patient.change_acknowledged": "success",
  "patient.deleted": "error",
  "patient.inactivity_notice_sent": "warning",
  "patient.admin_opened": "warning",
  "patient.retention_hold_set": "info",
  "patient.retention_hold_cleared": "warning",
  "calculation.validated": "neutral",
  "calculation.revalidation_needed": "warning",
  "protocol.validated": "success",
  "recommendation.added": "neutral",
  "recommendation.updated": "neutral",
  "recommendation.archived": "neutral",
  "recommendation.restored": "neutral",
  "recommendation.deleted": "error",
  "recommendation.reordered": "neutral",
  "recommendation.batch_saved": "neutral",
  "supplement.added": "neutral",
  "supplement.updated": "neutral",
  "supplement.archived": "neutral",
  "supplement.restored": "neutral",
  "supplement.deleted": "error",
  "supplement.reordered": "neutral",
  "supplement.batch_saved": "neutral",
  "food_directive.batch_saved": "neutral",
  "lifestyle_advice.batch_saved": "neutral",
  "lifestyle_advice.disabled": "neutral",
  "lifestyle_advice.restored": "neutral",
  "lifestyle_advice.deleted": "error",
  "meal_configuration.updated": "neutral",
  "pantry.added": "neutral",
  "pantry.updated": "neutral",
  "pantry.archived": "neutral",
  "pantry.restored": "neutral",
  "pantry.deleted": "error",
  "pantry.reordered": "neutral",
  "pantry.batch_saved": "neutral",
  "recipe.created": "neutral",
  "recipe.updated": "neutral",
  "recipe.archived": "neutral",
  "recipe.restored": "neutral",
  "recipe.assigned": "neutral",
  "recipe.created_and_assigned": "neutral",
  "recipe.duplicated_as_variant": "neutral",
  "recipe.verified": "success",
  "recipe.verification_removed": "warning",
  "recipe.assigned_bulk": "neutral",
  "recipe.assignment_updated": "neutral",
  "recipe.assignment_archived": "neutral",
  "recipe.assignment_restored": "neutral",
  "recipe.assignment_removed": "error",
  "nutrition_rule.created": "neutral",
  "nutrition_rule.updated": "neutral",
  "nutrition_rule.revised": "info",
  // The one act that lets a rule reach a prompt — it should stand out in the
  // journal the way a share-link regeneration does.
  "nutrition_rule.validated": "success",
  "nutrition_rule.archived": "warning",
  "nutrition_rule.restored": "neutral",
  // A change of the model that reads patient data: it must stand out.
  "ai_model.set": "warning",
  "ai_model.reset": "info",
  "meal.logged": "neutral",
  "meal.updated": "neutral",
  "meal.feedback_written": "neutral",
  "meal.feedback_cleared": "neutral",
  "meal.archived": "neutral",
  "meal.restored": "neutral",
  "meal.deleted": "error",
  "observation.added": "neutral",
  "observation.updated": "neutral",
  "observation.archived": "neutral",
  "observation.restored": "neutral",
  "observation.deleted": "error",
  "consultation.recorded": "neutral",
  "note.added": "neutral",
  "note.updated": "neutral",
  "note.deleted": "error",
  "anamnesis.updated": "neutral",
  "goal.added": "neutral",
  "goal.updated": "neutral",
  "goal.archived": "neutral",
  "goal.restored": "neutral",
  "goal.deleted": "error",
  "goal.reordered": "neutral",
  "goal.checked_in": "neutral",
  "goal.check_in_updated": "neutral",
  "goal.check_in_deleted": "error",
  "goal.check_in_seen": "neutral",
  "instruction.updated": "neutral",
  "instruction.cleared": "neutral",
  "challenge.started": "neutral",
  "challenge.updated": "neutral",
  "challenge.closed": "neutral",
  "challenge.acquired": "success",
  "challenge.acquired_cleared": "neutral",
  // The patient asking for the next one is the signal she acts on.
  "challenge.ready_for_next": "info",
  "challenge.ready_for_next_cleared": "neutral",
  "document.added": "neutral",
  "document.updated": "neutral",
  "document.removed": "neutral",
  // A patient writing is the signal she acts on, like « prêt(e) ».
  "message.sent": "info",
  "message.replied": "neutral",
  "message.marked_read": "neutral",
  "summary.updated": "neutral",
  "summary.cleared": "neutral",
  "next_consultation_prep.updated": "neutral",
  "consent.given": "neutral",
  "consent.refused": "info",
  // A withdrawal stops processing: Morgane must see it.
  "consent.withdrawn": "warning",
  // The genotype is gone from the file: the macronutrient split falls back.
  "genotype.cleared": "warning",
  // A result entered or changed. The detail names the field, never the value.
  "genotype.changed": "neutral",
  "share_link.regenerated": "warning",
  "share_link.emailed": "info",
  "activation_email.sent": "info",
  // The patient does not know that the space is open: the practitioner must see it.
  "activation_email.failed": "warning",
  // Health data left the console, pseudonymous but real — worth the eye, not an
  // alarm: it is the operator doing her job with the tool built for it.
  "context.exported": "warning",
  // One patient's rows read into another patient's grid. The same reasoning as
  // the export above: health data crossed records, which is worth the eye even
  // though it is the operator working inside her own console.
  "protocol.copied_from_patient": "warning",
  "template.saved": "neutral",
  "template.overwritten": "neutral",
  "template.renamed": "neutral",
  "template.deleted": "error",
  // A set that was hers alone is now readable by every operator of the console.
  "template.shared": "warning",
  "template.unshared": "info",
  "lead.contacted": "neutral",
  "lead.reopened": "neutral",
  "operator.invited": "info",
  "operator.invite_revoked": "warning",
  "operator.joined": "info",
  "operator.role_changed": "warning",
  "operator.removed": "error",
  "operator.signed_in": "neutral",
};

/**
 * The French of each reason that the service records for a file status move.
 * The service stores the reason in English (`setFileStatus`).
 */
const fileStatusReasons: Readonly<Record<string, string>> = {
  "every mandatory field is filled":
    "tous les champs obligatoires sont remplis",
  "a first recommendation is saved":
    "une première recommandation est enregistrée",
  "the practitioner activated the care": "accompagnement activé",
};

/**
 * The French of the details that a service stores as an English word or
 * phrase. The stored row does not change: the journal reads it through this
 * table. A detail that is a name, a date, a count or a technical key shows as
 * it is stored.
 */
const storedDetails: Readonly<Record<string, string>> = {
  "consent given": "consentement donné",
  "consent refused": "consentement refusé",
  "consent withdrawn": "consentement retiré",
  inactivity: "inactivité",
  "patient not identified": "patient non identifié",
  link: "lien",
  file: "fichier",
  acquired: "acquis",
  not_acquired: "non acquis",
  abandoned: "abandonné",
  // The activation e-mail: the kind of link, then why a send did not go out.
  sign_in: "lien de connexion",
  takeover: "lien de reprise du dossier",
  no_email: "le dossier n'a pas d'adresse e-mail",
  no_mailer: "l'envoi d'e-mails n'est pas configuré",
  link_failed: "le lien n'a pas pu être créé",
  send_failed: "le service d'e-mail a refusé l'envoi",
};

/**
 * The detail as the journal shows it. A file status move is stored as
 * `to_complete → ready: <reason>` and reads with the French labels here. A
 * reason with no French entry is left out, never shown in English. A detail of
 * `storedDetails` reads in French. Every other detail shows as it is stored.
 * No stored row changes.
 */
export const detailLabel = (action: AuditActionName, detail: string) => {
  if (action !== "patient.file_status_changed") {
    return storedDetails[detail] ?? detail;
  }
  const [, from, to, reason] =
    /^(\w+) → (\w+)(?:: (.*))?$/.exec(detail) ?? [];
  if (!isFileStatus(from) || !isFileStatus(to)) {
    return detail;
  }
  const move = `${fileStatusLabels[from].fr} → ${fileStatusLabels[to].fr}`;
  const french = reason === undefined ? undefined : fileStatusReasons[reason];
  return french ? `${move} : ${french}` : move;
};
