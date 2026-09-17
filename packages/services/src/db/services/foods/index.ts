import { normaliseNutritionText } from "../../../shared/nutrition";
import { err, ok, type Result } from "../../../shared/result";
import { getDatabase } from "../../client";
import type {
  CiqualImport,
  Food,
  FoodNutrient,
  NutrientMarker,
} from "../../models/food";

/**
 * Querying the CIQUAL table — the primitive `recipe-generation` composes.
 *
 * Her § 7 recipe step is two moves: eliminate the foods that do not suit the
 * profile, then rank what is left by the component the recommendation asks
 * for. `rankFoodsByComponent` is that, and `searchFoods` / `getFoodNutrients`
 * are what a person needs to check its answer by hand.
 *
 * Everything reads through the storage seam, which offers an exact-match
 * filter and nothing else. That is enough here because a rank is one
 * component's column — 3 484 rows of the 257 816 — and a lookup is one food's
 * seventy-four. No join, no sort pushed down, no reaching past the seam to a
 * driver.
 */

const foods = () => getDatabase().collection<Food>("foods");
const nutrients = () =>
  getDatabase().collection<FoodNutrient>("food_nutrients");
const imports = () => getDatabase().collection<CiqualImport>("ciqual_imports");

/** The whole catalogue, with headroom over the 3 484 the 2025 edition carries. */
const CATALOGUE_LIMIT = 6000;

/** One food has 74 components; the cap is headroom, not a page size. */
const PER_FOOD_LIMIT = 200;

/**
 * The catalogue and each ranked component, memoised for the life of the
 * process.
 *
 * This is a reference dataset: it changes when an operator runs the import
 * script by hand, which is a handful of times a year. Paying 3 484 rows on
 * every rank — and `recipe-generation` ranks several times per generation —
 * to stay fresh against a table that does not move is the wrong trade. A cache
 * left stale by an import clears on the next cold start, and
 * `refreshFoodCatalogue()` clears it in-process for the tests.
 */
let catalogue: readonly Food[] | null = null;
const rankedComponents = new Map<string, readonly FoodNutrient[]>();

/** Drops the memoised catalogue and component columns. */
export const refreshFoodCatalogue = () => {
  catalogue = null;
  rankedComponents.clear();
};

const allFoods = async (): Promise<readonly Food[]> => {
  if (catalogue === null) {
    const page = await foods().findMany({}, { limit: CATALOGUE_LIMIT });
    catalogue = page.items;
  }
  return catalogue;
};

const componentColumn = async (
  componentCode: string,
): Promise<readonly FoodNutrient[]> => {
  const cached = rankedComponents.get(componentCode);
  if (cached) {
    return cached;
  }
  const page = await nutrients().findMany(
    { componentCode },
    { limit: CATALOGUE_LIMIT },
  );
  rankedComponents.set(componentCode, page.items);
  return page.items;
};

export type FoodSearch = {
  /** Matched against the accent-stripped name, so « boeuf » finds « bœuf ». */
  query?: string;
  /** CIQUAL group code — `02` is « fruits, légumes, légumineuses… ». */
  group?: string;
  limit?: number;
};

/** How many results a search returns before it stops being a list. */
const SEARCH_LIMIT = 50;

/**
 * Foods whose name contains the query, accent- and case-insensitively.
 *
 * Substring rather than prefix: « sardine » should find « Sardine, filet, à
 * l'huile d'olive, appertisé, égoutté », and nobody types a CIQUAL name from
 * the front. Shorter names first, so the plain ingredient beats the prepared
 * dish that merely mentions it.
 */
export const searchFoods = async (
  search?: FoodSearch,
): Promise<readonly Food[]> => {
  const query = normaliseNutritionText(search?.query ?? "");
  const group = search?.group ?? "";

  return (await allFoods())
    .filter((food) => group === "" || food.groupCode === group)
    .filter((food) => query === "" || food.searchName.includes(query))
    .sort(
      (a, b) =>
        a.nameFr.length - b.nameFr.length || a.nameFr.localeCompare(b.nameFr),
    )
    .slice(0, search?.limit ?? SEARCH_LIMIT);
};

export const getFood = async (code: string): Promise<Result<Food>> => {
  const page = await foods().findMany({ code }, { limit: 1 });
  const food = page.items[0];
  return food ? ok(food) : err("not_found", "no such food");
};

/**
 * A food's composition — every component the export carries for it, including
 * the ones it never determined, because "not measured" is an answer a reader
 * needs and a blank row is not.
 */
export const getFoodNutrients = async (
  code: string,
): Promise<readonly FoodNutrient[]> => {
  const page = await nutrients().findMany(
    { foodCode: code },
    { limit: PER_FOOD_LIMIT },
  );
  return [...page.items].sort((a, b) =>
    a.componentCode.localeCompare(b.componentCode),
  );
};

/** A ranked food and the value it was ranked on. */
export type RankedFood = {
  food: Food;
  nutrient: FoodNutrient;
};

export type RankQuery = {
  /** CIQUAL `const_code` — from `nutrientComponents` in `/shared`. */
  componentCode: string;
  /** Restrict to one CIQUAL group. */
  group?: string;
  /** CIQUAL food codes to leave out — what the profile rules out. */
  excludeCodes?: readonly string[];
  /** Whole groups to leave out — « pas d'alcool », « pas de produits laitiers ». */
  excludeGroups?: readonly string[];
  /**
   * Include `traces` and `< x` values in the ranking. Off by default: `< 20`
   * is an upper bound, so including it would rank an unmeasured food above one
   * measured at 5.
   */
  includeUncertain?: boolean;
  limit?: number;
};

const RANK_LIMIT = 20;

const RANKABLE: readonly NutrientMarker[] = ["exact"];
const RANKABLE_UNCERTAIN: readonly NutrientMarker[] = [
  "exact",
  "traces",
  "less_than",
];

/**
 * The foods richest in one component, per 100 g, after the exclusions.
 *
 * `not_determined` is never ranked, whatever `includeUncertain` says: there is
 * no number to rank on, and putting an unmeasured food at the bottom would
 * state something the table does not.
 */
export const rankFoodsByComponent = async (
  query: RankQuery,
): Promise<readonly RankedFood[]> => {
  const excluded = new Set(query.excludeCodes ?? []);
  const excludedGroups = new Set(query.excludeGroups ?? []);
  const allowed = query.includeUncertain ? RANKABLE_UNCERTAIN : RANKABLE;

  const byCode = new Map((await allFoods()).map((food) => [food.code, food]));
  const column = await componentColumn(query.componentCode);

  return column
    .flatMap((nutrient) => {
      const food = byCode.get(nutrient.foodCode);
      if (!food || nutrient.value === null) {
        return [];
      }
      if (!allowed.includes(nutrient.marker)) {
        return [];
      }
      if (excluded.has(food.code) || excludedGroups.has(food.groupCode)) {
        return [];
      }
      if (query.group !== undefined && food.groupCode !== query.group) {
        return [];
      }
      return [{ food, nutrient }];
    })
    .sort(
      (a, b) =>
        (b.nutrient.value ?? 0) - (a.nutrient.value ?? 0) ||
        a.food.nameFr.localeCompare(b.food.nameFr),
    )
    .slice(0, query.limit ?? RANK_LIMIT);
};

/**
 * Every named CIQUAL group in the catalogue, for the console's filter.
 *
 * Named, because the published 2025 export has one food — 24999, « Dessert
 * (aliment moyen) » — whose group code `00` the group file never defines. The
 * importer records that faithfully rather than inventing a name for it, and a
 * dropdown has nothing to render for a group with no name, so it is left out
 * here. The food itself is still in the catalogue and still found by search;
 * only the filter row is missing, which is the honest outcome of the source
 * having no label for it.
 */
export const listFoodGroups = async (): Promise<
  readonly { code: string; nameFr: string }[]
> => {
  const seen = new Map<string, string>();
  for (const food of await allFoods()) {
    if (food.groupNameFr !== "" && !seen.has(food.groupCode)) {
      seen.set(food.groupCode, food.groupNameFr);
    }
  }
  return [...seen.entries()]
    .map(([code, nameFr]) => ({ code, nameFr }))
    .sort((a, b) => a.code.localeCompare(b.code));
};

/**
 * The newest import, or null when none has run.
 *
 * Null is a real answer the console renders — « aucun import » — rather than an
 * error: a deployment whose database has no CIQUAL in it yet is a normal state,
 * not a fault.
 */
export const getCiqualImport = async (): Promise<CiqualImport | null> => {
  const page = await imports().findMany({}, { limit: 20 });
  return (
    [...page.items].sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
    )[0] ?? null
  );
};
