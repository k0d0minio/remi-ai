import { describe, expect, it } from "vitest";

import {
  recipeIngredientAmount,
  recipeStepDetails,
  recipeSummaryOf,
  type PatientRecipeCard,
} from "./recipe-card";

describe("recipeIngredientAmount", () => {
  it.each([
    [{ quantity: 200, unit: "g" as const }, "200 g"],
    [{ quantity: 1, unit: "tbsp" as const }, "1 c. à s."],
    [{ quantity: 0.5, unit: "tsp" as const }, "1/2 c. à c."],
    [{ quantity: 1, unit: "clove" as const }, "1 gousse"],
    [{ quantity: 2, unit: "clove" as const }, "2 gousses"],
    [{ quantity: 1.5, unit: "l" as const }, "1,5 l"],
    [{ quantity: 2, unit: null }, "2"],
  ])("writes %o as « %s »", (ingredient, text) => {
    expect(recipeIngredientAmount(ingredient)).toBe(text);
  });

  it("gives null for a line with no quantity", () => {
    expect(recipeIngredientAmount({ quantity: null, unit: null })).toBeNull();
  });
});

describe("recipeStepDetails", () => {
  it("gives the temperature, then the duration", () => {
    expect(
      recipeStepDetails({ temperatureC: 180, durationMinutes: 20 }),
    ).toEqual(["180 °C", "20 min"]);
  });

  it("gives only the value that the step has", () => {
    expect(
      recipeStepDetails({ temperatureC: 200, durationMinutes: null }),
    ).toEqual(["200 °C"]);
    expect(
      recipeStepDetails({ temperatureC: null, durationMinutes: 90 }),
    ).toEqual(["1 h 30"]);
  });

  it("gives nothing for a step with no temperature and no duration", () => {
    expect(
      recipeStepDetails({ temperatureC: null, durationMinutes: null }),
    ).toEqual([]);
  });
});

describe("recipeSummaryOf", () => {
  const card: PatientRecipeCard = {
    id: "11111111-1111-4111-8111-111111111111",
    source: "remi",
    title: "Salade de carottes",
    justification: "",
    content: {
      description: "Une salade croquante.",
      prepMinutes: 10,
      cookMinutes: null,
      portions: 2,
      meals: ["lunch"],
      seasons: [],
      ingredients: [
        { quantity: 3, unit: null, name: "carottes", note: "", foodCode: null },
      ],
      steps: [
        {
          text: "Râpe les carottes.",
          temperatureC: null,
          durationMinutes: null,
        },
      ],
    },
    amounts: [null],
  };

  it("keeps the id, the source, the title and the description", () => {
    expect(recipeSummaryOf(card)).toEqual({
      id: card.id,
      source: "remi",
      title: "Salade de carottes",
      description: "Une salade croquante.",
      totalMinutes: 10,
    });
  });

  it("gives no total time when the recipe has no time", () => {
    const summary = recipeSummaryOf({
      ...card,
      content: { ...card.content, prepMinutes: null },
    });
    expect(summary.totalMinutes).toBeNull();
  });
});
