/**
 * REMI's answer to a planned meal — REM-102, story 28, D-6, D-16 and D-30.
 *
 * `suggestPlannedMeal` loads the patient's data and calls
 * `buildMealSuggestion`, which has no database call: the unit tests give it
 * the data and a fake provider.
 *
 * The safety decisions are in code, never in the model (D-16):
 * - The compatibility gate reads the patient's meal first. A part of the meal
 *   that holds an excluded food is an alert, and the alerts need no model:
 *   they are in the answer when the generation fails too. A part that can
 *   hold an excluded food (a trace) is named too, and never as safe.
 * - The gate reads the model's proposal after the generation. Only a food
 *   that the gate confirms as `compatible` is shown. An unknown composition
 *   is never shown as safe (D-30).
 * - A good point that names an excluded food is dropped.
 * - An improvement must serve one validated item of the protocol. With no
 *   validated version, no improvement is shown: REMI gives no recommendation
 *   of its own.
 *
 * The seam writes the log line of the call (role, model, duration, outcome).
 * This file writes one more line with the statuses only. No line holds the
 * meal, the prompt or the reply.
 *
 * Not here: a row in `meal_suggestions` or `ai_generations` (no table yet),
 * the clarifying question, and the buttons of REM-103.
 */

import { generateJson } from "../../ai";
import {
  checkCompatibility,
  mayBeShown,
  type CompatibilityReason,
  type CompatibilitySource,
  type PatientSafetyData,
} from "../../ai/compatibility";
import {
  mealSuggestionPrompt,
  mealSuggestionSchema,
  type MealPromptItem,
  type MealPromptProtocol,
  type MealSuggestionReply,
} from "../../ai/prompts/meal";
import type { Actor } from "../../db/models/actor";
import { listPatientEvictions } from "../../db/services/patient-food-directives";
import { getPatientQuestionnaire } from "../../db/services/patient-questionnaire";
import { getValidatedProtocol } from "../../db/services/protocol-versions";
import { todayAtPractice } from "../../shared/format";
import type {
  MealAlert,
  MealAnswer,
  MealImprovement,
  MealSuggestion,
} from "../../shared/meal-suggestion";
import type { ProtocolSnapshot } from "../../shared/protocol-snapshot";
import { dietLabels } from "../../shared/questionnaire";
import { ok, type Result } from "../../shared/result";
import { safetyList, strictGlutenLabel } from "../../shared/safety-highlights";
import type { Id } from "../../types";

/** Story 28: an answer in under 15 seconds, or the page says there is none. */
export const MEAL_SUGGESTION_TIMEOUT_MS = 15_000;

const GOOD_POINTS_MAX = 3;
const GOOD_POINT_MAX_LENGTH = 200;
const FOOD_MAX_LENGTH = 60;
const EXPLANATION_MAX_LENGTH = 300;
const TO_CHECK_MAX = 5;

export type MealSuggestionInput = {
  /** The planned meal, as stored. */
  meal: string;
  safety: PatientSafetyData;
  /** The patient's note on the diet « Autre ». */
  dietNote: string | null;
  /** The validated snapshot, or null when no version is validated. */
  protocol: ProtocolSnapshot | null;
  /** `YYYY-MM-DD` at the practice. */
  today: string;
  timeoutMs?: number;
};

/* ───────────────────────── the patient's meal ───────────────────────── */

/** D-30: level 1 first, then the declared diet. */
const SOURCE_ORDER: readonly CompatibilitySource[] = [
  "allergy",
  "intolerance",
  "coeliac",
  "eviction",
  "diet",
];

const byPriority = (a: CompatibilitySource, b: CompatibilitySource) =>
  SOURCE_ORDER.indexOf(a) - SOURCE_ORDER.indexOf(b);

const ruleKey = (reason: CompatibilityReason) =>
  `${reason.source}:${reason.rule}`;

/** The parts of a typed meal: « spaghetti, parmesan et salade » has three. */
const mealParts = (meal: string) =>
  meal
    .split(/[,;\n]+|\s+(?:et|avec)\s+/i)
    .map((part) => part.trim())
    .filter((part) => part !== "");

/**
 * The exclusions that a text names. A text is never `compatible` for the gate:
 * this reads only the reasons of an `incompatible` result.
 */
const reasonsIn = (
  safety: PatientSafetyData,
  text: string,
  today: string,
): CompatibilityReason[] => {
  const result = checkCompatibility(safety, { kind: "text", text }, today);
  return result.status === "incompatible" ? result.reasons : [];
};

const TRACE_KINDS: readonly string[] = ["possible_trace", "cross_contamination"];

const mealAlerts = (safety: PatientSafetyData, meal: string, today: string) => {
  const alerts: MealAlert[] = [];
  const traces: string[] = [];
  const rules = new Set<string>();
  for (const part of mealParts(meal)) {
    const result = checkCompatibility(
      safety,
      { kind: "text", text: part },
      today,
    );
    const reasons = result.status === "incompatible" ? result.reasons : [];
    const [first] = reasons.map((reason) => reason.source).sort(byPriority);
    if (first !== undefined) {
      alerts.push({ food: part, source: first });
    } else if (
      result.status === "uncertain" &&
      result.unknowns.some((unknown) => TRACE_KINDS.includes(unknown.kind))
    ) {
      traces.push(part);
    }
    for (const reason of reasons) {
      rules.add(ruleKey(reason));
    }
  }
  // The split can cut a term of several words. The whole text is read too, and
  // an exclusion that no part showed is an alert on the whole meal.
  const missed = reasonsIn(safety, meal, today).filter(
    (reason) => !rules.has(ruleKey(reason)),
  );
  const [missedSource] = missed.map((reason) => reason.source).sort(byPriority);
  if (missedSource !== undefined) {
    alerts.push({ food: meal.trim(), source: missedSource });
  }
  for (const reason of missed) {
    rules.add(ruleKey(reason));
  }
  alerts.sort((a, b) => byPriority(a.source, b.source));
  return { alerts, traces, rules };
};

const UNRESTRICTED_DIETS: readonly (string | null)[] = [
  null,
  "none",
  "omnivore",
  "flexitarian",
];

/** True when the patient has an exclusion, or an answer is missing. */
const hasSafetyConcern = (safety: PatientSafetyData) =>
  safety.allergens.length > 0 ||
  safety.evictions.length > 0 ||
  safety.celiacDisease === true ||
  safety.noKnownAllergies !== true ||
  safety.noKnownIntolerances !== true ||
  !UNRESTRICTED_DIETS.includes(safety.diet);

/* ───────────────────────── the prompt context ───────────────────────── */

const exclusionLines = (safety: PatientSafetyData) => {
  const allergies = safetyList(
    "allergy",
    safety.noKnownAllergies,
    safety.allergens,
  );
  const intolerances = safetyList(
    "intolerance",
    safety.noKnownIntolerances,
    safety.allergens,
  );
  const lines = [
    ...(allergies.state === "listed"
      ? allergies.items.map((item) => `Allergie : ${item}`)
      : []),
    ...(intolerances.state === "listed"
      ? intolerances.items.map((item) => `Intolérance : ${item}`)
      : []),
    ...(safety.celiacDisease === true ? [strictGlutenLabel.fr] : []),
    ...safety.evictions.map(
      (eviction) =>
        `Éviction totale demandée par le praticien : ${eviction.term.trim()}`,
    ),
  ];
  return {
    lines,
    unanswered:
      allergies.state === "not_entered" ||
      intolerances.state === "not_entered",
  };
};

const dietLine = (diet: string | null, note: string | null) => {
  if (diet === null) {
    return null;
  }
  const label = Object.hasOwn(dietLabels, diet)
    ? dietLabels[diet as keyof typeof dietLabels].fr
    : diet;
  const detail = (note ?? "").trim();
  return detail === "" ? label : `${label} — ${detail}`;
};

const PARAMETER_TITLES: Partial<
  Record<ProtocolSnapshot["calculations"][number]["kind"], (value: number) => string>
> = {
  protein: (value) => `Besoins protéiques : ${Math.round(value)} g par jour`,
  energy: (value) => `Besoins énergétiques : ${Math.round(value)} kcal par jour`,
};

const LIMIT_DETAILS = { reduce: "à réduire", rare: "rarement" } as const;

/** The recommendation categories that concern a meal. */
const MEAL_CATEGORIES: readonly string[] = ["nutrition", "habit"];

/**
 * The validated version as the prompt reads it, in the order of D-30. The
 * snapshot has no mark for an imperative recommendation: each validated
 * recommendation is at level 2.
 */
const promptProtocol = (snapshot: ProtocolSnapshot): MealPromptProtocol => {
  const directives = (kind: "limit" | "favour"): MealPromptItem[] =>
    snapshot.foodDirectives
      .filter((directive) => directive.kind === kind)
      .map((directive) => ({
        title: directive.term,
        detail: directive.limitLevel
          ? LIMIT_DETAILS[directive.limitLevel]
          : "",
      }));
  return {
    instruction: snapshot.instruction?.body ?? null,
    recommendations: snapshot.recommendations
      .filter((row) => MEAL_CATEGORIES.includes(row.category))
      .map((row) => ({ title: row.title, detail: row.detail })),
    limits: directives("limit"),
    parameters: snapshot.calculations.flatMap((calculation) => {
      const title = PARAMETER_TITLES[calculation.kind];
      return title ? [{ title: title(calculation.value), detail: "" }] : [];
    }),
    favours: directives("favour"),
    goals: snapshot.goals.map((goal) => ({
      title: goal.title,
      detail: goal.baseline,
    })),
  };
};

/* ───────────────────────── the reply, checked in code ───────────────────────── */

/** One line of text within the limit, or null. */
const clean = (value: string | null, max: number) => {
  const text = (value ?? "").replace(/\s+/g, " ").trim();
  return text === "" || text.length > max ? null : text;
};

type Checks = {
  safety: PatientSafetyData;
  today: string;
  alerts: readonly MealAlert[];
  /** The exclusions that the patient's own meal names. */
  mealRules: ReadonlySet<string>;
  basis: ReadonlyMap<string, string>;
};

const checkedImprovement = (
  reply: MealSuggestionReply,
  flagged: boolean,
  checks: Checks,
): MealImprovement => {
  const { safety, today, alerts, mealRules, basis } = checks;
  const hasAlert = alerts.length > 0;
  const proposal = reply.improvement;

  if (proposal === null) {
    if (hasAlert) {
      return { status: "address_alert" };
    }
    if (basis.size === 0) {
      return { status: "no_protocol" };
    }
    return flagged ? { status: "withheld" } : { status: "aligned" };
  }
  // No validated item, or an item that the prompt did not hold: REMI would
  // speak in its own name. Nothing is shown.
  if (basis.size === 0) {
    return hasAlert ? { status: "address_alert" } : { status: "no_protocol" };
  }
  const served = basis.get(proposal.basis.replace(/[[\]\s]/g, ""));
  const fallback: MealImprovement = hasAlert
    ? { status: "address_alert" }
    : { status: "withheld" };
  if (served === undefined) {
    return fallback;
  }
  // The excluded food comes first (D-30, level 1): one more food does not
  // answer it.
  if (hasAlert && proposal.kind === "add") {
    return { status: "address_alert" };
  }
  const food = clean(proposal.food, FOOD_MAX_LENGTH);
  const explanation = clean(proposal.explanation, EXPLANATION_MAX_LENGTH);
  const replaces =
    proposal.kind === "replace"
      ? clean(proposal.replaces, FOOD_MAX_LENGTH)
      : null;
  if (
    food === null ||
    explanation === null ||
    (proposal.kind === "replace" && replaces === null)
  ) {
    return fallback;
  }
  // The gate on the proposed food. `uncertain` is hidden as `incompatible` is.
  if (proposal.kind !== "remove") {
    const verdict = checkCompatibility(
      safety,
      { kind: "recipe", ingredients: [{ name: food }] },
      today,
    );
    if (!mayBeShown(verdict)) {
      return { status: "withheld" };
    }
  }
  // The sentence can name an excluded food of the patient's own meal
  // (« remplace les spaghetti »). It must name no other excluded food.
  const introduced = reasonsIn(safety, explanation, today).some(
    (reason) => !mealRules.has(ruleKey(reason)),
  );
  if (introduced) {
    return { status: "withheld" };
  }
  return {
    status: "shown",
    kind: proposal.kind,
    food,
    replaces,
    explanation,
    basis: served,
  };
};

const checkedAnswer = (
  reply: MealSuggestionReply,
  checks: Checks,
): MealAnswer => {
  if (!reply.understood) {
    return { status: "unclear" };
  }
  const toCheck = reply.excludedFound
    .map((food) => clean(food, FOOD_MAX_LENGTH))
    .filter((food): food is string => food !== null)
    .slice(0, TO_CHECK_MAX);
  const goodPoints = reply.goodPoints
    .map((point) => clean(point, GOOD_POINT_MAX_LENGTH))
    .filter((point): point is string => point !== null)
    // No praise for an excluded food.
    .filter(
      (point) => reasonsIn(checks.safety, point, checks.today).length === 0,
    )
    .slice(0, GOOD_POINTS_MAX);
  return {
    status: "answered",
    toCheck,
    goodPoints,
    improvement: checkedImprovement(reply, toCheck.length > 0, checks),
  };
};

const within = async <T>(work: Promise<T>, ms: number): Promise<T | null> => {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<null>((resolve) => {
    timer = setTimeout(() => resolve(null), ms);
  });
  try {
    return await Promise.race([work, timeout]);
  } finally {
    clearTimeout(timer);
  }
};

/**
 * The answer from data that the caller loaded. It never throws for a failed
 * generation: the answer is then `unavailable`, with the alerts of the gate.
 */
export const buildMealSuggestion = async (
  input: MealSuggestionInput,
): Promise<MealSuggestion> => {
  const { meal, safety, today } = input;
  const { alerts, traces, rules } = mealAlerts(safety, meal, today);
  const exclusions = exclusionLines(safety);
  const { system, prompt, basis } = mealSuggestionPrompt({
    meal,
    exclusions: exclusions.lines,
    safetyUnanswered: exclusions.unanswered,
    diet: dietLine(safety.diet, input.dietNote),
    protocol: input.protocol ? promptProtocol(input.protocol) : null,
  });

  const generated = await within(
    generateJson(prompt, mealSuggestionSchema, {
      role: "fast",
      system,
      maxTokens: 1024,
    }),
    input.timeoutMs ?? MEAL_SUGGESTION_TIMEOUT_MS,
  );

  const answer: MealAnswer =
    generated === null || !generated.ok
      ? { status: "unavailable" }
      : checkedAnswer(generated.data, {
          safety,
          today,
          alerts,
          mealRules: rules,
          basis,
        });

  // Statuses and counts only: no meal text, no prompt, no reply.
  console.info(
    JSON.stringify({
      event: "meal.suggestion",
      answer: answer.status,
      improvement:
        answer.status === "answered" ? answer.improvement.status : null,
      alerts: alerts.length,
      validatedProtocol: input.protocol !== null,
      timedOut: generated === null,
    }),
  );

  return {
    alerts,
    traces,
    checkIngredients: hasSafetyConcern(safety),
    answer,
  };
};

/**
 * REMI's answer to the meal that a patient typed. Each read checks the actor
 * (D-26, D-27). A failed read of the safety data is a failure: the caller
 * shows no answer, and never an answer built with no exclusion.
 *
 * The allergies, the intolerances, the coeliac flag and the diet are the
 * patient's own declaration and apply at once (D-30). The evictions are the
 * ones in force on the file. The recommendations come from the validated
 * version only.
 */
export const suggestPlannedMeal = async (
  actor: Actor,
  patientId: Id,
  meal: string,
  at: Date = new Date(),
): Promise<Result<MealSuggestion>> => {
  const questionnaire = await getPatientQuestionnaire(actor, patientId);
  if (!questionnaire.ok) {
    return questionnaire;
  }
  const evictions = await listPatientEvictions(actor, patientId);
  if (!evictions.ok) {
    return evictions;
  }
  const validated = await getValidatedProtocol(actor, patientId);
  if (!validated.ok) {
    return validated;
  }

  const { answers, allergens } = questionnaire.data;
  return ok(
    await buildMealSuggestion({
      meal,
      safety: {
        allergens: allergens.map((row) => ({
          kind: row.kind,
          key: row.key,
          subKey: row.subKey,
          otherText: row.otherText,
        })),
        noKnownAllergies: answers.noKnownAllergies,
        noKnownIntolerances: answers.noKnownIntolerances,
        celiacDisease: answers.celiacDisease,
        diet: answers.diet,
        evictions: evictions.data,
      },
      dietNote: answers.dietNote,
      protocol: validated.data?.snapshot ?? null,
      today: todayAtPractice(at),
    }),
  );
};
