import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { registerDatabase } from "../../db/client";
import { systemActor } from "../../db/services/access";
import { getAppSetting, setAppSetting } from "../../db/services/app-settings";
import { listAuditEvents } from "../../db/services/audit";
import { createMemoryDatabase } from "../../db/test-helpers";
import {
  defaultMealShareTable,
  type MealShareTable,
} from "../../shared/meal-shares";
import {
  MEAL_SHARES_SETTING_KEY,
  getMealShareSetting,
  mealShareTable,
  resetMealShareTable,
  setMealShareTable,
  type MealSharesOperator,
} from "./index";

const admin: MealSharesOperator = {
  id: "11111111-1111-4111-8111-111111111111",
  email: "jamie@example.com",
  name: "Jamie",
  role: "admin",
};

const practitioner: MealSharesOperator = {
  id: "22222222-2222-4222-8222-222222222222",
  email: "morgane@example.com",
  name: "Morgane",
  role: "practitioner",
};

/** A role that the console does not have: the service must refuse it. */
const stranger = {
  ...practitioner,
  role: "patient",
} as unknown as MealSharesOperator;

const copyOf = (table: MealShareTable): MealShareTable =>
  JSON.parse(JSON.stringify(table)) as MealShareTable;

/** A valid correction: 5 points of energy move from the breakfast to the lunch. */
const corrected = (): MealShareTable => {
  const table = copyOf(defaultMealShareTable);
  table.breakfast.protein_fat.energy = 20;
  table.lunch.complete_balanced.energy = 45;
  return table;
};

const events = async (action: "meal_shares.set" | "meal_shares.reset") =>
  listAuditEvents(systemActor, { action, limit: 500 });

beforeAll(() => {
  registerDatabase(createMemoryDatabase());
});

beforeEach(async () => {
  vi.spyOn(console, "info").mockImplementation(() => {});
  vi.spyOn(console, "error").mockImplementation(() => {});
  await resetMealShareTable(admin);
});

describe("the table, with no setting", () => {
  it("is the code default", async () => {
    expect(await mealShareTable()).toEqual(defaultMealShareTable);
    expect(await getMealShareSetting(practitioner)).toEqual({
      ok: true,
      data: {
        table: defaultMealShareTable,
        source: "default",
        setByName: null,
        setAt: null,
        storedValueRefused: false,
      },
    });
  });
});

describe("setMealShareTable", () => {
  it("stores the corrected table, with who set it and when", async () => {
    const result = await setMealShareTable(practitioner, corrected());
    expect(result).toMatchObject({
      ok: true,
      data: {
        table: corrected(),
        source: "setting",
        setByName: "Morgane",
        storedValueRefused: false,
      },
    });
    expect(result.ok && result.data.setAt).toBeInstanceOf(Date);
    expect(await mealShareTable()).toEqual(corrected());
  });

  it("writes an audit event with each cell that changed", async () => {
    const before = (await events("meal_shares.set")).length;
    await setMealShareTable(admin, corrected());
    const written = await events("meal_shares.set");
    expect(written).toHaveLength(before + 1);
    expect(
      written.map((event) => JSON.parse(event.detail) as unknown),
    ).toContainEqual({
      changes: [
        { cell: "breakfast.protein_fat.energy", from: 25, to: 20 },
        { cell: "lunch.complete_balanced.energy", from: 40, to: 45 },
      ],
    });
    expect(
      written.find((event) => event.actorId === admin.id),
    ).toMatchObject({
      actorEmail: admin.email,
      targetType: "setting",
      targetId: MEAL_SHARES_SETTING_KEY,
    });
  });

  it("writes no event and no row for a table equal to the table in use", async () => {
    const before = (await events("meal_shares.set")).length;
    expect(
      await setMealShareTable(admin, copyOf(defaultMealShareTable)),
    ).toMatchObject({ ok: true, data: { source: "default" } });
    expect(await getAppSetting(MEAL_SHARES_SETTING_KEY)).toBeNull();
    expect(await events("meal_shares.set")).toHaveLength(before);
  });

  it("refuses a column of the reference day that does not give 100", async () => {
    const table = corrected();
    table.lunch.complete_balanced.energy = 50;
    const before = (await events("meal_shares.set")).length;
    expect(await setMealShareTable(admin, table)).toMatchObject({
      ok: false,
      error: "invalid_input",
      message: "each column of the reference day must give 100",
    });
    expect(await mealShareTable()).toEqual(defaultMealShareTable);
    expect(await events("meal_shares.set")).toHaveLength(before);
  });

  it("refuses a weight out of range, and a value that is not a table", async () => {
    const table = corrected();
    table.snack.free.protein = 0;
    expect(await setMealShareTable(admin, table)).toMatchObject({
      ok: false,
      message: "each meal share is a whole number from 1 to 100",
    });
    expect(await setMealShareTable(admin, { breakfast: {} })).toMatchObject({
      ok: false,
      message: "the meal share table is not complete",
    });
    expect(await getAppSetting(MEAL_SHARES_SETTING_KEY)).toBeNull();
  });
});

describe("resetMealShareTable", () => {
  it("removes the setting: the code default applies again", async () => {
    await setMealShareTable(admin, corrected());
    const before = (await events("meal_shares.reset")).length;
    expect(await resetMealShareTable(practitioner)).toMatchObject({
      ok: true,
      data: { table: defaultMealShareTable, source: "default" },
    });
    expect(await mealShareTable()).toEqual(defaultMealShareTable);
    const written = await events("meal_shares.reset");
    expect(written).toHaveLength(before + 1);
    expect(
      written.map((event) => JSON.parse(event.detail) as unknown),
    ).toContainEqual({
      changes: [
        { cell: "breakfast.protein_fat.energy", from: 20, to: 25 },
        { cell: "lunch.complete_balanced.energy", from: 45, to: 40 },
      ],
    });
  });

  it("writes no event when there was no setting", async () => {
    const before = (await events("meal_shares.reset")).length;
    expect((await resetMealShareTable(admin)).ok).toBe(true);
    expect(await events("meal_shares.reset")).toHaveLength(before);
  });
});

describe("a stored value that is not a valid table", () => {
  it.each(["not json", '{"breakfast":{}}'])(
    "is not used: %s",
    async (value) => {
      await setAppSetting(MEAL_SHARES_SETTING_KEY, value, {
        id: admin.id,
        name: admin.name,
      });
      expect(await mealShareTable()).toEqual(defaultMealShareTable);
      expect(await getMealShareSetting(admin)).toMatchObject({
        ok: true,
        data: { source: "default", storedValueRefused: true },
      });
    },
  );
});

describe("an account with no console role", () => {
  it("reads nothing and changes nothing", async () => {
    const refusal = { ok: false, error: "not_permitted" };
    expect(await getMealShareSetting(stranger)).toMatchObject(refusal);
    expect(await setMealShareTable(stranger, corrected())).toMatchObject(
      refusal,
    );
    await setMealShareTable(admin, corrected());
    expect(await resetMealShareTable(stranger)).toMatchObject(refusal);
    expect(await mealShareTable()).toEqual(corrected());
  });
});
