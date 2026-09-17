/**
 * The nutrition corpus' closed vocabularies — brainstorm § 6's « contenus
 * validés », made into two enums and nothing more.
 *
 * `kind` is closed because it is structural: it says what shape a rule is, and
 * the console groups and filters on it. Tags are the opposite and deliberately
 * live nowhere near this file — they are free text on the row, because which
 * words Morgane reaches for is hers to answer by using them, and an enum
 * invented here would answer it for her.
 *
 * It sits in `shared/` rather than beside the model because `db/models/` is
 * types only: a runtime list there would join every client bundle.
 */

export const nutritionRuleKinds = [
  /** A general principle — « favoriser une alimentation anti-inflammatoire ». */
  "principle",
  /** A list of foods for a nutrient or a purpose — « sources d'oméga-3 ». */
  "food-list",
  /** What is in season, and what may be frozen instead. */
  "seasonality",
  /** A precaution: interactions, contraindications, what REMI must not do. */
  "safety",
  /** How the practice works rather than what to eat — her own house rule. */
  "house-rule",
] as const;

export type NutritionRuleKind = (typeof nutritionRuleKinds)[number];

/**
 * `draft` until a human says otherwise. Retrieval reads `validated` and nothing
 * else, which is § 6's « puis de les valider avant intégration » expressed as a
 * column rather than as a procedure someone has to remember.
 */
export const nutritionRuleStatuses = ["draft", "validated"] as const;

export type NutritionRuleStatus = (typeof nutritionRuleStatuses)[number];
