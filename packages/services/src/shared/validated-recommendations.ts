/**
 * « Mes recommandations » as the patient reads them — story 23, REM-87 and
 * REM-88, D-30.
 *
 * `validatedRecommendationsView` turns one validated snapshot into the
 * categories of the page, in Morgane's order. It reads the snapshot only, so a
 * change that the practitioner has not validated cannot be in the result. Each
 * text is the practitioner's text, as written: nothing is rephrased, and an
 * empty field stays empty.
 *
 * Isomorphic and pure: no I/O and no clock. The caller gives the day.
 */

import type { FoodLimitLevel } from "./food-directives";
import { todayAtPractice } from "./format";
import { lifestyleAdviceKeys, lifestyleKeyOf } from "./lifestyle-advice";
import type { ProtocolSnapshot } from "./protocol-snapshot";

/**
 * The sub-categories of « Conseils d'hygiène de vie »: the six categories of
 * story 17 in Morgane's order (REM-65), then `monitoring`. A row of the old
 * categories `habit` and `activity` is in the category that `lifestyleKeyOf`
 * gives. A `nutrition` recommendation goes with the food recommendations, and
 * a `supplement` one with the supplements.
 */
export const lifestyleAdviceCategories = [
  ...lifestyleAdviceKeys,
  "monitoring",
] as const;

export type LifestyleAdviceCategory =
  (typeof lifestyleAdviceCategories)[number];

/** One recommendation of the practitioner: a title, and a detail or "". */
export type ValidatedAdvice = { id: string; title: string; detail: string };

export type ValidatedSupplement = {
  id: string;
  name: string;
  dose: string;
  timing: string;
  reason: string;
};

export type ValidatedEviction = {
  id: string;
  term: string;
  /** `YYYY-MM-DD`, only when the eviction starts after `today`. */
  startsOn: string | null;
  /** `YYYY-MM-DD`, or null for a durable exclusion. */
  endsOn: string | null;
};

export type ValidatedFoodLimit = {
  id: string;
  term: string;
  /** Null when the practitioner chose no level. */
  limitLevel: FoodLimitLevel | null;
};

export type ValidatedRecommendationsView = {
  /** The day of the validation at the practice, `YYYY-MM-DD`. */
  updatedOn: string;
  /** Category 1: the supplements, then the notes of category `supplement`. */
  supplements: ValidatedSupplement[];
  supplementAdvice: ValidatedAdvice[];
  /** Category 2: only the sub-categories that hold an item. */
  lifestyle: { category: LifestyleAdviceCategory; items: ValidatedAdvice[] }[];
  /** Category 3: the evictions in force, the two lists, then the advice. */
  evictions: ValidatedEviction[];
  favour: { id: string; term: string }[];
  limit: ValidatedFoodLimit[];
  foodAdvice: ValidatedAdvice[];
  /** Category 4: the goals in the practitioner's order. */
  goals: { id: string; title: string }[];
  /** True when no category holds an item for the patient. */
  isEmpty: boolean;
};

const byPosition = <T extends { position: number }>(rows: readonly T[]): T[] =>
  [...rows].sort((a, b) => a.position - b.position);

/**
 * The view of one validated version on the day `today` (`YYYY-MM-DD` at the
 * practice).
 *
 * - An eviction whose end date is before `today` is not in the view (the
 *   breakdown's question 2). An eviction that ends on `today` is in the view.
 *   A durable eviction is always in the view. This rule is for the page only:
 *   the compatibility gate reads `evictionsOfDirectives`, which drops nothing.
 * - Category 5 « Autres recommandations » has no source in the snapshot yet,
 *   so the view has no such list.
 * - The instruction, the calculations and the baseline of a goal are not
 *   recommendations of story 23, so they are not in the view.
 */
export const validatedRecommendationsView = (
  protocol: { validatedAt: Date; snapshot: ProtocolSnapshot },
  today: string,
): ValidatedRecommendationsView => {
  const { snapshot } = protocol;
  const adviceOf = (
    category: ProtocolSnapshot["recommendations"][number]["category"],
  ): ValidatedAdvice[] =>
    byPosition(
      snapshot.recommendations.filter((row) => row.category === category),
    ).map((row) => ({ id: row.id, title: row.title, detail: row.detail }));
  const directivesOf = (
    kind: ProtocolSnapshot["foodDirectives"][number]["kind"],
  ) => byPosition(snapshot.foodDirectives.filter((row) => row.kind === kind));

  const supplements = byPosition(snapshot.supplements).map((row) => ({
    id: row.id,
    name: row.name,
    dose: row.dose,
    timing: row.timing,
    reason: row.reason,
  }));
  const supplementAdvice = adviceOf("supplement");
  // An old `habit` or `activity` row comes first in its category, then the
  // advice of the section. Each run is in the practitioner's order.
  const lifestyle = lifestyleAdviceCategories.flatMap((category) => {
    const items =
      category === "monitoring"
        ? adviceOf(category)
        : byPosition(
            snapshot.recommendations.filter(
              (row) => lifestyleKeyOf(row.category) === category,
            ),
          ).map((row) => ({ id: row.id, title: row.title, detail: row.detail }));
    return items.length > 0 ? [{ category, items }] : [];
  });
  const evictions = directivesOf("exclude")
    .filter((row) => row.durable || row.endsOn === null || row.endsOn >= today)
    .map((row) => ({
      id: row.id,
      term: row.term,
      startsOn:
        row.startsOn !== null && row.startsOn > today ? row.startsOn : null,
      endsOn: row.durable ? null : row.endsOn,
    }));
  const favour = directivesOf("favour").map((row) => ({
    id: row.id,
    term: row.term,
  }));
  const limit = directivesOf("limit").map((row) => ({
    id: row.id,
    term: row.term,
    limitLevel: row.limitLevel,
  }));
  const foodAdvice = adviceOf("nutrition");
  const goals = byPosition(snapshot.goals).map((row) => ({
    id: row.id,
    title: row.title,
  }));

  return {
    updatedOn: todayAtPractice(protocol.validatedAt),
    supplements,
    supplementAdvice,
    lifestyle,
    evictions,
    favour,
    limit,
    foodAdvice,
    goals,
    isEmpty:
      supplements.length === 0 &&
      supplementAdvice.length === 0 &&
      lifestyle.length === 0 &&
      evictions.length === 0 &&
      favour.length === 0 &&
      limit.length === 0 &&
      foodAdvice.length === 0 &&
      goals.length === 0,
  };
};

/**
 * True when category 3 « Recommandations alimentaires » holds an item. The
 * page and the Profil tab both ask, so the two cannot disagree on when the
 * food block shows.
 */
export const hasFoodRecommendations = (
  view: Pick<
    ValidatedRecommendationsView,
    "evictions" | "favour" | "limit" | "foodAdvice"
  >,
): boolean =>
  view.evictions.length > 0 ||
  view.favour.length > 0 ||
  view.limit.length > 0 ||
  view.foodAdvice.length > 0;
