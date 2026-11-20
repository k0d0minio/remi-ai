import { describe, expect, it } from "vitest";
import {
  computeRecipeNutrients,
  foodNutrientValuesOf,
  formatRecipeNutrient,
  ingredientGrams,
  nutrientIngredientsOf,
  recipeIngredientGrams,
  recipeNutrientKeys,
  type CiqualValues,
  type RecipeNutrients,
} from "./recipe-nutrients";

/**
 * The values for 100 g that Ciqual 2025 publishes for four foods, typed here
 * by hand. The expected totals below are computed by hand from them.
 */
const RICE = "9100"; // Riz blanc, cru
const EGG = "22010"; // Oeuf dur
const OIL = "17701"; // Huile combinée, mélange d'huile d'olive et de graines
const SUGAR = "31017"; // Sucre roux

const values: CiqualValues = new Map([
  [
    RICE,
    { energy: 350, protein: 7.02, carbohydrate: 77.5, fat: 0.79, fibre: 1.53 },
  ],
  [
    EGG,
    { energy: 134, protein: 13.5, carbohydrate: 0.52, fat: 8.62, fibre: 0 },
  ],
  [OIL, { energy: 900, protein: 0, carbohydrate: 0, fat: 100, fibre: 0 }],
  [SUGAR, { energy: 393, protein: 0.12, carbohydrate: 98.1, fat: 0, fibre: 0 }],
]);

const riceBowl = [
  { foodCode: RICE, grams: 200 },
  { foodCode: EGG, grams: 100 },
  { foodCode: OIL, grams: 10 },
];

const expectAmount = (
  result: RecipeNutrients,
  key: (typeof recipeNutrientKeys)[number],
  recipe: number,
  portion: number,
) => {
  expect(result[key]?.recipe).toBeCloseTo(recipe, 6);
  expect(result[key]?.portion).toBeCloseTo(portion, 6);
};

const expectNothing = (result: RecipeNutrients) => {
  for (const key of recipeNutrientKeys) {
    expect(result[key]).toBeNull();
  }
};

describe("computeRecipeNutrients", () => {
  it("gives the hand total of a rice bowl for two portions", () => {
    const result = computeRecipeNutrients({
      ingredients: riceBowl,
      values,
      portions: 2,
    });
    // 200 g rice + 100 g egg + 10 g oil.
    // Energy: 700 + 134 + 90 = 924 kcal.
    expectAmount(result, "energy", 924, 462);
    // Protein: 14.04 + 13.5 + 0 = 27.54 g.
    expectAmount(result, "protein", 27.54, 13.77);
    // Carbohydrate: 155 + 0.52 + 0 = 155.52 g.
    expectAmount(result, "carbohydrate", 155.52, 77.76);
    // Fat: 1.58 + 8.62 + 10 = 20.2 g.
    expectAmount(result, "fat", 20.2, 10.1);
    // Fibre: 3.06 + 0 + 0 = 3.06 g.
    expectAmount(result, "fibre", 3.06, 1.53);
  });

  it("gives the hand total of one food for three portions", () => {
    const result = computeRecipeNutrients({
      ingredients: [{ foodCode: SUGAR, grams: 150 }],
      values,
      portions: 3,
    });
    expectAmount(result, "energy", 589.5, 196.5);
    expectAmount(result, "protein", 0.18, 0.06);
    expectAmount(result, "carbohydrate", 147.15, 49.05);
    expectAmount(result, "fat", 0, 0);
    expectAmount(result, "fibre", 0, 0);
  });

  it("adds two lines of the same food", () => {
    const result = computeRecipeNutrients({
      ingredients: [
        { foodCode: RICE, grams: 60 },
        { foodCode: RICE, grams: 40 },
      ],
      values,
      portions: 1,
    });
    expectAmount(result, "energy", 350, 350);
    expectAmount(result, "protein", 7.02, 7.02);
  });

  it("computes nothing when one ingredient has no CIQUAL code", () => {
    expectNothing(
      computeRecipeNutrients({
        ingredients: [...riceBowl, { foodCode: null, grams: 5 }],
        values,
        portions: 2,
      }),
    );
  });

  it("computes nothing when one ingredient has no grams", () => {
    expectNothing(
      computeRecipeNutrients({
        ingredients: [...riceBowl, { foodCode: SUGAR, grams: null }],
        values,
        portions: 2,
      }),
    );
  });

  it("computes nothing when a weight is zero, negative or not a number", () => {
    for (const grams of [0, -20, Number.NaN, Number.POSITIVE_INFINITY]) {
      expectNothing(
        computeRecipeNutrients({
          ingredients: [...riceBowl, { foodCode: SUGAR, grams }],
          values,
          portions: 2,
        }),
      );
    }
  });

  it("computes nothing when CIQUAL does not know the code of one ingredient", () => {
    expectNothing(
      computeRecipeNutrients({
        ingredients: [...riceBowl, { foodCode: "99999", grams: 30 }],
        values,
        portions: 2,
      }),
    );
  });

  it("leaves out only the component that one food has no value for", () => {
    const withGap: CiqualValues = new Map([
      ...values,
      // A food with no fibre value, and with the energy key absent.
      ["1", { protein: 10, carbohydrate: 20, fat: 5, fibre: null }],
    ]);
    const result = computeRecipeNutrients({
      ingredients: [...riceBowl, { foodCode: "1", grams: 100 }],
      values: withGap,
      portions: 2,
    });
    expect(result.energy).toBeNull();
    expect(result.fibre).toBeNull();
    // The other components keep their whole total.
    expectAmount(result, "protein", 37.54, 18.77);
    expectAmount(result, "carbohydrate", 175.52, 87.76);
    expectAmount(result, "fat", 25.2, 12.6);
  });

  it("computes nothing for a recipe with no ingredient", () => {
    expectNothing(
      computeRecipeNutrients({ ingredients: [], values, portions: 2 }),
    );
  });

  it("computes nothing when the number of portions is not valid", () => {
    for (const portions of [0, -1, Number.NaN]) {
      expectNothing(
        computeRecipeNutrients({ ingredients: riceBowl, values, portions }),
      );
    }
  });
});

describe("foodNutrientValuesOf", () => {
  it("reads the five components from the CIQUAL rows of a food", () => {
    expect(
      foodNutrientValuesOf([
        { componentCode: "328", value: 350, marker: "exact" },
        { componentCode: "25000", value: 7.02, marker: "exact" },
        { componentCode: "31000", value: 77.5, marker: "exact" },
        { componentCode: "40000", value: 0.79, marker: "exact" },
        { componentCode: "34100", value: 1.53, marker: "exact" },
        // A component that the calculation does not read.
        { componentCode: "10120", value: 25, marker: "exact" },
      ]),
    ).toEqual({
      energy: 350,
      protein: 7.02,
      carbohydrate: 77.5,
      fat: 0.79,
      fibre: 1.53,
    });
  });

  it("counts traces as 0", () => {
    const result = foodNutrientValuesOf([
      { componentCode: "31000", value: 0, marker: "traces" },
    ]);
    expect(result.carbohydrate).toBe(0);
  });

  it("gives no value for an upper limit and for a value that is not determined", () => {
    const result = foodNutrientValuesOf([
      { componentCode: "40000", value: 0.5, marker: "less_than" },
      { componentCode: "34100", value: null, marker: "not_determined" },
    ]);
    expect(result.fat).toBeNull();
    expect(result.fibre).toBeNull();
  });

  it("gives no value for a component with no row", () => {
    expect(foodNutrientValuesOf([])).toEqual({
      energy: null,
      protein: null,
      carbohydrate: null,
      fat: null,
      fibre: null,
    });
  });

  it("takes the second code when the first has no usable value", () => {
    const result = foodNutrientValuesOf([
      { componentCode: "328", value: null, marker: "not_determined" },
      { componentCode: "333", value: 120, marker: "exact" },
      { componentCode: "25003", value: 9.1, marker: "exact" },
    ]);
    expect(result.energy).toBe(120);
    expect(result.protein).toBe(9.1);
  });

  it("prefers the first code when the two have a value", () => {
    const result = foodNutrientValuesOf([
      { componentCode: "25003", value: 9.1, marker: "exact" },
      { componentCode: "25000", value: 8.7, marker: "exact" },
    ]);
    expect(result.protein).toBe(8.7);
  });
});

describe("recipeIngredientGrams", () => {
  it("reads grams and kilograms", () => {
    expect(recipeIngredientGrams({ quantity: 200, unit: "g" })).toBe(200);
    expect(recipeIngredientGrams({ quantity: 1.5, unit: "kg" })).toBe(1500);
  });

  it("gives no weight for a volume, a kitchen unit, a count and no quantity", () => {
    expect(recipeIngredientGrams({ quantity: 20, unit: "cl" })).toBeNull();
    expect(recipeIngredientGrams({ quantity: 1, unit: "tbsp" })).toBeNull();
    expect(recipeIngredientGrams({ quantity: 2, unit: null })).toBeNull();
    expect(recipeIngredientGrams({ quantity: null, unit: null })).toBeNull();
  });
});

describe("ingredientGrams", () => {
  it("gives the stored weight first", () => {
    expect(ingredientGrams({ quantity: 2, unit: null, grams: 110 })).toBe(110);
    expect(ingredientGrams({ quantity: 200, unit: "g", grams: 180 })).toBe(180);
  });

  it("reads the text of a line with no stored weight, as before", () => {
    expect(ingredientGrams({ quantity: 200, unit: "g" })).toBe(200);
    expect(ingredientGrams({ quantity: 2, unit: null })).toBeNull();
  });
});

describe("nutrientIngredientsOf", () => {
  it("gives the stored grams of a line of the structure of REM-192", () => {
    expect(
      nutrientIngredientsOf({
        ingredients: [
          {
            quantity: 2,
            unit: null,
            name: "œufs",
            note: "",
            foodCode: EGG,
            grams: 110,
          },
          { quantity: 1, unit: "tbsp", name: "huile", note: "", foodCode: OIL },
        ],
      }),
    ).toEqual([
      { foodCode: EGG, grams: 110 },
      { foodCode: OIL, grams: null },
    ]);
  });

  it("keeps the order and the code of each line", () => {
    expect(
      nutrientIngredientsOf({
        ingredients: [
          { quantity: 200, unit: "g", name: "riz", note: "", foodCode: RICE },
          { quantity: 2, unit: null, name: "œufs", note: "", foodCode: EGG },
          { quantity: null, unit: null, name: "sel", note: "", foodCode: null },
        ],
      }),
    ).toEqual([
      { foodCode: RICE, grams: 200 },
      { foodCode: EGG, grams: null },
      { foodCode: null, grams: null },
    ]);
  });
});

describe("formatRecipeNutrient", () => {
  it("writes energy with no decimal", () => {
    expect(formatRecipeNutrient("energy", 461.6)).toBe("462 kcal");
  });

  it("writes a weight with one decimal and a comma", () => {
    expect(formatRecipeNutrient("protein", 13.77)).toBe("13,8 g");
    expect(formatRecipeNutrient("fibre", 0)).toBe("0,0 g");
  });

  it("groups the thousands with a space", () => {
    expect(formatRecipeNutrient("energy", 1250)).toMatch(/^1\s250\skcal$/u);
  });
});
