import {
  isGateTag,
  lexiconIdOfFoodName,
  type GateFood,
} from "../../../ai/compatibility";
import {
  isDishRole,
  type DishRole,
  type FoodRecordStatus,
} from "../../../shared/food-record";
import {
  foodKitchenUnitsSchema,
  type FoodKitchenUnits,
  type FoodUnit,
} from "../../../shared/kitchen-units";
import { err, ok, type Result } from "../../../shared/result";
import type { Id } from "../../../types";
import { getDatabase } from "../../client";
import type { Food } from "../../models/food";
import type { FoodRecord } from "../../models/food-record";
import { recordAuditEvent } from "../audit";
import { getFood, getFoodsByCode } from "../foods";

/**
 * The food records — REM-189 and REM-190.
 *
 * A record belongs to one CIQUAL food, by its code. REMI proposes it
 * (`server/foods/propose.ts`) and a person confirms it on « Aliments ». The
 * rules, which no caller can skip:
 * - Only a confirmation by a person sets `confirmed`. A proposal is an aid to
 *   entry, never a safety decision.
 * - A confirmation holds tags of the gate's vocabulary only (`isGateTag`).
 *   Thus the gate knows each confirmed food.
 * - `listConfirmedCookableFoods` is the one list of the foods that a
 *   generation can use. A food with no confirmed record is not in it (D-30).
 * - Each confirmation writes an audit event with the account (D-32).
 *
 * Reference data: the access is the access of the page « Aliments », which
 * each console account has. The record holds no patient data.
 */

const records = () => getDatabase().collection<FoodRecord>("food_records");

/** Headroom over the few hundred foods that everyday cooking needs. */
const RECORDS_LIMIT = 4000;

/** The console account that acts. It is the actor of the audit event. */
export type FoodRecordOperator = { id: Id; email: string; name: string };

const actorOf = (operator: FoodRecordOperator) => ({
  id: operator.id,
  email: operator.email,
  name: operator.name,
});

export const getFoodRecord = async (
  foodCode: string,
): Promise<FoodRecord | null> => {
  const page = await records().findMany({ foodCode }, { limit: 1 });
  return page.items[0] ?? null;
};

/** Each record, by CIQUAL code. */
export const listFoodRecords = async (): Promise<
  ReadonlyMap<string, FoodRecord>
> => {
  const page = await records().findMany({}, { limit: RECORDS_LIMIT });
  return new Map(page.items.map((record) => [record.foodCode, record]));
};

/** One line of the queue « À confirmer ». */
export type FoodRecordToConfirm = {
  food: Food;
  record: FoodRecord;
  /** The record itself waits for a person. */
  recordProposed: boolean;
  /** The kitchen units wait for a person. */
  unitsProposed: boolean;
};

/**
 * The queue « À confirmer »: each food with a proposed record or with proposed
 * units, in the order of the French name. A record whose code CIQUAL does not
 * have any more is left out: there is no food to show.
 */
export const listFoodRecordsToConfirm = async (): Promise<
  readonly FoodRecordToConfirm[]
> => {
  const [byStatus, byUnits] = await Promise.all([
    records().findMany({ status: "proposed" }, { limit: RECORDS_LIMIT }),
    records().findMany({ unitsStatus: "proposed" }, { limit: RECORDS_LIMIT }),
  ]);
  const waiting = new Map(
    [...byStatus.items, ...byUnits.items].map((record) => [
      record.foodCode,
      record,
    ]),
  );
  const foods = await getFoodsByCode([...waiting.keys()]);
  return [...waiting.values()]
    .flatMap((record) => {
      const food = foods.get(record.foodCode);
      return food
        ? [
            {
              food,
              record,
              recordProposed: record.status === "proposed",
              unitsProposed: record.unitsStatus === "proposed",
            },
          ]
        : [];
    })
    .sort((a, b) => a.food.nameFr.localeCompare(b.food.nameFr, "fr"));
};

/* ───────────────────────── the record ───────────────────────── */

export type FoodRecordValues = {
  cookable: boolean;
  containsTags: readonly string[];
  mayContainTags: readonly string[];
  /** A key of `dishRoles`, or null. A « cuisinable » food needs one. */
  role: string | null;
};

type CheckedValues = {
  cookable: boolean;
  containsTags: string[];
  mayContainTags: string[];
  role: DishRole | null;
};

const cleanTags = (tags: readonly string[]) => [
  ...new Set(tags.map((tag) => tag.trim()).filter((tag) => tag !== "")),
];

/**
 * The values of a record, checked. A tag that the food contains is not also a
 * tag that it can contain: the stronger statement stays.
 */
const checkedValues = (values: FoodRecordValues): Result<CheckedValues> => {
  const containsTags = cleanTags(values.containsTags);
  const mayContainTags = cleanTags(values.mayContainTags).filter(
    (tag) => !containsTags.includes(tag),
  );
  if (![...containsTags, ...mayContainTags].every(isGateTag)) {
    return err(
      "invalid_input",
      "the compatibility gate does not know this tag",
    );
  }
  const role = values.role === null || values.role === "" ? null : values.role;
  if (role !== null && !isDishRole(role)) {
    return err("invalid_input", "this role in a dish does not exist");
  }
  if (values.cookable && role === null) {
    return err("invalid_input", "a cookable food needs a role in a dish");
  }
  return ok({ cookable: values.cookable, containsTags, mayContainTags, role });
};

const NO_FOOD = err("not_found", "no such food");

/**
 * A person confirms the record of a food, with the values of the form: this is
 * also how a person corrects a proposal, and how a person writes a record for
 * a food that has none. The record is `confirmed` from now, with the account
 * and the date.
 */
export const confirmFoodRecord = async (
  operator: FoodRecordOperator,
  foodCode: string,
  values: FoodRecordValues,
): Promise<Result<FoodRecord>> => {
  const food = await getFood(foodCode);
  if (!food.ok) {
    return NO_FOOD;
  }
  const checked = checkedValues(values);
  if (!checked.ok) {
    return checked;
  }
  const existing = await getFoodRecord(foodCode);
  const confirmation = {
    ...checked.data,
    status: "confirmed" as const,
    lexiconId: lexiconIdOfFoodName(food.data.nameFr),
    confirmedAt: new Date(),
    confirmedById: operator.id,
    confirmedByName: operator.name,
  };
  const saved = existing
    ? await records().update(existing.id, confirmation)
    : await records().insert({
        foodCode,
        ...confirmation,
        source: "person",
        proposedModel: "",
        densityGPerMl: null,
        units: [],
        unitsStatus: null,
        unitsConfirmedAt: null,
        unitsConfirmedById: null,
        unitsConfirmedByName: "",
      });
  if (!saved) {
    return NO_FOOD;
  }
  await recordAuditEvent({
    actor: actorOf(operator),
    action: "food_record.confirmed",
    targetType: "food",
    targetId: foodCode,
    targetLabel: food.data.nameFr,
    detail: JSON.stringify({
      code: foodCode,
      before: existing?.status ?? null,
      source: saved.source,
      cookable: saved.cookable,
      role: saved.role,
      contains: saved.containsTags,
      mayContain: saved.mayContainTags,
    }),
  });
  return ok(saved);
};

/* ───────────────────────── the kitchen units ───────────────────────── */

/**
 * A person confirms the kitchen units of a food: its density and its own
 * units. The food needs a record first, proposed or confirmed. An empty list
 * with no density is a valid answer: the food then shows in grams.
 */
export const confirmFoodUnits = async (
  operator: FoodRecordOperator,
  foodCode: string,
  values: { densityGPerMl: number | null; units: readonly FoodUnit[] },
): Promise<Result<FoodRecord>> => {
  const food = await getFood(foodCode);
  if (!food.ok) {
    return NO_FOOD;
  }
  const existing = await getFoodRecord(foodCode);
  if (!existing) {
    return err("conflict", "this food has no record yet");
  }
  const checked = foodKitchenUnitsSchema.safeParse(values);
  if (!checked.success) {
    return err("invalid_input", "the kitchen units are not valid");
  }
  const saved = await records().update(existing.id, {
    densityGPerMl: checked.data.densityGPerMl,
    units: checked.data.units,
    unitsStatus: "confirmed",
    unitsConfirmedAt: new Date(),
    unitsConfirmedById: operator.id,
    unitsConfirmedByName: operator.name,
  });
  if (!saved) {
    return NO_FOOD;
  }
  await recordAuditEvent({
    actor: actorOf(operator),
    action: "food_record.units_confirmed",
    targetType: "food",
    targetId: foodCode,
    targetLabel: food.data.nameFr,
    detail: JSON.stringify({
      code: foodCode,
      before: existing.unitsStatus,
      densityGPerMl: saved.densityGPerMl,
      units: saved.units,
    }),
  });
  return ok(saved);
};

/* ───────────────────────── REMI's proposal ───────────────────────── */

/** What REMI's model proposed, after the code checked it. */
export type FoodRecordProposal = {
  cookable: boolean;
  containsTags: readonly string[];
  mayContainTags: readonly string[];
  role: DishRole | null;
  kitchenUnits: FoodKitchenUnits | null;
  /** The model id of the call. */
  model: string;
};

/**
 * Store a proposal of REMI for a food that has no record. The record and its
 * units are `proposed`: nothing reads them as a fact until a person confirms.
 * A food that has a record already is refused: a proposal never replaces what
 * a person confirmed. A tag that the gate does not know is dropped, because
 * the form could not show it.
 */
export const storeFoodProposal = async (
  operator: FoodRecordOperator,
  food: Food,
  proposal: FoodRecordProposal,
): Promise<Result<FoodRecord>> => {
  if (await getFoodRecord(food.code)) {
    return err("conflict", "this food already has a record");
  }
  const containsTags = cleanTags(proposal.containsTags).filter(isGateTag);
  const units = proposal.kitchenUnits;
  const saved = await records().insert({
    foodCode: food.code,
    cookable: proposal.cookable,
    containsTags,
    mayContainTags: cleanTags(proposal.mayContainTags)
      .filter(isGateTag)
      .filter((tag) => !containsTags.includes(tag)),
    role: proposal.role,
    status: "proposed",
    source: "remi",
    proposedModel: proposal.model,
    lexiconId: lexiconIdOfFoodName(food.nameFr),
    confirmedAt: null,
    confirmedById: null,
    confirmedByName: "",
    densityGPerMl: units?.densityGPerMl ?? null,
    units: units?.units ?? [],
    unitsStatus: units ? "proposed" : null,
    unitsConfirmedAt: null,
    unitsConfirmedById: null,
    unitsConfirmedByName: "",
  });
  await recordAuditEvent({
    actor: actorOf(operator),
    action: "food_record.proposed",
    targetType: "food",
    targetId: food.code,
    targetLabel: food.nameFr,
    detail: JSON.stringify({ code: food.code, model: proposal.model }),
  });
  return ok(saved);
};

/* ───────────────────────── what a generation reads ───────────────────────── */

/** True for a record that a person confirmed, with tags that the gate knows. */
const usable = (record: FoodRecord) =>
  record.status === "confirmed" &&
  record.cookable &&
  [...record.containsTags, ...record.mayContainTags].every(isGateTag);

/** The confirmed units of a record, or null: the food then shows in grams. */
export const confirmedKitchenUnits = (
  record: Pick<FoodRecord, "unitsStatus" | "densityGPerMl" | "units"> | null,
): FoodKitchenUnits | null =>
  record !== null && record.unitsStatus === "confirmed"
    ? { densityGPerMl: record.densityGPerMl, units: record.units }
    : null;

const gateFoodOf = (
  code: string,
  food: Food | undefined,
  record: FoodRecord | undefined,
): GateFood => {
  const status: FoodRecordStatus | "none" = record?.status ?? "none";
  return {
    code,
    name: food?.nameFr ?? "",
    // A food that CIQUAL does not have is not a food of REMI.
    status: food ? status : "none",
    cookable: record?.cookable ?? false,
    contains: record?.containsTags ?? [],
    mayContain: record?.mayContainTags ?? [],
    lexiconId: record?.lexiconId ?? null,
  };
};

/** A food that a generation can use. */
export type ConfirmedCookableFood = {
  food: Food;
  role: DishRole;
  /** What the compatibility gate reads for this food. */
  gateFood: GateFood;
  /** Null when no person confirmed the units: the food shows in grams. */
  kitchenUnits: FoodKitchenUnits | null;
  confirmedAt: Date;
  confirmedByName: string;
};

/**
 * The one list of the foods that a generation can use: « cuisinable », with a
 * record that a person confirmed. A proposed record, a food with no record and
 * a record with a tag that the gate does not know are not in it (D-30).
 */
export const listConfirmedCookableFoods = async (): Promise<
  readonly ConfirmedCookableFood[]
> => {
  const page = await records().findMany(
    { status: "confirmed" },
    { limit: RECORDS_LIMIT },
  );
  const confirmed = page.items.filter(usable);
  const foods = await getFoodsByCode(
    confirmed.map((record) => record.foodCode),
  );
  return confirmed
    .flatMap((record) => {
      const food = foods.get(record.foodCode);
      return food && record.role !== null && record.confirmedAt !== null
        ? [
            {
              food,
              role: record.role,
              gateFood: gateFoodOf(record.foodCode, food, record),
              kitchenUnits: confirmedKitchenUnits(record),
              confirmedAt: record.confirmedAt,
              confirmedByName: record.confirmedByName,
            },
          ]
        : [];
    })
    .sort((a, b) => a.food.nameFr.localeCompare(b.food.nameFr, "fr"));
};

/**
 * What the compatibility gate reads for each CIQUAL code, in the order of the
 * codes. A code with no record, or that CIQUAL does not have, gets the status
 * `none`: the gate then answers `uncertain`. Give the result as the `food` of
 * an ingredient of `checkCompatibility`.
 */
export const gateFoodsByCode = async (
  codes: readonly string[],
): Promise<readonly GateFood[]> => {
  const [foods, all] = await Promise.all([
    getFoodsByCode(codes),
    listFoodRecords(),
  ]);
  return codes.map((code) => gateFoodOf(code, foods.get(code), all.get(code)));
};

/** What a recipe reads of the foods that its ingredients name by a code. */
export type RecipeFoods = {
  /** What the gate reads for each code. `status` is `none` with no record. */
  gate: ReadonlyMap<string, GateFood>;
  /** The kitchen units of each code that has units that a person confirmed. */
  units: ReadonlyMap<string, FoodKitchenUnits>;
};

/**
 * The food record data of the CIQUAL codes of a recipe, in one read: what the
 * gate reads (`recipeGateItem`) and the confirmed kitchen units
 * (`ingredientAmountText`). A code that CIQUAL does not have has no units and
 * the gate status `none`. With no code, nothing is read.
 */
export const recipeFoodsByCode = async (
  codes: readonly string[],
): Promise<RecipeFoods> => {
  const unique = [...new Set(codes)];
  if (unique.length === 0) {
    return { gate: new Map(), units: new Map() };
  }
  const [foods, all] = await Promise.all([
    getFoodsByCode(unique),
    listFoodRecords(),
  ]);
  return {
    gate: new Map(
      unique.map((code) => [
        code,
        gateFoodOf(code, foods.get(code), all.get(code)),
      ]),
    ),
    units: new Map(
      unique.flatMap((code) => {
        const units = foods.has(code)
          ? confirmedKitchenUnits(all.get(code) ?? null)
          : null;
        return units === null ? [] : [[code, units] as const];
      }),
    ),
  };
};
