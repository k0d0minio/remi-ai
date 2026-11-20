/**
 * REMI's answer to a planned meal, as the home page shows it (REM-102, story
 * 28). Types only: the service `server/meals/suggest.ts` builds the value, and
 * the patient's page renders it.
 *
 * The order of the fields is the order on the screen: the alerts come first,
 * before any praise (D-30).
 */

import type { CompatibilitySource } from "../ai/compatibility";

/**
 * One part of the meal that holds a food the patient must not eat. `food` is
 * the patient's own words. The compatibility gate found it in code: no model
 * decides an alert.
 */
export type MealAlert = {
  food: string;
  source: CompatibilitySource;
};

export const mealImprovementKinds = ["add", "replace", "remove"] as const;

export type MealImprovementKind = (typeof mealImprovementKinds)[number];

export type MealImprovement =
  | {
      status: "shown";
      kind: MealImprovementKind;
      /** The food to add, to use as the replacement, or to remove. */
      food: string;
      /** The food of the meal that `food` replaces. Null for add and remove. */
      replaces: string | null;
      /**
       * The reason, in REMI's words. Null when the model's sentence names the
       * proposed food: it then says the improvement a second time (REM-103).
       */
      explanation: string | null;
      /** The validated recommendation, directive, parameter or goal, as written. */
      basis: string;
    }
  /** The meal agrees with the validated protocol. */
  | { status: "aligned" }
  /** REMI has no improvement that the compatibility gate confirms. */
  | { status: "withheld" }
  /** The second proposal names the food that the patient refused (REM-103). */
  | { status: "repeated" }
  /** No validated version: REMI says nothing that looks like a recommendation. */
  | { status: "no_protocol" }
  /** The meal has an alert, and the alert is the thing to change first. */
  | { status: "address_alert" };

/**
 * The improvement that the patient refused with « Pas pour moi » (REM-103).
 * The second generation gets it, and the code refuses a reply that names the
 * same food.
 */
export type RefusedImprovement = {
  kind: MealImprovementKind;
  food: string;
  replaces: string | null;
};

export type MealAnswer =
  /** No adapter, a failed call, a refusal, a reply outside the schema, a timeout. */
  | { status: "unavailable" }
  /** The model did not understand the text as a meal. */
  | { status: "unclear" }
  | {
      status: "answered";
      /**
       * Foods that the model named and that the compatibility gate flags too,
       * when no alert and no trace shows them already. A food that the gate
       * does not flag is never here (REM-103). Never shown as certain.
       */
      toCheck: string[];
      /** Zero to three points. */
      goodPoints: string[];
      improvement: MealImprovement;
    };

export type MealSuggestion = {
  alerts: MealAlert[];
  /**
   * The parts of the meal that can hold an excluded food: a trace, a
   * cross-contamination, a frequent variant. The gate found them in code. They
   * are never shown as safe, and never as certain (D-30).
   */
  traces: string[];
  /**
   * True when the patient has an exclusion, or gave no answer on allergies or
   * intolerances. The page then tells the patient to check the ingredients:
   * REMI does not know the composition of a typed meal (D-30).
   */
  checkIngredients: boolean;
  answer: MealAnswer;
};
