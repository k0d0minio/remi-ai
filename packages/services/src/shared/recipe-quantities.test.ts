import { describe, expect, it } from "vitest";
import {
  kitchenQuantityToGrams,
  toKitchenQuantity,
  withinKitchenTolerance,
  type FoodKitchenUnits,
} from "./kitchen-units";
import {
  defaultIngredientEntry,
  ingredientAmountText,
  ingredientEntryGrams,
  ingredientFoodQueries,
  ingredientLineGrams,
  ingredientLinkOf,
  ingredientUnitOptions,
} from "./recipe-quantities";

/** Units as a person confirms them on « Aliments ». */
const EGG: FoodKitchenUnits = {
  densityGPerMl: null,
  units: [{ one: "œuf", many: "œufs", grams: 55 }],
};
const GARLIC: FoodKitchenUnits = {
  densityGPerMl: null,
  units: [{ one: "gousse", many: "gousses", grams: 5 }],
};
const OIL: FoodKitchenUnits = { densityGPerMl: 0.92, units: [] };
const MILK: FoodKitchenUnits = { densityGPerMl: 1.03, units: [] };

describe("ingredientLineGrams", () => {
  it("reads a weight with or without units of the food", () => {
    expect(ingredientLineGrams({ quantity: 200, unit: "g" }, null)).toBe(200);
    expect(ingredientLineGrams({ quantity: 1.5, unit: "kg" }, EGG)).toBe(1500);
  });

  it("reads a volume and a spoon with the confirmed density of the food", () => {
    expect(ingredientLineGrams({ quantity: 1, unit: "tbsp" }, OIL)).toBe(13.8);
    expect(ingredientLineGrams({ quantity: 2, unit: "tsp" }, OIL)).toBe(9.2);
    expect(ingredientLineGrams({ quantity: 20, unit: "cl" }, MILK)).toBe(206);
    expect(ingredientLineGrams({ quantity: 1, unit: "l" }, MILK)).toBe(1030);
    expect(ingredientLineGrams({ quantity: 1, unit: "glass" }, MILK)).toBe(206);
  });

  it("invents no weight for a volume with no density", () => {
    expect(ingredientLineGrams({ quantity: 1, unit: "tbsp" }, null)).toBeNull();
    expect(ingredientLineGrams({ quantity: 20, unit: "cl" }, EGG)).toBeNull();
  });

  it("gives no weight for a count, a unit of a food and no quantity", () => {
    expect(ingredientLineGrams({ quantity: 2, unit: null }, EGG)).toBeNull();
    expect(
      ingredientLineGrams({ quantity: 1, unit: "clove" }, GARLIC),
    ).toBeNull();
    expect(ingredientLineGrams({ quantity: 1, unit: "can" }, MILK)).toBeNull();
    expect(ingredientLineGrams({ quantity: null, unit: null }, OIL)).toBeNull();
  });

  it("agrees with the kitchen unit functions for a spoon", () => {
    const grams = ingredientLineGrams({ quantity: 1, unit: "tbsp" }, OIL) ?? 0;
    const exact = kitchenQuantityToGrams(
      1,
      { kind: "generic", unit: "tbsp" },
      OIL,
    );
    expect(withinKitchenTolerance(exact ?? 0, grams)).toBe(true);
    expect(toKitchenQuantity(grams, OIL)?.text).toBe("1 c. à soupe");
  });
});

describe("ingredientAmountText", () => {
  const line = (
    name: string,
    grams?: number,
    quantity: number | null = null,
  ) => ({
    quantity,
    unit: null,
    name,
    ...(grams === undefined ? {} : { grams }),
  });

  it("writes a stored weight in the unit of the food", () => {
    expect(ingredientAmountText(line("ail", 10), GARLIC)).toBe("2 gousses");
    expect(ingredientAmountText(line("ail", 5), GARLIC)).toBe("1 gousse");
    expect(ingredientAmountText(line("huile d'olive", 13.8), OIL)).toBe(
      "1 c. à soupe",
    );
  });

  it("writes the count alone when the unit is the name of the line", () => {
    expect(ingredientAmountText(line("œufs", 110), EGG)).toBe("2");
    expect(ingredientAmountText(line("Oeuf", 55), EGG)).toBe("1");
    // Another name keeps the unit: « 2 œufs » of « omelette ».
    expect(ingredientAmountText(line("œufs frais", 110), EGG)).toBe("2 œufs");
  });

  it("writes grams when the food has no confirmed unit", () => {
    expect(ingredientAmountText(line("quinoa", 150), null)).toBe("150 g");
    expect(ingredientAmountText(line("farine", 1250), null)).toBe("1,25 kg");
  });

  it("writes grams when no unit of the food fits the weight", () => {
    // 80 g is 1,45 egg: no « 1,45 œuf ».
    expect(ingredientAmountText(line("œufs", 80), EGG)).toBe("80 g");
  });

  it("writes a line with no stored weight as before REM-192", () => {
    expect(
      ingredientAmountText({ quantity: 200, unit: "g", name: "quinoa" }, null),
    ).toBe("200 g");
    expect(
      ingredientAmountText(
        { quantity: 1, unit: "tbsp", name: "huile d'olive" },
        OIL,
      ),
    ).toBe("1 c. à s.");
    expect(ingredientAmountText(line("œufs", undefined, 2), EGG)).toBe("2");
    expect(ingredientAmountText(line("sel"), null)).toBeNull();
  });
});

describe("ingredientFoodQueries", () => {
  it("gives the whole name, its first word, and that word in the singular", () => {
    expect(ingredientFoodQueries("Œufs frais")).toEqual([
      "oeufs frais",
      "oeufs",
      "oeuf",
    ]);
    expect(ingredientFoodQueries("poireaux")).toEqual(["poireaux", "poireau"]);
  });

  it("gives each text one time", () => {
    expect(ingredientFoodQueries("quinoa")).toEqual(["quinoa"]);
    expect(ingredientFoodQueries("  Riz ")).toEqual(["riz"]);
  });

  it("gives nothing for an empty name", () => {
    expect(ingredientFoodQueries("  ")).toEqual([]);
  });
});

describe("ingredientUnitOptions", () => {
  it("offers grams alone for a food with no confirmed unit", () => {
    expect(ingredientUnitOptions(null)).toEqual([{ value: "g", label: "g" }]);
  });

  it("offers the units of the food after grams", () => {
    expect(ingredientUnitOptions(EGG)).toEqual([
      { value: "g", label: "g" },
      { value: "own:œuf", label: "œuf" },
    ]);
  });

  it("offers the generic units only with a density", () => {
    expect(ingredientUnitOptions(OIL).map((option) => option.value)).toEqual([
      "g",
      "generic:glass",
      "generic:cup",
      "generic:tbsp",
      "generic:tsp",
      "generic:pinch",
    ]);
    expect(
      ingredientUnitOptions(OIL).find(
        (option) => option.value === "generic:tbsp",
      )?.label,
    ).toBe("c. à soupe");
  });
});

describe("ingredientEntryGrams", () => {
  it("reads grams, with a French decimal", () => {
    expect(ingredientEntryGrams({ count: "150", unit: "g" }, null)).toBe(150);
    expect(ingredientEntryGrams({ count: " 12,5 ", unit: "g" }, EGG)).toBe(
      12.5,
    );
  });

  it("stores grams for a quantity typed in a unit of the food", () => {
    expect(ingredientEntryGrams({ count: "2", unit: "own:œuf" }, EGG)).toBe(
      110,
    );
    expect(
      ingredientEntryGrams({ count: "3", unit: "own:gousse" }, GARLIC),
    ).toBe(15);
    expect(
      ingredientEntryGrams({ count: "1", unit: "generic:tbsp" }, OIL),
    ).toBe(13.8);
    expect(
      ingredientEntryGrams({ count: "0,5", unit: "generic:glass" }, MILK),
    ).toBe(103);
  });

  it("invents no weight", () => {
    expect(ingredientEntryGrams({ count: "", unit: "g" }, null)).toBeNull();
    expect(ingredientEntryGrams({ count: "deux", unit: "g" }, null)).toBeNull();
    expect(ingredientEntryGrams({ count: "0", unit: "g" }, null)).toBeNull();
    expect(ingredientEntryGrams({ count: "-2", unit: "g" }, null)).toBeNull();
    // A unit that the food does not have, and a spoon with no density.
    expect(
      ingredientEntryGrams({ count: "2", unit: "own:œuf" }, GARLIC),
    ).toBeNull();
    expect(
      ingredientEntryGrams({ count: "2", unit: "own:œuf" }, null),
    ).toBeNull();
    expect(
      ingredientEntryGrams({ count: "1", unit: "generic:tbsp" }, EGG),
    ).toBeNull();
    expect(
      ingredientEntryGrams({ count: "1", unit: "litre" }, MILK),
    ).toBeNull();
  });
});

describe("defaultIngredientEntry", () => {
  it("proposes the count of the line in the first unit of the food", () => {
    expect(defaultIngredientEntry({ quantity: 2, unit: null }, EGG)).toEqual({
      count: "2",
      unit: "own:œuf",
    });
    expect(defaultIngredientEntry({ quantity: 0.5, unit: null }, EGG)).toEqual({
      count: "0,5",
      unit: "own:œuf",
    });
  });

  it("proposes nothing for each other line", () => {
    expect(
      defaultIngredientEntry({ quantity: 2, unit: null }, null),
    ).toBeNull();
    expect(defaultIngredientEntry({ quantity: 2, unit: null }, OIL)).toBeNull();
    expect(
      defaultIngredientEntry({ quantity: 200, unit: "g" }, EGG),
    ).toBeNull();
    expect(
      defaultIngredientEntry({ quantity: 1, unit: "handful" }, EGG),
    ).toBeNull();
    expect(
      defaultIngredientEntry({ quantity: null, unit: null }, EGG),
    ).toBeNull();
  });
});

describe("ingredientLinkOf", () => {
  const egg = { code: "22000", units: EGG };
  const oil = { code: "17270", units: OIL };

  it("gives no link for a line with no food", () => {
    expect(
      ingredientLinkOf({ quantity: 200, unit: "g" }, undefined, {
        count: "200",
        unit: "g",
      }),
    ).toBeNull();
  });

  it("takes the typed quantity first", () => {
    expect(
      ingredientLinkOf({ quantity: 2, unit: null }, egg, {
        count: "3",
        unit: "own:œuf",
      }),
    ).toEqual({ foodCode: "22000", grams: 165 });
  });

  it("reads the weight of the text of the line with no typed quantity", () => {
    expect(
      ingredientLinkOf({ quantity: 1, unit: "tbsp" }, oil, undefined),
    ).toEqual({ foodCode: "17270", grams: 13.8 });
    expect(
      ingredientLinkOf({ quantity: 200, unit: "g" }, egg, undefined),
    ).toEqual({ foodCode: "22000", grams: 200 });
  });

  it("keeps the food with no weight when no weight is certain", () => {
    expect(
      ingredientLinkOf({ quantity: 2, unit: null }, egg, undefined),
    ).toEqual({
      foodCode: "22000",
      grams: null,
    });
    expect(
      ingredientLinkOf({ quantity: 2, unit: null }, egg, {
        count: "",
        unit: "g",
      }),
    ).toEqual({ foodCode: "22000", grams: null });
  });
});
