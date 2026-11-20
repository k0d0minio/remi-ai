import { beforeAll, describe, expect, it } from "vitest";
import {
  recipeNutrientKeys,
  recipeNutrientSources,
  type RecipeNutrientKey,
} from "../../../shared/recipe-nutrients";
import type { RecipeIngredient } from "../../../shared/structured-recipe";
import { registerDatabase } from "../../client";
import { ciqualFixture, loadCiqualFixture } from "../../fixtures/ciqual";
import { createMemoryDatabase } from "../../test-helpers";
import { refreshFoodCatalogue } from "./index";
import { estimateRecipeNutrients } from "./recipe-nutrients";

/**
 * The service against the committed subset of the real Ciqual 2025 table,
 * through the in-memory client.
 *
 * The tests choose their foods by a property of the data, not by a code,
 * because `pnpm ciqual:fixture` makes the subset again. The totals that are
 * known by hand are in `shared/recipe-nutrients.test.ts`.
 */

type FixtureFood = (typeof ciqualFixture.foods)[number];

/** The marker of the first code of a component, as the fixture packs it. */
const markerOf = (food: FixtureFood, key: RecipeNutrientKey) =>
  food.nutrients[recipeNutrientSources[key].codes[0] ?? ""]?.[1];

const valueOf = (food: FixtureFood, key: RecipeNutrientKey) =>
  food.nutrients[recipeNutrientSources[key].codes[0] ?? ""]?.[0] ?? 0;

const complete = (food: FixtureFood) =>
  recipeNutrientKeys.every((key) => markerOf(food, key) === "exact");

const need = (food: FixtureFood | undefined, what: string): FixtureFood => {
  if (!food) {
    throw new Error(`the subset has no food with ${what}`);
  }
  return food;
};

const completeFoods = ciqualFixture.foods.filter(complete);
const first = need(completeFoods[0], "five measured components");
const second = need(completeFoods[1], "five measured components");

const line = (
  food: Pick<FixtureFood, "code" | "nameFr"> | null,
  quantity: number | null,
  unit: RecipeIngredient["unit"],
): RecipeIngredient => ({
  quantity,
  unit,
  name: food?.nameFr ?? "sel",
  note: "",
  foodCode: food?.code ?? null,
});

beforeAll(async () => {
  const client = createMemoryDatabase();
  registerDatabase(client);
  await loadCiqualFixture(client);
  refreshFoodCatalogue();
});

describe("estimateRecipeNutrients", () => {
  it("sums the CIQUAL values of the table for the grams of each line", async () => {
    const { nutrients, lines } = await estimateRecipeNutrients({
      portions: 4,
      ingredients: [line(first, 250, "g"), line(second, 0.1, "kg")],
    });

    for (const key of recipeNutrientKeys) {
      const total = valueOf(first, key) * 2.5 + valueOf(second, key) * 1;
      expect(nutrients[key]?.recipe).toBeCloseTo(total, 6);
      expect(nutrients[key]?.portion).toBeCloseTo(total / 4, 6);
    }
    expect(lines).toEqual([
      {
        name: first.nameFr,
        grams: 250,
        foodCode: first.code,
        foodName: first.nameFr,
        shown: "250 g",
      },
      {
        name: second.nameFr,
        grams: 100,
        foodCode: second.code,
        foodName: second.nameFr,
        shown: "0,1 kg",
      },
    ]);
  });

  it("computes nothing when one line has no CIQUAL code", async () => {
    const { nutrients, lines } = await estimateRecipeNutrients({
      portions: 2,
      ingredients: [line(first, 250, "g"), line(null, 5, "g")],
    });
    for (const key of recipeNutrientKeys) {
      expect(nutrients[key]).toBeNull();
    }
    expect(lines[1]).toEqual({
      name: "sel",
      grams: 5,
      foodCode: null,
      foodName: null,
      shown: "5 g",
    });
  });

  it("computes nothing when one line has a unit that is not a weight", async () => {
    const { nutrients, lines } = await estimateRecipeNutrients({
      portions: 2,
      ingredients: [line(first, 250, "g"), line(second, 1, "tbsp")],
    });
    for (const key of recipeNutrientKeys) {
      expect(nutrients[key]).toBeNull();
    }
    expect(lines[1]?.grams).toBeNull();
    expect(lines[1]?.foodName).toBe(second.nameFr);
  });

  it("computes nothing when CIQUAL has no food with the code of a line", async () => {
    const { nutrients, lines } = await estimateRecipeNutrients({
      portions: 2,
      ingredients: [
        line(first, 250, "g"),
        line({ code: "0000000", nameFr: "aliment inconnu" }, 50, "g"),
      ],
    });
    for (const key of recipeNutrientKeys) {
      expect(nutrients[key]).toBeNull();
    }
    expect(lines[1]?.foodName).toBeNull();
  });

  it("leaves out only the component that CIQUAL gives as an upper limit", async () => {
    const bounded = need(
      ciqualFixture.foods.find(
        (food) =>
          markerOf(food, "fat") === "less_than" &&
          markerOf(food, "protein") === "exact",
      ),
      "a fat value given as an upper limit",
    );
    const { nutrients } = await estimateRecipeNutrients({
      portions: 1,
      ingredients: [line(first, 100, "g"), line(bounded, 100, "g")],
    });
    expect(nutrients.fat).toBeNull();
    expect(nutrients.protein?.recipe).toBeCloseTo(
      valueOf(first, "protein") + valueOf(bounded, "protein"),
      6,
    );
  });

  it("counts a component that CIQUAL gives as traces as 0", async () => {
    const traces = need(
      ciqualFixture.foods.find(
        (food) => markerOf(food, "carbohydrate") === "traces",
      ),
      "a carbohydrate value given as traces",
    );
    const { nutrients } = await estimateRecipeNutrients({
      portions: 1,
      ingredients: [line(first, 100, "g"), line(traces, 100, "g")],
    });
    expect(nutrients.carbohydrate?.recipe).toBeCloseTo(
      valueOf(first, "carbohydrate"),
      6,
    );
  });
});
