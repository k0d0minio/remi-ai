import { describe, expect, it } from "vitest";
import {
  foodKitchenUnitsSchema,
  genericKitchenUnitTable,
  genericKitchenUnits,
  kitchenQuantityText,
  kitchenQuantityToGrams,
  toKitchenQuantity,
  withinKitchenTolerance,
  type FoodKitchenUnits,
} from "./kitchen-units";

const egg: FoodKitchenUnits = {
  densityGPerMl: null,
  units: [{ one: "œuf", many: "œufs", grams: 55 }],
};

const garlic: FoodKitchenUnits = {
  densityGPerMl: null,
  units: [{ one: "gousse", many: "gousses", grams: 5 }],
};

const oil: FoodKitchenUnits = { densityGPerMl: 0.92, units: [] };

const milk: FoodKitchenUnits = { densityGPerMl: 1.03, units: [] };

const salt: FoodKitchenUnits = { densityGPerMl: 1.2, units: [] };

describe("kitchenQuantityText", () => {
  it.each([
    [110, egg, "2 œufs"],
    [55, egg, "1 œuf"],
    [58, egg, "1 œuf"],
    [5, garlic, "1 gousse"],
    [15, garlic, "3 gousses"],
    [13.8, oil, "1 c. à soupe"],
    [27.6, oil, "2 c. à soupe"],
    [4.6, oil, "1 c. à café"],
    [2.3, oil, "1/2 c. à café"],
    [6.9, oil, "1/2 c. à soupe"],
    [103, milk, "1/2 verre"],
    [206, milk, "1 verre"],
    [515, milk, "2 tasses"],
    [0.36, salt, "1 pincée"],
    [150, null, "150 g"],
  ])("writes %s g as « %s »", (grams, units, text) => {
    expect(kitchenQuantityText(grams, units)).toBe(text);
  });

  it("never writes a count that a person cannot measure", () => {
    // 1,37 egg: no count of the list is inside the tolerance.
    expect(kitchenQuantityText(75, egg)).toBe("75 g");
    expect(kitchenQuantityText(2, garlic)).toBe("2 g");
    // 330 ml of milk is no round count of a glass or of a cup.
    expect(kitchenQuantityText(340, milk)).toBe("340 g");
  });

  it("writes grams when the food has no confirmed unit", () => {
    expect(kitchenQuantityText(55, null)).toBe("55 g");
    expect(kitchenQuantityText(13.8, { densityGPerMl: null, units: [] })).toBe(
      "14 g",
    );
  });

  it.each([
    [0.3, "0,3 g"],
    [0.04, "0,1 g"],
    [7.4, "7 g"],
    [24.6, "25 g"],
    [62, "60 g"],
    [247, "245 g"],
    [333, "330 g"],
    [998, "1 kg"],
    [1240, "1,25 kg"],
    [2000, "2 kg"],
  ])("rounds %s g to « %s »", (grams, text) => {
    expect(kitchenQuantityText(grams, null)).toBe(text);
  });

  it.each([0, -5, Number.NaN, Number.POSITIVE_INFINITY])(
    "invents no text for %s",
    (grams) => {
      expect(toKitchenQuantity(grams, egg)).toBeNull();
      expect(kitchenQuantityText(grams, null)).toBeNull();
    },
  );

  it("skips a unit or a density that is not a positive number", () => {
    expect(
      kitchenQuantityText(110, {
        densityGPerMl: 0,
        units: [{ one: "œuf", many: "œufs", grams: 0 }],
      }),
    ).toBe("110 g");
  });

  it("prefers the food's own unit, in the order given", () => {
    const butter: FoodKitchenUnits = {
      densityGPerMl: 0.95,
      units: [
        { one: "noix", many: "noix", grams: 10 },
        { one: "plaquette", many: "plaquettes", grams: 250 },
      ],
    };
    expect(kitchenQuantityText(10, butter)).toBe("1 noix");
    expect(kitchenQuantityText(250, butter)).toBe("1 plaquette");
  });
});

describe("the way back", () => {
  const foods: readonly (FoodKitchenUnits | null)[] = [
    null,
    egg,
    garlic,
    oil,
    milk,
    salt,
    {
      densityGPerMl: 0.55,
      units: [{ one: "sachet", many: "sachets", grams: 7.5 }],
    },
  ];

  it("stays inside the tolerance for each weight from 0,1 g to 3 kg", () => {
    const faults: string[] = [];
    for (const units of foods) {
      for (let grams = 0.1; grams <= 3000; grams *= 1.013) {
        const shown = toKitchenQuantity(grams, units);
        const back =
          shown === null
            ? null
            : kitchenQuantityToGrams(shown.count, shown.unit, units);
        if (
          shown === null ||
          back === null ||
          Math.abs(back - shown.grams) > 1e-9 ||
          !withinKitchenTolerance(grams, back)
        ) {
          faults.push(`${grams} g → ${shown?.text ?? "no text"} → ${back}`);
        }
      }
    }
    expect(faults).toEqual([]);
  });

  it("states the tolerance: 10 %, or half a gram for a small weight", () => {
    expect(withinKitchenTolerance(100, 110)).toBe(true);
    expect(withinKitchenTolerance(100, 111)).toBe(false);
    expect(withinKitchenTolerance(100, 89)).toBe(false);
    expect(withinKitchenTolerance(1, 1.5)).toBe(true);
    expect(withinKitchenTolerance(1, 1.6)).toBe(false);
  });

  it("reads a count of a unit back to grams", () => {
    expect(kitchenQuantityToGrams(2, { kind: "own", one: "œuf" }, egg)).toBe(
      110,
    );
    expect(
      kitchenQuantityToGrams(1, { kind: "generic", unit: "tbsp" }, oil),
    ).toBeCloseTo(13.8);
    expect(kitchenQuantityToGrams(150, { kind: "gram" }, null)).toBe(150);
  });

  it("invents no weight for a unit that the food does not have", () => {
    expect(
      kitchenQuantityToGrams(1, { kind: "own", one: "gousse" }, egg),
    ).toBeNull();
    expect(
      kitchenQuantityToGrams(1, { kind: "generic", unit: "tbsp" }, egg),
    ).toBeNull();
    expect(
      kitchenQuantityToGrams(1, { kind: "generic", unit: "tbsp" }, null),
    ).toBeNull();
    expect(kitchenQuantityToGrams(0, { kind: "gram" }, null)).toBeNull();
  });
});

describe("the generic units", () => {
  it("have a fixed volume and counts in rising order", () => {
    for (const key of genericKitchenUnits) {
      const unit = genericKitchenUnitTable[key];
      expect(unit.ml).toBeGreaterThan(0);
      expect([...unit.counts].sort((a, b) => a - b)).toEqual(unit.counts);
    }
    expect(genericKitchenUnitTable.tsp.ml).toBe(5);
    expect(genericKitchenUnitTable.tbsp.ml).toBe(15);
  });
});

describe("foodKitchenUnitsSchema", () => {
  it("accepts a density and units", () => {
    expect(
      foodKitchenUnitsSchema.safeParse({
        densityGPerMl: 0.92,
        units: [{ one: " œuf ", many: "œufs", grams: 55 }],
      }),
    ).toMatchObject({
      success: true,
      data: { units: [{ one: "œuf", many: "œufs", grams: 55 }] },
    });
  });

  it.each([
    { densityGPerMl: 0, units: [] },
    { densityGPerMl: 12, units: [] },
    { densityGPerMl: null, units: [{ one: "", many: "œufs", grams: 55 }] },
    { densityGPerMl: null, units: [{ one: "œuf", many: "œufs", grams: 0 }] },
    {
      densityGPerMl: null,
      units: [
        { one: "œuf", many: "œufs", grams: 55 },
        { one: "Œuf", many: "œufs", grams: 60 },
      ],
    },
  ])("refuses %j", (input) => {
    expect(foodKitchenUnitsSchema.safeParse(input).success).toBe(false);
  });
});
