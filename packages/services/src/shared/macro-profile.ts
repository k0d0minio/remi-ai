/**
 * The patient's macronutrient profile — story 4, `genotype-section`. The
 * genetic personalisation applies only when the three results are entered and
 * match a valid row of the internal table: « Aucun calcul génétique
 * partiel ». In every other case REMI keeps DEFAULT, 45 % carbohydrates,
 * 30 % fat and 25 % protein.
 *
 * The table is `genotype-macro-split/genotype-reference-table` (story 10). It
 * does not exist yet, and the A/H/M categories wait on Morgane's validation of
 * the laboratory mapping (story 4, question 3). So every patient gets DEFAULT
 * today, with the reason why.
 *
 * Isomorphic: no I/O, so the console and the services import it as is.
 */

import type {
  amy1aCategories,
  apoeGenotypes,
  dio2Categories,
  geneticTestAnswers,
} from "./questionnaire";

/** DEFAULT, in percent of the energy intake. */
export const defaultMacroSplit = {
  carbohydrate: 45,
  fat: 30,
  protein: 25,
} as const;

/**
 * Morgane validated the A/H/M mapping of the laboratory (story 4, question 3).
 * A pull request flips it after her validation (Jamie, 2026-11-11). While it
 * is `false`, no trio is interpreted.
 */
export const genotypeMappingValidated = false;

/**
 * Why the profile is DEFAULT:
 *
 * - `no-test`: the test question is not « Oui ».
 * - `no-consent`: the genetic consent is not `given`.
 * - `incomplete`: one of the three results is empty.
 * - `mapping-unvalidated`: the trio is complete, and the laboratory mapping
 *   waits on Morgane.
 * - `absent`: the trio has no row in the table.
 */
export const macroProfileReasons = [
  "no-test",
  "no-consent",
  "incomplete",
  "mapping-unvalidated",
  "absent",
] as const;

export type MacroProfileReason = (typeof macroProfileReasons)[number];

export type MacroProfile = {
  source: "default";
  carbohydrate: number;
  fat: number;
  protein: number;
  reason: MacroProfileReason;
};

export type MacroProfileInput = {
  geneticTest: (typeof geneticTestAnswers)[number] | null;
  apoe: (typeof apoeGenotypes)[number] | null;
  dio2: (typeof dio2Categories)[number] | null;
  amy1a: (typeof amy1aCategories)[number] | null;
  /** The latest genetic consent decision is `given`. */
  geneticConsentGiven: boolean;
};

const fallback = (reason: MacroProfileReason): MacroProfile => ({
  source: "default",
  ...defaultMacroSplit,
  reason,
});

/**
 * The profile of one patient. DEFAULT unless the answer is « Oui », the
 * genetic consent is `given`, the three results are set and the trio matches
 * a row. Stored values under « Non / Je ne sais pas » never count (story 4,
 * criterion 24).
 *
 * `mappingValidated` exists for the tests. Callers leave it out.
 */
export const macroProfile = (
  input: MacroProfileInput,
  mappingValidated: boolean = genotypeMappingValidated,
): MacroProfile => {
  if (input.geneticTest !== "yes") {
    return fallback("no-test");
  }
  if (!input.geneticConsentGiven) {
    return fallback("no-consent");
  }
  if (input.apoe === null || input.dio2 === null || input.amy1a === null) {
    return fallback("incomplete");
  }
  if (!mappingValidated) {
    return fallback("mapping-unvalidated");
  }
  // The table comes with `genotype-macro-split/genotype-reference-table`.
  // Until then no trio has a row.
  return fallback("absent");
};
