import type {
  AiModelRole,
  ModelCheck,
  ModelTestOutcome,
} from "@remi/services/shared";

/**
 * The words of the page « Modèles d'IA ». The refusal of a save is not here:
 * the service writes it, and the action shows it with `userMessage()`.
 */

export const roleLabels: Record<AiModelRole, string> = {
  fast: "Rapide",
  balanced: "Équilibré",
  deep: "Approfondi",
};

export const roleDescriptions: Record<AiModelRole, string> = {
  fast: "Les réponses courantes : l'avis de REMI sur un repas prévu.",
  balanced: "Aucune fonction n'utilise ce rôle pour le moment.",
  deep: "Aucune fonction n'utilise ce rôle pour le moment.",
};

/** The result of « Tester », as the admin reads it. */
export const testOutcomeMessages: Record<ModelTestOutcome, string> = {
  ok: "Le modèle a répondu correctement.",
  no_access: "Le compte de la passerelle n'a pas accès à ce modèle.",
  unknown_model: "La passerelle ne connaît pas ce modèle.",
  refused: "Le modèle a refusé de répondre.",
  schema_fail: "Le modèle a répondu, mais pas dans le format demandé.",
  error: "L'appel n'a pas abouti. Réessayez dans un instant.",
};

export const NO_KEY_MESSAGE =
  "La clé de la passerelle d'IA n'est pas configurée sur ce déploiement. Aucun appel n'est possible.";

/** A check that a model fails, in a few words beside the model. */
export const checkLabels: Record<ModelCheck, string> = {
  not_listed: "absent de la liste de la passerelle",
  no_structured_output: "pas de sortie structurée",
  may_train: "ses fournisseurs peuvent entraîner leurs modèles sur les données",
};

/** `zdr` of the gateway: information only, a save does not read it. */
export const retentionLabel = (zdr: string | null) => {
  if (zdr === "all") {
    return "aucun fournisseur ne conserve les données";
  }
  if (zdr === "some") {
    return "certains fournisseurs conservent les données";
  }
  if (zdr === "none") {
    return "les fournisseurs peuvent conserver les données";
  }
  return "non renseignée";
};
