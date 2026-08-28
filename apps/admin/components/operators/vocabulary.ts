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
  owner: "accès complet",
  operator: "accès patients",
};

export const roleDescriptions: Record<OperatorRoleName, string> = {
  owner: "Gère les profils patients, et les accès à la console.",
  operator: "Gère les profils patients. Ne touche pas aux accès.",
};

export const roleIntents: Record<OperatorRoleName, Intent> = {
  owner: "info",
  operator: "neutral",
};
