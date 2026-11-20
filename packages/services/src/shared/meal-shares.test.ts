import { describe, expect, it } from "vitest";
import {
  defaultMealConfiguration,
  mealOrientations,
  mealSlots,
  type MealConfiguration,
  type MealFasting,
  type MealOrientation,
  type MealSlot,
} from "./meal-configuration";
import {
  defaultMealShareTable,
  mealShareChanges,
  mealShareNutrients,
  mealTargets,
  parseMealShareTable,
  referenceDayOrientations,
  referenceDayTotal,
  type MealShareTable,
} from "./meal-shares";

const DAY = { energyKcal: 2000, proteinG: 84 };

/** The four meals on, each with the same orientation. */
const allOn = (
  orientation: MealOrientation,
  fasting: MealFasting = "none",
): MealConfiguration => ({
  meals: {
    breakfast: { enabled: true, orientation },
    lunch: { enabled: true, orientation },
    snack: { enabled: true, orientation },
    dinner: { enabled: true, orientation },
  },
  fasting,
});

/** The reference day: Morgane's table, with the snack on. */
const referenceDay: MealConfiguration = {
  ...defaultMealConfiguration,
  meals: {
    ...defaultMealConfiguration.meals,
    snack: { enabled: true, orientation: "carb_leaning" },
  },
};

const allOffMeals: MealConfiguration["meals"] = {
  breakfast: { enabled: false, orientation: "free" },
  lunch: { enabled: false, orientation: "free" },
  snack: { enabled: false, orientation: null },
  dinner: { enabled: null, orientation: null },
};

const copyOf = (table: MealShareTable): MealShareTable =>
  JSON.parse(JSON.stringify(table)) as MealShareTable;

const sum = (values: (number | null)[]) =>
  values.reduce<number>((total, value) => total + (value ?? 0), 0);

const byMeal = (
  targets: ReturnType<typeof mealTargets>,
): Record<MealSlot, { energyKcal: number | null; proteinG: number | null }> =>
  Object.fromEntries(
    targets.meals.map((meal) => [
      meal.meal,
      { energyKcal: meal.energyKcal, proteinG: meal.proteinG },
    ]),
  ) as Record<MealSlot, { energyKcal: number | null; proteinG: number | null }>;

describe("the default table", () => {
  it("has a weight for each meal, orientation and nutrient", () => {
    for (const meal of mealSlots) {
      for (const orientation of mealOrientations) {
        for (const nutrient of mealShareNutrients) {
          const weight = defaultMealShareTable[meal][orientation][nutrient];
          expect(Number.isInteger(weight)).toBe(true);
          expect(weight).toBeGreaterThanOrEqual(1);
          expect(weight).toBeLessThanOrEqual(100);
        }
      }
    }
  });

  it("gives 100 for each column of the reference day", () => {
    expect(referenceDayOrientations).toEqual({
      breakfast: "protein_fat",
      lunch: "complete_balanced",
      snack: "carb_leaning",
      dinner: "light_plant",
    });
    expect(referenceDayTotal(defaultMealShareTable, "energy")).toBe(100);
    expect(referenceDayTotal(defaultMealShareTable, "protein")).toBe(100);
  });

  it("is a valid table", () => {
    expect(parseMealShareTable(defaultMealShareTable)).toEqual({
      ok: true,
      table: defaultMealShareTable,
    });
  });

  it("keeps at least 15 % of the day's protein at each main meal", () => {
    for (const meal of ["breakfast", "lunch", "dinner"] as const) {
      for (const orientation of mealOrientations) {
        expect(
          defaultMealShareTable[meal][orientation].protein,
        ).toBeGreaterThanOrEqual(15);
      }
    }
  });
});

describe("parseMealShareTable", () => {
  it("refuses a value that is not a whole table", () => {
    const noSnack = Object.fromEntries(
      Object.entries(defaultMealShareTable).filter(([meal]) => meal !== "snack"),
    );
    const textCell = {
      ...defaultMealShareTable,
      lunch: {
        ...defaultMealShareTable.lunch,
        free: { energy: "40", protein: 35 },
      },
    };
    for (const value of [null, "table", [], {}, noSnack, textCell]) {
      expect(parseMealShareTable(value)).toEqual({
        ok: false,
        problems: [{ type: "malformed" }],
      });
    }
  });

  it.each([0, 101, -5, 12.5])("refuses the weight %s", (weight) => {
    const table = copyOf(defaultMealShareTable);
    table.snack.free.protein = weight;
    expect(parseMealShareTable(table)).toEqual({
      ok: false,
      problems: [
        {
          type: "out_of_range",
          meal: "snack",
          orientation: "free",
          nutrient: "protein",
        },
      ],
    });
  });

  it("refuses a column of the reference day that does not give 100", () => {
    const table = copyOf(defaultMealShareTable);
    table.lunch.complete_balanced.energy = 45;
    expect(parseMealShareTable(table)).toEqual({
      ok: false,
      problems: [{ type: "reference_total", nutrient: "energy", total: 105 }],
    });
  });

  it("accepts a change outside the reference day, and drops unknown keys", () => {
    const table = copyOf(defaultMealShareTable);
    table.dinner.protein_fat.protein = 50;
    const withExtra = { ...table, brunch: { free: { energy: 10 } } };
    expect(parseMealShareTable(withExtra)).toEqual({ ok: true, table });
  });
});

describe("mealShareChanges", () => {
  it("lists each cell that differs, and nothing for equal tables", () => {
    const after = copyOf(defaultMealShareTable);
    after.breakfast.protein_fat.energy = 20;
    after.lunch.complete_balanced.energy = 45;
    expect(mealShareChanges(defaultMealShareTable, after)).toEqual([
      { cell: "breakfast.protein_fat.energy", from: 25, to: 20 },
      { cell: "lunch.complete_balanced.energy", from: 40, to: 45 },
    ]);
    expect(mealShareChanges(after, copyOf(after))).toEqual([]);
  });
});

describe("mealTargets", () => {
  it("gives the weights of the table on the reference day", () => {
    const targets = mealTargets(referenceDay, DAY);
    expect(targets.energy).toBe("ok");
    expect(targets.protein).toBe("ok");
    expect(byMeal(targets)).toEqual({
      breakfast: { energyKcal: 500, proteinG: 25 },
      lunch: { energyKcal: 800, proteinG: 30 },
      snack: { energyKcal: 200, proteinG: 4 },
      dinner: { energyKcal: 500, proteinG: 25 },
    });
  });

  it.each(mealOrientations)(
    "sums to the day's targets with the four meals « %s »",
    (orientation) => {
      const targets = mealTargets(allOn(orientation), DAY);
      expect(targets.meals.map((meal) => meal.orientation)).toEqual([
        orientation,
        orientation,
        orientation,
        orientation,
      ]);
      expect(sum(targets.meals.map((meal) => meal.energyKcal))).toBe(2000);
      expect(sum(targets.meals.map((meal) => meal.proteinG))).toBe(84);
      for (const meal of targets.meals) {
        expect(meal.energyKcal).toBeGreaterThan(0);
        expect(meal.proteinG).toBeGreaterThan(0);
        expect(Number.isInteger(meal.energyKcal)).toBe(true);
        expect(Number.isInteger(meal.proteinG)).toBe(true);
      }
    },
  );

  it.each(mealOrientations)(
    "divides in proportion to the weights of « %s »",
    (orientation) => {
      const weights = mealSlots.map(
        (meal) => defaultMealShareTable[meal][orientation].energy,
      );
      const total = weights.reduce((a, b) => a + b, 0);
      const targets = mealTargets(allOn(orientation), DAY);
      targets.meals.forEach((meal, index) => {
        const exact = (2000 * (weights[index] ?? 0)) / total;
        expect(Math.abs((meal.energyKcal ?? 0) - exact)).toBeLessThan(1);
      });
    },
  );

  it("gives a « Léger » dinner less energy than a « Complet » dinner", () => {
    const light = mealTargets(referenceDay, DAY);
    const complete = mealTargets(
      {
        ...referenceDay,
        meals: {
          ...referenceDay.meals,
          dinner: { enabled: true, orientation: "complete_balanced" },
        },
      },
      DAY,
    );
    expect(byMeal(light).dinner.energyKcal).toBeLessThan(
      byMeal(complete).dinner.energyKcal ?? 0,
    );
  });

  it("gives zero to a meal that is off, and its part to the other meals", () => {
    // Morgane's default day: the snack is off.
    const targets = mealTargets(defaultMealConfiguration, DAY);
    expect(byMeal(targets)).toEqual({
      // Energy weights 25, 40, 25 of 90. Protein weights 30, 35, 30 of 95.
      breakfast: { energyKcal: 556, proteinG: 27 },
      lunch: { energyKcal: 889, proteinG: 31 },
      snack: { energyKcal: 0, proteinG: 0 },
      dinner: { energyKcal: 555, proteinG: 26 },
    });
    expect(targets.meals[2]).toMatchObject({
      active: false,
      orientation: null,
    });
    expect(sum(targets.meals.map((meal) => meal.energyKcal))).toBe(2000);
    expect(sum(targets.meals.map((meal) => meal.proteinG))).toBe(84);
    // Each active meal carries more than on the reference day.
    const reference = byMeal(mealTargets(referenceDay, DAY));
    for (const meal of ["breakfast", "lunch", "dinner"] as const) {
      expect(byMeal(targets)[meal].energyKcal).toBeGreaterThan(
        reference[meal].energyKcal ?? 0,
      );
    }
  });

  it.each([
    ["skip_breakfast", "breakfast"],
    ["skip_dinner", "dinner"],
  ] as const)(
    "gives zero to the meal that « %s » removes, whatever its switch says",
    (fasting, removed) => {
      for (const orientation of mealOrientations) {
        const targets = mealTargets(allOn(orientation, fasting), DAY);
        const meals = byMeal(targets);
        expect(meals[removed]).toEqual({ energyKcal: 0, proteinG: 0 });
        expect(sum(targets.meals.map((meal) => meal.energyKcal))).toBe(2000);
        expect(sum(targets.meals.map((meal) => meal.proteinG))).toBe(84);
        for (const meal of mealSlots.filter((slot) => slot !== removed)) {
          expect(meals[meal].energyKcal).toBeGreaterThan(0);
        }
      }
    },
  );

  it("gives the whole day to the one meal that is left", () => {
    const targets = mealTargets(
      {
        meals: {
          breakfast: { enabled: true, orientation: "protein_fat" },
          lunch: { enabled: true, orientation: "complete_balanced" },
          snack: { enabled: false, orientation: null },
          dinner: { enabled: false, orientation: "light_plant" },
        },
        fasting: "skip_breakfast",
      },
      DAY,
    );
    expect(byMeal(targets)).toEqual({
      breakfast: { energyKcal: 0, proteinG: 0 },
      lunch: { energyKcal: 2000, proteinG: 84 },
      snack: { energyKcal: 0, proteinG: 0 },
      dinner: { energyKcal: 0, proteinG: 0 },
    });
  });

  it("gives no value for a column with no validated target", () => {
    const targets = mealTargets(defaultMealConfiguration, {
      energyKcal: null,
      proteinG: 84,
    });
    expect(targets.energy).toBe("no_validated_target");
    expect(targets.protein).toBe("ok");
    expect(targets.meals.map((meal) => meal.energyKcal)).toEqual([
      null,
      null,
      null,
      null,
    ]);
    expect(sum(targets.meals.map((meal) => meal.proteinG))).toBe(84);

    const none = mealTargets(defaultMealConfiguration, {
      energyKcal: null,
      proteinG: null,
    });
    expect(none.energy).toBe("no_validated_target");
    expect(none.protein).toBe("no_validated_target");
    expect(
      none.meals.every(
        (meal) => meal.energyKcal === null && meal.proteinG === null,
      ),
    ).toBe(true);
  });

  it("gives no value when no meal is active", () => {
    for (const configuration of [
      null,
      { ...allOn("free"), meals: allOffMeals },
    ]) {
      const targets = mealTargets(configuration, DAY);
      expect(targets.energy).toBe("no_active_meal");
      expect(targets.protein).toBe("no_active_meal");
      expect(targets.meals).toHaveLength(4);
      expect(
        targets.meals.every(
          (meal) =>
            !meal.active && meal.energyKcal === null && meal.proteinG === null,
        ),
      ).toBe(true);
    }
  });

  it("reads an active meal with no orientation as « Libre »", () => {
    const withNull = mealTargets(
      {
        ...allOn("free"),
        meals: {
          ...allOn("free").meals,
          lunch: { enabled: true, orientation: null },
        },
      },
      DAY,
    );
    expect(withNull.meals[1]?.orientation).toBe("free");
    expect(byMeal(withNull)).toEqual(byMeal(mealTargets(allOn("free"), DAY)));
  });

  it("keeps the fraction of a day's target that is not a whole number", () => {
    const targets = mealTargets(referenceDay, {
      energyKcal: 2000.5,
      proteinG: 84.5,
    });
    // The fraction goes to the meal with the largest weight: the lunch.
    expect(byMeal(targets).lunch).toEqual({ energyKcal: 800.5, proteinG: 30.5 });
    expect(sum(targets.meals.map((meal) => meal.energyKcal))).toBe(2000.5);
    expect(sum(targets.meals.map((meal) => meal.proteinG))).toBe(84.5);
  });

  it("gives the earlier meal the unit on equal remainders", () => {
    const table = copyOf(defaultMealShareTable);
    for (const meal of mealSlots) {
      table[meal].free = { energy: 25, protein: 25 };
    }
    const targets = mealTargets(
      allOn("free"),
      { energyKcal: 10, proteinG: 2 },
      table,
    );
    expect(targets.meals.map((meal) => meal.energyKcal)).toEqual([3, 3, 2, 2]);
    expect(targets.meals.map((meal) => meal.proteinG)).toEqual([1, 1, 0, 0]);
  });

  it("uses the table that it is given", () => {
    const table = copyOf(defaultMealShareTable);
    table.breakfast.protein_fat.energy = 20;
    table.lunch.complete_balanced.energy = 45;
    expect(byMeal(mealTargets(referenceDay, DAY, table))).toMatchObject({
      breakfast: { energyKcal: 400 },
      lunch: { energyKcal: 900 },
    });
  });
});
