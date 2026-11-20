import { beforeEach, describe, expect, it } from "vitest";
import {
  checkCompatibility,
  mayBeShown,
  type PatientSafetyData,
} from "../../../ai/compatibility";
import { kitchenQuantityText } from "../../../shared/kitchen-units";
import { registerDatabase, type DatabaseClient } from "../../client";
import { loadCiqualFixture } from "../../fixtures/ciqual";
import type { AuditEvent } from "../../models/audit-event";
import type { Food } from "../../models/food";
import { createMemoryDatabase } from "../../test-helpers";
import { getFood, refreshFoodCatalogue } from "../foods";
import {
  confirmFoodRecord,
  confirmFoodUnits,
  confirmedKitchenUnits,
  gateFoodsByCode,
  getFoodRecord,
  listConfirmedCookableFoods,
  listFoodRecords,
  listFoodRecordsToConfirm,
  recipeFoodsByCode,
  storeFoodProposal,
  type FoodRecordProposal,
} from "./index";

/**
 * The food records against the committed CIQUAL subset, through the in-memory
 * client. The codes are foods of the subset: rice, a hard-boiled egg, coconut
 * milk and dry pasta.
 */
const RICE = "9100";
const EGG = "22010";
const COCONUT_MILK = "18041";
const PASTA = "9810";

const operator = {
  id: "00000000-0000-4000-8000-0000000000aa",
  email: "morgane@example.test",
  name: "Morgane",
};

const TODAY = "2026-11-20";

const noExclusion: PatientSafetyData = {
  allergens: [],
  noKnownAllergies: true,
  noKnownIntolerances: true,
  celiacDisease: false,
  diet: "omnivore",
  evictions: [],
};

const eggAllergy: PatientSafetyData = {
  ...noExclusion,
  noKnownAllergies: false,
  allergens: [{ kind: "allergy", key: "eggs", subKey: null, otherText: null }],
};

const proposal = (
  overrides: Partial<FoodRecordProposal> = {},
): FoodRecordProposal => ({
  cookable: true,
  containsTags: ["eggs"],
  mayContainTags: [],
  role: "protein",
  kitchenUnits: {
    densityGPerMl: null,
    units: [{ one: "œuf", many: "œufs", grams: 55 }],
  },
  model: "test/model",
  ...overrides,
});

let client: DatabaseClient;
const registered = new Proxy({} as DatabaseClient, {
  get: (_target, key) => client[key as keyof DatabaseClient],
});

const foodOf = async (code: string): Promise<Food> => {
  const food = await getFood(code);
  if (!food.ok) {
    throw new Error(`the subset no longer carries the food ${code}`);
  }
  return food.data;
};

const auditOf = async (action: AuditEvent["action"]) =>
  (
    await client
      .collection<AuditEvent>("audit_events")
      .findMany({ action }, { limit: 50 })
  ).items;

const gate = async (patient: PatientSafetyData, ...codes: string[]) =>
  checkCompatibility(
    patient,
    {
      kind: "recipe",
      ingredients: (await gateFoodsByCode(codes)).map((food) => ({
        name: food.name,
        food,
      })),
    },
    TODAY,
  );

beforeEach(async () => {
  // The registry accepts one adapter only. Thus the registered adapter is one
  // stable object that reads the fresh database of the test.
  client = createMemoryDatabase();
  registerDatabase(registered);
  await loadCiqualFixture(client);
  refreshFoodCatalogue();
});

describe("confirmFoodRecord", () => {
  it("writes a confirmed record with the account and the date", async () => {
    const result = await confirmFoodRecord(operator, RICE, {
      cookable: true,
      containsTags: ["carb"],
      mayContainTags: [],
      role: "starch",
    });
    expect(result).toMatchObject({
      ok: true,
      data: {
        foodCode: RICE,
        cookable: true,
        containsTags: ["carb"],
        role: "starch",
        status: "confirmed",
        source: "person",
        confirmedById: operator.id,
        confirmedByName: "Morgane",
        lexiconId: "riz",
        unitsStatus: null,
      },
    });
    expect((await getFoodRecord(RICE))?.confirmedAt).toBeInstanceOf(Date);
  });

  it("writes one audit event for each confirmation", async () => {
    await confirmFoodRecord(operator, RICE, {
      cookable: true,
      containsTags: ["carb"],
      mayContainTags: [],
      role: "starch",
    });
    const events = await auditOf("food_record.confirmed");
    expect(events).toHaveLength(1);
    expect(events[0]).toMatchObject({
      actorId: operator.id,
      actorName: "Morgane",
      targetType: "food",
      targetId: RICE,
      targetLabel: "Riz blanc, cru",
    });
    expect(JSON.parse(events[0]?.detail ?? "{}")).toMatchObject({
      code: RICE,
      before: null,
      cookable: true,
      role: "starch",
      contains: ["carb"],
    });
  });

  it("confirms and corrects a proposal of REMI", async () => {
    await storeFoodProposal(operator, await foodOf(EGG), proposal());
    const result = await confirmFoodRecord(operator, EGG, {
      cookable: true,
      containsTags: ["eggs", " eggs "],
      mayContainTags: ["eggs", "milk"],
      role: "protein",
    });
    expect(result).toMatchObject({
      ok: true,
      data: {
        status: "confirmed",
        source: "remi",
        containsTags: ["eggs"],
        // The food contains eggs: « can contain eggs » says less, and goes.
        mayContainTags: ["milk"],
        // The units wait for their own confirmation.
        unitsStatus: "proposed",
      },
    });
    expect((await listFoodRecords()).size).toBe(1);
    const [event] = await auditOf("food_record.confirmed");
    expect(JSON.parse(event?.detail ?? "{}")).toMatchObject({
      before: "proposed",
      source: "remi",
    });
  });

  it("lets a person say that a food is not « cuisinable », with no role", async () => {
    const result = await confirmFoodRecord(operator, PASTA, {
      cookable: false,
      containsTags: [],
      mayContainTags: [],
      role: null,
    });
    expect(result).toMatchObject({
      ok: true,
      data: { cookable: false, role: null, status: "confirmed" },
    });
    expect(await listConfirmedCookableFoods()).toEqual([]);
  });

  it.each([
    [
      "a tag that the gate does not know",
      {
        cookable: true,
        containsTags: ["dairy"],
        mayContainTags: [],
        role: "fat",
      },
      "the compatibility gate does not know this tag",
    ],
    [
      "an unknown tag among the traces",
      {
        cookable: true,
        containsTags: [],
        mayContainTags: ["nuts"],
        role: "fat",
      },
      "the compatibility gate does not know this tag",
    ],
    [
      "an unknown role",
      { cookable: true, containsTags: [], mayContainTags: [], role: "dessert" },
      "this role in a dish does not exist",
    ],
    [
      "a cookable food with no role",
      { cookable: true, containsTags: [], mayContainTags: [], role: "" },
      "a cookable food needs a role in a dish",
    ],
  ])("refuses %s, and writes nothing", async (_label, values, message) => {
    expect(await confirmFoodRecord(operator, RICE, values)).toEqual({
      ok: false,
      error: "invalid_input",
      message,
    });
    expect(await getFoodRecord(RICE)).toBeNull();
    expect(await auditOf("food_record.confirmed")).toEqual([]);
  });

  it("refuses a code that CIQUAL does not have", async () => {
    expect(
      await confirmFoodRecord(operator, "no-such-code", {
        cookable: false,
        containsTags: [],
        mayContainTags: [],
        role: null,
      }),
    ).toMatchObject({ ok: false, error: "not_found" });
  });
});

describe("storeFoodProposal", () => {
  it("stores a proposed record and proposed units, with an audit event", async () => {
    const result = await storeFoodProposal(
      operator,
      await foodOf(EGG),
      proposal({
        containsTags: ["eggs", "not-a-tag"],
        mayContainTags: ["eggs"],
      }),
    );
    expect(result).toMatchObject({
      ok: true,
      data: {
        foodCode: EGG,
        status: "proposed",
        source: "remi",
        proposedModel: "test/model",
        // The unknown tag is dropped. The form could not show it.
        containsTags: ["eggs"],
        mayContainTags: [],
        confirmedAt: null,
        confirmedById: null,
        unitsStatus: "proposed",
        unitsConfirmedAt: null,
      },
    });
    expect(await auditOf("food_record.proposed")).toHaveLength(1);
    expect(await auditOf("food_record.confirmed")).toEqual([]);
  });

  it("stores no units status when REMI proposed no unit", async () => {
    const result = await storeFoodProposal(
      operator,
      await foodOf(RICE),
      proposal({ kitchenUnits: null, containsTags: ["carb"], role: "starch" }),
    );
    expect(result).toMatchObject({
      ok: true,
      data: { unitsStatus: null, units: [], densityGPerMl: null },
    });
  });

  it("never replaces a record that exists", async () => {
    await confirmFoodRecord(operator, EGG, {
      cookable: true,
      containsTags: ["eggs"],
      mayContainTags: [],
      role: "protein",
    });
    expect(
      await storeFoodProposal(
        operator,
        await foodOf(EGG),
        proposal({ containsTags: [] }),
      ),
    ).toEqual({
      ok: false,
      error: "conflict",
      message: "this food already has a record",
    });
    expect((await getFoodRecord(EGG))?.containsTags).toEqual(["eggs"]);
  });
});

describe("confirmFoodUnits", () => {
  it("needs a record first", async () => {
    expect(
      await confirmFoodUnits(operator, EGG, { densityGPerMl: null, units: [] }),
    ).toEqual({
      ok: false,
      error: "conflict",
      message: "this food has no record yet",
    });
  });

  it("confirms the units with the account, the date and an audit event", async () => {
    await storeFoodProposal(operator, await foodOf(EGG), proposal());
    const result = await confirmFoodUnits(operator, EGG, {
      densityGPerMl: null,
      units: [{ one: "œuf", many: "œufs", grams: 60 }],
    });
    expect(result).toMatchObject({
      ok: true,
      data: {
        // The record itself still waits.
        status: "proposed",
        unitsStatus: "confirmed",
        units: [{ one: "œuf", many: "œufs", grams: 60 }],
        unitsConfirmedById: operator.id,
        unitsConfirmedByName: "Morgane",
      },
    });
    const events = await auditOf("food_record.units_confirmed");
    expect(events).toHaveLength(1);
    expect(JSON.parse(events[0]?.detail ?? "{}")).toMatchObject({
      code: EGG,
      before: "proposed",
      units: [{ one: "œuf", many: "œufs", grams: 60 }],
    });
  });

  it("accepts « no unit »: the food then shows in grams", async () => {
    await storeFoodProposal(operator, await foodOf(EGG), proposal());
    const result = await confirmFoodUnits(operator, EGG, {
      densityGPerMl: null,
      units: [],
    });
    expect(result).toMatchObject({
      ok: true,
      data: { unitsStatus: "confirmed", units: [] },
    });
  });

  it("refuses units that are not valid, and a code that CIQUAL does not have", async () => {
    await storeFoodProposal(operator, await foodOf(EGG), proposal());
    expect(
      await confirmFoodUnits(operator, EGG, {
        densityGPerMl: null,
        units: [{ one: "œuf", many: "œufs", grams: 0 }],
      }),
    ).toEqual({
      ok: false,
      error: "invalid_input",
      message: "the kitchen units are not valid",
    });
    expect((await getFoodRecord(EGG))?.unitsStatus).toBe("proposed");
    expect(
      await confirmFoodUnits(operator, "no-such-code", {
        densityGPerMl: null,
        units: [],
      }),
    ).toMatchObject({ ok: false, error: "not_found" });
  });
});

describe("confirmedKitchenUnits", () => {
  it("gives the units only after a person confirmed them", async () => {
    await storeFoodProposal(operator, await foodOf(EGG), proposal());
    const proposed = await getFoodRecord(EGG);
    expect(confirmedKitchenUnits(proposed)).toBeNull();
    // No confirmed unit: grams, and no invented value.
    expect(kitchenQuantityText(110, confirmedKitchenUnits(proposed))).toBe(
      "110 g",
    );

    await confirmFoodUnits(operator, EGG, {
      densityGPerMl: null,
      units: [{ one: "œuf", many: "œufs", grams: 55 }],
    });
    const confirmed = confirmedKitchenUnits(await getFoodRecord(EGG));
    expect(kitchenQuantityText(110, confirmed)).toBe("2 œufs");
    expect(confirmedKitchenUnits(null)).toBeNull();
  });
});

describe("the queue « À confirmer »", () => {
  it("lists a proposed record and proposed units, by French name", async () => {
    await storeFoodProposal(
      operator,
      await foodOf(RICE),
      proposal({ kitchenUnits: null, containsTags: ["carb"], role: "starch" }),
    );
    await storeFoodProposal(operator, await foodOf(EGG), proposal());
    await confirmFoodRecord(operator, EGG, {
      cookable: true,
      containsTags: ["eggs"],
      mayContainTags: [],
      role: "protein",
    });
    await confirmFoodRecord(operator, PASTA, {
      cookable: false,
      containsTags: [],
      mayContainTags: [],
      role: null,
    });

    const queue = await listFoodRecordsToConfirm();
    expect(
      queue.map((line) => [
        line.food.code,
        line.recordProposed,
        line.unitsProposed,
      ]),
    ).toEqual([
      // « Oeuf dur »: the record is confirmed, the units still wait.
      [EGG, false, true],
      // « Riz blanc, cru »: the record waits, and REMI proposed no unit.
      [RICE, true, false],
    ]);

    await confirmFoodUnits(operator, EGG, { densityGPerMl: null, units: [] });
    expect(
      (await listFoodRecordsToConfirm()).map((line) => line.food.code),
    ).toEqual([RICE]);
  });
});

describe("the foods that a generation can use (D-30)", () => {
  it("holds a confirmed « cuisinable » food only", async () => {
    await storeFoodProposal(operator, await foodOf(EGG), proposal());
    await storeFoodProposal(
      operator,
      await foodOf(RICE),
      proposal({ kitchenUnits: null, containsTags: ["carb"], role: "starch" }),
    );
    expect(await listConfirmedCookableFoods()).toEqual([]);

    await confirmFoodRecord(operator, RICE, {
      cookable: true,
      containsTags: ["carb"],
      mayContainTags: [],
      role: "starch",
    });
    const usable = await listConfirmedCookableFoods();
    expect(usable).toHaveLength(1);
    expect(usable[0]).toMatchObject({
      food: { code: RICE, nameFr: "Riz blanc, cru" },
      role: "starch",
      kitchenUnits: null,
      confirmedByName: "Morgane",
      gateFood: {
        code: RICE,
        name: "Riz blanc, cru",
        status: "confirmed",
        cookable: true,
        contains: ["carb"],
        lexiconId: "riz",
      },
    });
  });

  it("gives the gate each confirmed food, and the gate knows it", async () => {
    await confirmFoodRecord(operator, RICE, {
      cookable: true,
      containsTags: ["carb"],
      mayContainTags: [],
      role: "starch",
    });
    await confirmFoodRecord(operator, EGG, {
      cookable: true,
      containsTags: ["eggs"],
      mayContainTags: [],
      role: "protein",
    });
    await confirmFoodRecord(operator, COCONUT_MILK, {
      cookable: true,
      containsTags: [],
      mayContainTags: [],
      role: "liquid",
    });

    for (const usable of await listConfirmedCookableFoods()) {
      const result = checkCompatibility(
        noExclusion,
        {
          kind: "recipe",
          ingredients: [{ name: usable.food.nameFr, food: usable.gateFood }],
        },
        TODAY,
      );
      expect(result).toEqual({ status: "compatible" });
    }
    expect(mayBeShown(await gate(noExclusion, RICE, EGG, COCONUT_MILK))).toBe(
      true,
    );
    expect((await gate(eggAllergy, RICE, EGG)).status).toBe("incompatible");
    expect(await gate(eggAllergy, RICE, COCONUT_MILK)).toEqual({
      status: "compatible",
    });
  });

  it("never shows as safe a food whose record is not confirmed", async () => {
    await confirmFoodRecord(operator, RICE, {
      cookable: true,
      containsTags: ["carb"],
      mayContainTags: [],
      role: "starch",
    });
    await storeFoodProposal(
      operator,
      await foodOf(COCONUT_MILK),
      proposal({ kitchenUnits: null, containsTags: [], role: "liquid" }),
    );

    // A proposal of REMI.
    const proposed = await gate(noExclusion, RICE, COCONUT_MILK);
    expect(proposed.status).toBe("uncertain");
    expect(mayBeShown(proposed)).toBe(false);
    // A food with no record, and a code that CIQUAL does not have.
    expect((await gate(noExclusion, RICE, PASTA)).status).toBe("uncertain");
    expect((await gateFoodsByCode(["no-such-code"]))[0]).toMatchObject({
      status: "none",
      cookable: false,
    });
    // A confirmed food that is not « cuisinable ».
    await confirmFoodRecord(operator, PASTA, {
      cookable: false,
      containsTags: ["gluten:wheat"],
      mayContainTags: [],
      role: null,
    });
    expect((await gate(noExclusion, RICE, PASTA)).status).toBe("uncertain");
  });
});

describe("recipeFoodsByCode", () => {
  it("reads nothing for a recipe with no CIQUAL code", async () => {
    const foods = await recipeFoodsByCode([]);
    expect(foods.gate.size).toBe(0);
    expect(foods.units.size).toBe(0);
  });

  it("gives the gate food of each code, and the units that a person confirmed", async () => {
    // The egg: a confirmed record, and confirmed units.
    await storeFoodProposal(operator, await foodOf(EGG), proposal());
    await confirmFoodRecord(operator, EGG, {
      cookable: true,
      containsTags: ["eggs"],
      mayContainTags: [],
      role: "protein",
    });
    await confirmFoodUnits(operator, EGG, {
      densityGPerMl: null,
      units: [{ one: "œuf", many: "œufs", grams: 55 }],
    });
    // The pasta: a proposal of REMI that no person confirmed.
    await storeFoodProposal(
      operator,
      await foodOf(PASTA),
      proposal({ containsTags: ["gluten"], role: "starch" }),
    );

    const foods = await recipeFoodsByCode([EGG, PASTA, RICE, EGG, "0"]);

    expect(foods.gate.get(EGG)).toMatchObject({
      status: "confirmed",
      cookable: true,
      contains: ["eggs"],
    });
    expect(foods.gate.get(PASTA)?.status).toBe("proposed");
    expect(foods.gate.get(RICE)?.status).toBe("none");
    // A code that CIQUAL does not have.
    expect(foods.gate.get("0")?.status).toBe("none");

    expect(foods.units.get(EGG)).toEqual({
      densityGPerMl: null,
      units: [{ one: "œuf", many: "œufs", grams: 55 }],
    });
    // Proposed units are not read: the food shows in grams.
    expect(foods.units.has(PASTA)).toBe(false);
    expect(foods.units.has(RICE)).toBe(false);
  });
});
