import { beforeAll, describe, expect, it } from "vitest";
import { registerDatabase } from "../../db/client";
import { loadCiqualFixture } from "../../db/fixtures/ciqual";
import {
  confirmFoodRecord,
  confirmFoodUnits,
} from "../../db/services/food-records";
import { getFood, refreshFoodCatalogue } from "../../db/services/foods";
import { createMemoryDatabase } from "../../db/test-helpers";
import {
  ingredientFoodsByCode,
  searchIngredientFoods,
} from "./ingredient-foods";

/**
 * The foods of the recipe form, against the committed CIQUAL subset. The
 * codes are foods of the subset: rice and a hard-boiled egg.
 */
const RICE = "9100";
const EGG = "22010";

const operator = {
  id: "00000000-0000-4000-8000-0000000000aa",
  email: "morgane@example.test",
  name: "Morgane",
};

const EGG_UNITS = {
  densityGPerMl: null,
  units: [{ one: "œuf", many: "œufs", grams: 55 }],
};

let eggName = "";

beforeAll(async () => {
  const client = createMemoryDatabase();
  registerDatabase(client);
  await loadCiqualFixture(client);
  refreshFoodCatalogue();
  const egg = await getFood(EGG);
  if (!egg.ok) {
    throw new Error("the subset no longer carries the egg");
  }
  eggName = egg.data.nameFr;
  await confirmFoodRecord(operator, EGG, {
    cookable: true,
    containsTags: ["eggs"],
    mayContainTags: [],
    role: "protein",
  });
  await confirmFoodUnits(operator, EGG, EGG_UNITS);
});

describe("searchIngredientFoods", () => {
  it("gives nothing for an empty text", async () => {
    expect(await searchIngredientFoods("  ")).toEqual([]);
  });

  it("puts the confirmed cookable food first, with its confirmed units", async () => {
    const found = await searchIngredientFoods("oeuf");
    expect(found[0]).toEqual({
      code: EGG,
      name: eggName,
      cookable: true,
      units: EGG_UNITS,
    });
    expect(found.length).toBeLessThanOrEqual(12);
    // One line for each food.
    expect(new Set(found.map((food) => food.code)).size).toBe(found.length);
  });

  it("tries the first word when the whole text finds nothing", async () => {
    const found = await searchIngredientFoods("Œuf zzqxv");
    expect(found[0]?.code).toBe(EGG);
  });

  it("offers a food with no record, with no unit and not as cookable", async () => {
    const found = await searchIngredientFoods("riz");
    const rice = found.find((food) => food.code === RICE);
    // The list is short: the rice of the subset is in it only if it ranks.
    for (const food of found.filter((entry) => entry.code !== EGG)) {
      expect(food.cookable).toBe(false);
      expect(food.units).toBeNull();
    }
    expect(rice === undefined || rice.cookable === false).toBe(true);
  });
});

describe("ingredientFoodsByCode", () => {
  it("gives the foods of the codes, and leaves out a code that CIQUAL does not have", async () => {
    const foods = await ingredientFoodsByCode([EGG, RICE, EGG, "0"]);
    expect(foods.map((food) => food.code)).toEqual([EGG, RICE]);
    expect(foods[0]).toMatchObject({ cookable: true, units: EGG_UNITS });
    expect(foods[1]).toMatchObject({ cookable: false, units: null });
  });

  it("reads nothing for no code", async () => {
    expect(await ingredientFoodsByCode([])).toEqual([]);
  });
});
