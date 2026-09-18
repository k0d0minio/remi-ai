import type {
  NutritionRuleKind,
  NutritionRuleStatus,
} from "@remi/services/shared";
import type { Intent } from "@remi/ui/server";

/**
 * How the corpus reads in French, in one place.
 *
 * Closed maps keyed by the service's own vocabularies: adding a kind there
 * without adding it here is a type error, which is the point — a filter option
 * rendering as a raw `food-list` is an option nobody picks.
 */

export const kindLabels: Record<NutritionRuleKind, string> = {
  principle: "principe",
  "food-list": "liste d’aliments",
  seasonality: "saisonnalité",
  safety: "précaution",
  "house-rule": "règle de la maison",
};

export const statusLabels: Record<NutritionRuleStatus, string> = {
  draft: "brouillon",
  validated: "validée",
};

/**
 * `validated` is the only state a prompt can see, so it is the only one that
 * reads as a success. A draft is not a problem — it is simply not agreed yet.
 */
export const statusIntents: Record<NutritionRuleStatus, Intent> = {
  draft: "neutral",
  validated: "success",
};
