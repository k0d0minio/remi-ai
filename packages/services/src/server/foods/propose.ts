/**
 * REMI proposes a food record — REM-189 and REM-190.
 *
 * For a CIQUAL food with no record, the model of the role `fast` proposes
 * « cuisinable », the allergen tags, the role and the kitchen units. The code
 * checks the reply and stores it as `proposed`. A person confirms it on
 * « Aliments ».
 *
 * A proposal is an aid to entry, never a safety decision (D-30): the gate and
 * `listConfirmedCookableFoods` read a confirmed record only.
 *
 * The prompt holds the public CIQUAL name and groups of the food. It holds no
 * patient data. The seam writes the log line of the call.
 */

import { generateJson } from "../../ai";
import {
  gateTags,
  isGateTag,
  lexiconIdOfFoodName,
  lexiconTagsOf,
} from "../../ai/compatibility";
import {
  foodRecordPrompt,
  foodRecordProposalSchema,
  type FoodRecordProposalReply,
} from "../../ai/prompts/food-record";
import type { Food } from "../../db/models/food";
import type { FoodRecord } from "../../db/models/food-record";
import {
  getFoodRecord,
  listFoodRecords,
  storeFoodProposal,
  type FoodRecordOperator,
  type FoodRecordProposal,
} from "../../db/services/food-records";
import { getFood, getFoodsByCode, searchFoods } from "../../db/services/foods";
import {
  DENSITY_MAX,
  DENSITY_MIN,
  UNIT_GRAMS_MAX,
  UNIT_GRAMS_MIN,
  foodKitchenUnitsSchema,
  type FoodKitchenUnits,
} from "../../shared/kitchen-units";
import { normaliseNutritionText } from "../../shared/nutrition";
import { err, type Result } from "../../shared/result";
import { roleModel } from "../ai-models";
import { FIRST_LOT_FOODS, type FirstLotFood } from "./first-lot";

const PROPOSAL_MAX_TOKENS = 1024;

/** The prompt asks for three units at most. More is not a kitchen answer. */
const PROPOSED_UNITS_MAX = 3;

const within = (value: number, min: number, max: number) =>
  Number.isFinite(value) && value >= min && value <= max;

/**
 * The kitchen units of a reply, or null when the reply has none that the code
 * accepts. A value out of range is dropped: the code does not correct it.
 */
const proposedUnits = (
  reply: FoodRecordProposalReply,
): FoodKitchenUnits | null => {
  const seen = new Set<string>();
  const units = reply.units
    .map((unit) => ({
      one: unit.one.trim(),
      many: unit.many.trim() === "" ? unit.one.trim() : unit.many.trim(),
      grams: unit.grams,
    }))
    .filter((unit) => {
      const key = unit.one.toLowerCase();
      const keep =
        key !== "" &&
        !seen.has(key) &&
        within(unit.grams, UNIT_GRAMS_MIN, UNIT_GRAMS_MAX);
      seen.add(key);
      return keep;
    })
    .slice(0, PROPOSED_UNITS_MAX);
  const density =
    reply.densityGPerMl !== null &&
    within(reply.densityGPerMl, DENSITY_MIN, DENSITY_MAX)
      ? reply.densityGPerMl
      : null;
  if (density === null && units.length === 0) {
    return null;
  }
  const checked = foodKitchenUnitsSchema.safeParse({
    densityGPerMl: density,
    units,
  });
  return checked.success ? checked.data : null;
};

/**
 * The reply of the model as a proposal. Pure. A tag outside the gate's
 * vocabulary is dropped. For a food that a lexicon row names, the tags of the
 * row are added: the proposal never says less than the gate's own list.
 */
export const checkedFoodProposal = (
  food: Pick<Food, "nameFr">,
  reply: FoodRecordProposalReply,
  model: string,
): FoodRecordProposal => {
  const lexiconId = lexiconIdOfFoodName(food.nameFr);
  const lexicon = lexiconId === null ? null : lexiconTagsOf(lexiconId);
  const containsTags = [
    ...new Set([...reply.contains, ...(lexicon?.contains ?? [])]),
  ].filter(isGateTag);
  const mayContainTags = [
    ...new Set([...reply.mayContain, ...(lexicon?.mayContain ?? [])]),
  ]
    .filter(isGateTag)
    .filter((tag) => !containsTags.includes(tag));
  return {
    cookable: reply.cookable,
    containsTags,
    mayContainTags,
    role: reply.role,
    kitchenUnits: proposedUnits(reply),
    model,
  };
};

const proposeFor = async (
  operator: FoodRecordOperator,
  food: Food,
  model: string,
): Promise<Result<FoodRecord>> => {
  const { system, prompt } = foodRecordPrompt(food, gateTags());
  const generated = await generateJson(prompt, foodRecordProposalSchema, {
    role: "fast",
    model,
    system,
    maxTokens: PROPOSAL_MAX_TOKENS,
  });
  if (!generated.ok) {
    return err("upstream_failed", "the food proposal is not available");
  }
  return storeFoodProposal(
    operator,
    food,
    checkedFoodProposal(food, generated.data, model),
  );
};

/**
 * REMI proposes the record of one CIQUAL food that has none. The record is
 * stored as `proposed`. A food that has a record is refused: a proposal never
 * replaces what a person confirmed.
 */
export const proposeFoodRecord = async (
  operator: FoodRecordOperator,
  foodCode: string,
): Promise<Result<FoodRecord>> => {
  const food = await getFood(foodCode);
  if (!food.ok) {
    return food;
  }
  if (await getFoodRecord(foodCode)) {
    return err("conflict", "this food already has a record");
  }
  return proposeFor(operator, food.data, await roleModel("fast"));
};

/* ───────────────────────── the first lot ───────────────────────── */

/**
 * The CIQUAL food of one line of the lot. The code is tried first, and it
 * counts only when the name of that food starts with the name of the line: a
 * code that names another food proposes nothing. Then the shortest CIQUAL name
 * that starts with the name of the line.
 */
const lotFood = async (
  entry: FirstLotFood,
  byCode: ReadonlyMap<string, Food>,
): Promise<Food | null> => {
  const prefix = normaliseNutritionText(entry.name);
  const coded = byCode.get(entry.code);
  if (coded && coded.searchName.startsWith(prefix)) {
    return coded;
  }
  const found = await searchFoods({ query: entry.name });
  return found.find((food) => food.searchName.startsWith(prefix)) ?? null;
};

/** The calls of a lot that run at the same time. */
const LOT_CONCURRENCY = 4;

export type FirstLotOutcome = {
  /** The foods that got a proposal in this run. */
  proposed: number;
  /** The foods of the lot that had a record before this run. */
  alreadyRecorded: number;
  /** The foods whose proposal failed. A second run tries them again. */
  failed: number;
  /** The names of the lot that CIQUAL does not have. */
  notFound: readonly string[];
};

/**
 * REMI proposes a record for each food of the first lot that has none, so
 * that the tests can start. Each record waits for a person in the queue
 * « À confirmer ». A second run proposes only what is still missing.
 */
export const proposeFirstLot = async (
  operator: FoodRecordOperator,
  lot: readonly FirstLotFood[] = FIRST_LOT_FOODS,
): Promise<FirstLotOutcome> => {
  const byCode = await getFoodsByCode(lot.map((entry) => entry.code));
  const existing = await listFoodRecords();
  const notFound: string[] = [];
  const todo = new Map<string, Food>();
  let alreadyRecorded = 0;
  for (const entry of lot) {
    const food = await lotFood(entry, byCode);
    if (!food) {
      notFound.push(entry.name);
    } else if (existing.has(food.code)) {
      alreadyRecorded += 1;
    } else {
      todo.set(food.code, food);
    }
  }

  const model = await roleModel("fast");
  const queue = [...todo.values()];
  let proposed = 0;
  let failed = 0;
  const worker = async () => {
    for (let food = queue.shift(); food; food = queue.shift()) {
      const result = await proposeFor(operator, food, model);
      if (result.ok) {
        proposed += 1;
      } else {
        failed += 1;
      }
    }
  };
  await Promise.all(Array.from({ length: LOT_CONCURRENCY }, worker));
  return { proposed, alreadyRecorded, failed, notFound };
};
