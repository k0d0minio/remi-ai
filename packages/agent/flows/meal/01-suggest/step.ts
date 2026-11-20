/**
 * The step `meal/01-suggest`: REMI's answer to a planned meal — REM-102,
 * story 28, D-16 and D-30. The contract is `CONTEXT.md`, and the system text
 * is `prompt.md`. This file has the shape of the reply and the user text.
 *
 * Pure: no I/O and no clock. The caller (`server/meals/suggest.ts` of
 * `@remi/services`) loads the data, and checks the reply in code after the
 * generation.
 *
 * **Pseudonymous by type.** `MealPromptContext` has no field for a name, an
 * e-mail address, a birth date or an id. Each validated item gets a short
 * reference (`R1`, `L1`, `O1`) in place of its database id. The model names the
 * reference of the item that its improvement serves, and the caller reads the
 * item's own words from `basis`.
 *
 * The context is written in the order of D-30. The order decides on a
 * conflict, and the system text tells the model so.
 *
 * Morgane has not tuned this text. Her v1 prompt (« Prompt.docx », 24 October
 * 2026) is the reference for the tone and the two blocks.
 */

import { z } from "zod";

import { defineStep } from "../../../src/step";
import contract from "./CONTEXT.md";
import system from "./prompt.md";

/**
 * The same three kinds as `mealImprovementKinds` of `@remi/services/shared`.
 * This package imports no other package of the repo, thus the list is written
 * here too. `server/meals/suggest.ts` gives one to the other in both
 * directions, so the typecheck fails when the two lists differ.
 */
const improvementKinds = ["add", "replace", "remove"] as const;

/** The improvement that the person refused (REM-103). */
type RefusedImprovement = {
  kind: (typeof improvementKinds)[number];
  food: string;
  replaces: string | null;
};

/** One validated item. `detail` is `""` when the practitioner wrote none. */
export type MealPromptItem = { title: string; detail: string };

/** The validated version. Null fields and empty lists are simply not written. */
export type MealPromptProtocol = {
  /** The practitioner's instruction to REMI. */
  instruction: string | null;
  recommendations: readonly MealPromptItem[];
  /** « À limiter ». */
  limits: readonly MealPromptItem[];
  /** Validated nutritional parameters. */
  parameters: readonly MealPromptItem[];
  /** « À favoriser ». */
  favours: readonly MealPromptItem[];
  /** In the practitioner's order: the first goal is the main goal. */
  goals: readonly MealPromptItem[];
};

export type MealPromptContext = {
  /** The planned meal, as the patient typed it. */
  meal: string;
  /**
   * Level 1, already in French: one line for each allergy, intolerance and
   * total eviction, and the coeliac line.
   */
  exclusions: readonly string[];
  /** True when the patient gave no answer on allergies or on intolerances. */
  safetyUnanswered: boolean;
  /** The declared diet, already in French. Null when none is declared. */
  diet: string | null;
  /** Null when no version is validated: the prompt then has safety data only. */
  protocol: MealPromptProtocol | null;
  /**
   * The improvement that the person refused (REM-103). The prompt then asks
   * for a different one. The caller checks the reply in code.
   */
  refused?: RefusedImprovement | null;
};

/**
 * The reply. No length and no count is in the schema: a provider can refuse
 * such a constraint in a structured output. The caller checks them in code.
 * Each field is required, and « none » is `null` or an empty list.
 */
const mealSuggestionSchema = z.object({
  understood: z
    .boolean()
    .describe("false when the text is not a meal or is too vague"),
  excludedFound: z
    .array(z.string())
    .describe(
      "each food of the meal that holds, or can hold, an exclusion of the patient",
    ),
  goodPoints: z
    .array(z.string())
    .describe("one to three short sentences in French"),
  improvement: z
    .object({
      kind: z.enum(improvementKinds),
      food: z
        .string()
        .describe(
          "one simple food, one to three words, no quantity: the food to add, the replacement, or the food to remove",
        ),
      replaces: z
        .string()
        .nullable()
        .describe("for replace: the food of the meal that is replaced"),
      explanation: z
        .string()
        .describe(
          "one short sentence in French: the reason only, without the action and without the name of the proposed food",
        ),
      basis: z
        .string()
        .describe("the reference in brackets of the item that it serves"),
    })
    .nullable(),
});

export type MealSuggestionReply = z.infer<typeof mealSuggestionSchema>;

const NOT_ENTERED = "Non renseigné";

/** A text of the model or of the patient, as one line with no angle bracket. */
const inline = (value: string | null | undefined) =>
  (value ?? "").replace(/[<>]/g, " ").replace(/\s+/g, " ").trim();

const refusedText = (refused: RefusedImprovement) => {
  const food = inline(refused.food);
  switch (refused.kind) {
    case "add":
      return `ajouter « ${food} »`;
    case "remove":
      return `retirer « ${food} »`;
    case "replace":
      return `remplacer « ${inline(refused.replaces)} » par « ${food} »`;
  }
};

const filled = (value: string | null | undefined) => (value ?? "").trim();

const itemText = (item: MealPromptItem) => {
  const title = filled(item.title);
  const detail = filled(item.detail);
  return detail === "" ? title : `${title} — ${detail}`;
};

/** The user text, and the references that it gives to the validated items. */
const build = (context: MealPromptContext) => {
  const basis = new Map<string, string>();
  const referenced = (prefix: string, items: readonly MealPromptItem[]) =>
    items
      .filter((item) => filled(item.title) !== "")
      .map((item, index) => {
        const ref = `${prefix}${index + 1}`;
        basis.set(ref, filled(item.title));
        return `- [${ref}] ${itemText(item)}`;
      });
  const section = (heading: string, lines: readonly string[]) =>
    lines.length === 0 ? null : `${heading}\n${lines.join("\n")}`;

  const exclusions = context.exclusions
    .map(filled)
    .filter((line) => line !== "")
    .map((line) => `- ${line}`);
  if (context.safetyUnanswered) {
    exclusions.push(
      `- Allergies ou intolérances : ${NOT_ENTERED}. Ne présente aucun aliment comme sûr.`,
    );
  }

  const protocol = context.protocol;
  const instruction = filled(protocol?.instruction);
  const [mainGoal, ...secondaryGoals] = protocol?.goals ?? [];
  const diet = filled(context.diet);

  const sections = [
    section(
      "Niveau 1 — Allergies, intolérances et évictions totales (exclusions)",
      exclusions.length === 0 ? ["- Aucune exclusion déclarée."] : exclusions,
    ),
    section("Niveau 2 — Alimentation déclarée par la personne", [
      `- ${diet === "" ? NOT_ENTERED : diet}`,
    ]),
    protocol
      ? section(
          "Niveau 2 — Recommandations validées par le praticien",
          [
            ...(instruction === "" ? [] : [`- Consigne : ${instruction}`]),
            ...referenced("R", protocol.recommendations),
          ],
        )
      : "Aucune recommandation n'est validée par le praticien. « improvement » est null. Ne dis rien qui ressemble à une recommandation.",
    protocol
      ? section("Niveau 3 — Aliments à limiter", referenced("L", protocol.limits))
      : null,
    protocol
      ? section("Niveau 4 — Paramètres nutritionnels validés et aliments à favoriser", [
          ...referenced("P", protocol.parameters),
          ...referenced("F", protocol.favours),
        ])
      : null,
    protocol && mainGoal
      ? section("Niveau 5 — Objectif principal", referenced("O", [mainGoal]))
      : null,
    protocol
      ? section(
          "Niveau 6 — Objectifs secondaires",
          referenced("S", secondaryGoals),
        )
      : null,
  ].filter((part): part is string => part !== null);

  const refused = context.refused
    ? [
        [
          "Suggestion déjà refusée",
          `- La personne a répondu « Pas pour moi » à cette suggestion : ${refusedText(context.refused)}.`,
          "- Propose une amélioration différente, avec un autre aliment. Ne propose pas de nouveau cet aliment, ni une variante de cet aliment.",
          "- S'il n'y a pas d'autre amélioration utile, « improvement » est null.",
        ].join("\n"),
      ]
    : [];

  const prompt = [
    "Contexte",
    ...sections,
    ...refused,
    "Repas prévu",
    // The patient's text cannot close the block: it has no angle bracket.
    `<repas>\n${context.meal.replace(/[<>]/g, " ").trim()}\n</repas>`,
  ].join("\n\n");

  return { prompt, basis };
};

/**
 * The validated items that an improvement can serve: the reference, and the
 * item's title as the practitioner wrote it. Empty when no version is
 * validated: no improvement is then possible. The references are the ones of
 * the user text for the same inputs.
 */
export const mealSuggestionBasis = (
  context: MealPromptContext,
): ReadonlyMap<string, string> => build(context).basis;

export const mealSuggestion = defineStep({
  id: "meal/01-suggest",
  contract,
  prompt: system,
  schema: mealSuggestionSchema,
  render: (context: MealPromptContext) => build(context).prompt,
});
