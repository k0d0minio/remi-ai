import type { OperatorRoleName } from "@remi/services/shared";
import type { Intent } from "@remi/ui/server";

/**
 * How the two roles read in the console.
 *
 * Named for what the role grants rather than for the person holding it —
 * "accès complet", not "administrateur". That keeps one label right for
 * everyone who will ever hold it, which a gendered French job noun cannot do,
 * and it answers the question actually being asked at the moment someone picks
 * a role: what will this person be able to reach?
 */

export const roleLabels: Record<OperatorRoleName, string> = {
  admin: "accès équipe REMI",
  practitioner: "accès à ses patients",
};

export const roleDescriptions: Record<OperatorRoleName, string> = {
  admin:
    "Gère ses patients et les accès à la console. Ouvre en lecture tout autre dossier patient, avec un motif enregistré au journal.",
  practitioner:
    "Gère les dossiers de ses propres patients. Ne voit aucun autre dossier.",
};

export const roleIntents: Record<OperatorRoleName, Intent> = {
  admin: "info",
  practitioner: "neutral",
};
