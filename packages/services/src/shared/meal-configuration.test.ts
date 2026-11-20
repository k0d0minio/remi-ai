import { describe, expect, it } from "vitest";
import {
  activeMealSlots,
  applyMealConfigurationChange,
  defaultMealConfiguration,
  emptyMealConfiguration,
  isMealConfigurationEmpty,
  mealConfigurationChanges,
  mealFastingOptions,
  mealOrientations,
  mealRemovedByFasting,
  mealSlotState,
  mealSlots,
  parseMealConfigurationChange,
} from "./meal-configuration";

describe("the vocabulary of the meal configuration", () => {
  it("has the four meals, the five orientations and the three options", () => {
    expect(mealSlots).toEqual(["breakfast", "lunch", "snack", "dinner"]);
    expect(mealOrientations).toHaveLength(5);
    expect(mealFastingOptions).toEqual([
      "none",
      "skip_breakfast",
      "skip_dinner",
    ]);
  });

  it("has Morgane's table as the default, with the snack off", () => {
    expect(defaultMealConfiguration).toEqual({
      meals: {
        breakfast: { enabled: true, orientation: "protein_fat" },
        lunch: { enabled: true, orientation: "complete_balanced" },
        snack: { enabled: false, orientation: "carb_leaning" },
        dinner: { enabled: true, orientation: "light_plant" },
      },
      fasting: "none",
    });
  });
});

describe("isMealConfigurationEmpty", () => {
  it("is true only when no value is entered", () => {
    expect(isMealConfigurationEmpty(emptyMealConfiguration)).toBe(true);
    expect(isMealConfigurationEmpty(defaultMealConfiguration)).toBe(false);
    expect(
      isMealConfigurationEmpty({ ...emptyMealConfiguration, fasting: "none" }),
    ).toBe(false);
    expect(
      isMealConfigurationEmpty(
        applyMealConfigurationChange(emptyMealConfiguration, {
          type: "meal_enabled",
          meal: "lunch",
          enabled: false,
        }),
      ),
    ).toBe(false);
  });
});

describe("applyMealConfigurationChange", () => {
  it("does not change its input", () => {
    applyMealConfigurationChange(emptyMealConfiguration, { type: "defaults" });
    expect(isMealConfigurationEmpty(emptyMealConfiguration)).toBe(true);
  });

  it("enters only the value of the change", () => {
    const next = applyMealConfigurationChange(emptyMealConfiguration, {
      type: "fasting",
      fasting: "skip_dinner",
    });
    expect(next).toEqual({ ...emptyMealConfiguration, fasting: "skip_dinner" });
  });

  it("gives a meal that is switched on the orientation of Morgane's table", () => {
    const next = applyMealConfigurationChange(emptyMealConfiguration, {
      type: "meal_enabled",
      meal: "snack",
      enabled: true,
    });
    expect(next.meals.snack).toEqual({
      enabled: true,
      orientation: "carb_leaning",
    });
    expect(next.meals.breakfast).toEqual({ enabled: null, orientation: null });
    expect(next.fasting).toBeNull();
  });

  it("gives no orientation to a meal that is switched off", () => {
    const next = applyMealConfigurationChange(emptyMealConfiguration, {
      type: "meal_enabled",
      meal: "dinner",
      enabled: false,
    });
    expect(next.meals.dinner).toEqual({ enabled: false, orientation: null });
  });

  it("keeps the orientation that is entered, on and off", () => {
    const chosen = applyMealConfigurationChange(defaultMealConfiguration, {
      type: "meal_orientation",
      meal: "breakfast",
      orientation: "free",
    });
    const off = applyMealConfigurationChange(chosen, {
      type: "meal_enabled",
      meal: "breakfast",
      enabled: false,
    });
    const on = applyMealConfigurationChange(off, {
      type: "meal_enabled",
      meal: "breakfast",
      enabled: true,
    });
    expect(off.meals.breakfast).toEqual({ enabled: false, orientation: "free" });
    expect(on.meals.breakfast).toEqual({ enabled: true, orientation: "free" });
  });

  it("sets each of the five orientations on each of the four meals", () => {
    for (const meal of mealSlots) {
      for (const orientation of mealOrientations) {
        const next = applyMealConfigurationChange(defaultMealConfiguration, {
          type: "meal_orientation",
          meal,
          orientation,
        });
        expect(next.meals[meal].orientation).toBe(orientation);
        expect(next.meals[meal].enabled).toBe(
          defaultMealConfiguration.meals[meal].enabled,
        );
      }
    }
  });

  it("does not change a switch when the fasting option changes", () => {
    const next = applyMealConfigurationChange(defaultMealConfiguration, {
      type: "fasting",
      fasting: "skip_breakfast",
    });
    expect(next.meals).toEqual(defaultMealConfiguration.meals);
  });

  it("applies the defaults to an empty configuration", () => {
    expect(
      applyMealConfigurationChange(emptyMealConfiguration, {
        type: "defaults",
      }),
    ).toEqual(defaultMealConfiguration);
  });

  it("replaces no entered value with a default", () => {
    const entered = applyMealConfigurationChange(
      applyMealConfigurationChange(emptyMealConfiguration, {
        type: "fasting",
        fasting: "skip_dinner",
      }),
      { type: "meal_enabled", meal: "breakfast", enabled: false },
    );
    const next = applyMealConfigurationChange(entered, { type: "defaults" });
    expect(next.fasting).toBe("skip_dinner");
    expect(next.meals.breakfast).toEqual({
      enabled: false,
      orientation: "protein_fat",
    });
    expect(next.meals.snack).toEqual(defaultMealConfiguration.meals.snack);
  });
});

describe("mealSlotState", () => {
  it("reads « not entered » for each meal of an empty configuration", () => {
    for (const meal of mealSlots) {
      expect(mealSlotState(emptyMealConfiguration, meal)).toBe("not_entered");
    }
  });

  it("reads the switch when no fasting removes the meal", () => {
    expect(mealSlotState(defaultMealConfiguration, "breakfast")).toBe("on");
    expect(mealSlotState(defaultMealConfiguration, "snack")).toBe("off");
  });

  it("reads a meal that the fasting removes as removed, whatever its switch", () => {
    for (const enabled of [true, false, null]) {
      const configuration = {
        ...defaultMealConfiguration,
        meals: {
          ...defaultMealConfiguration.meals,
          dinner: { enabled, orientation: null },
        },
        fasting: "skip_dinner" as const,
      };
      expect(mealSlotState(configuration, "dinner")).toBe("removed_by_fasting");
      expect(mealSlotState(configuration, "breakfast")).toBe("on");
    }
  });

  it("names the meal that each option removes", () => {
    expect(mealRemovedByFasting(null)).toBeNull();
    expect(mealRemovedByFasting("none")).toBeNull();
    expect(mealRemovedByFasting("skip_breakfast")).toBe("breakfast");
    expect(mealRemovedByFasting("skip_dinner")).toBe("dinner");
  });
});

describe("activeMealSlots", () => {
  it("lists the meals that are on and that no fasting removes", () => {
    expect(activeMealSlots(emptyMealConfiguration)).toEqual([]);
    expect(activeMealSlots(defaultMealConfiguration)).toEqual([
      "breakfast",
      "lunch",
      "dinner",
    ]);
    expect(
      activeMealSlots({ ...defaultMealConfiguration, fasting: "skip_breakfast" }),
    ).toEqual(["lunch", "dinner"]);
  });
});

describe("mealConfigurationChanges", () => {
  it("is empty for two equal configurations", () => {
    expect(
      mealConfigurationChanges(defaultMealConfiguration, defaultMealConfiguration),
    ).toEqual([]);
  });

  it("names each value that moved, with the old and the new value", () => {
    const after = applyMealConfigurationChange(emptyMealConfiguration, {
      type: "meal_enabled",
      meal: "snack",
      enabled: true,
    });
    expect(mealConfigurationChanges(emptyMealConfiguration, after)).toEqual([
      { field: "snack.enabled", from: null, to: true },
      { field: "snack.orientation", from: null, to: "carb_leaning" },
    ]);
    expect(
      mealConfigurationChanges(after, { ...after, fasting: "none" }),
    ).toEqual([{ field: "fasting", from: null, to: "none" }]);
  });
});

describe("parseMealConfigurationChange", () => {
  it("reads each kind of change", () => {
    expect(parseMealConfigurationChange({ type: "defaults" })).toEqual({
      type: "defaults",
    });
    expect(
      parseMealConfigurationChange({ type: "fasting", fasting: "none" }),
    ).toEqual({ type: "fasting", fasting: "none" });
    expect(
      parseMealConfigurationChange({
        type: "meal_enabled",
        meal: "lunch",
        enabled: false,
        extra: 1,
      }),
    ).toEqual({ type: "meal_enabled", meal: "lunch", enabled: false });
    expect(
      parseMealConfigurationChange({
        type: "meal_orientation",
        meal: "dinner",
        orientation: "free",
      }),
    ).toEqual({ type: "meal_orientation", meal: "dinner", orientation: "free" });
  });

  it("refuses a value that is not a change", () => {
    for (const value of [
      null,
      "defaults",
      {},
      { type: "fasting", fasting: "skip_lunch" },
      { type: "meal_enabled", meal: "brunch", enabled: true },
      { type: "meal_enabled", meal: "lunch", enabled: "yes" },
      { type: "meal_orientation", meal: "lunch", orientation: "keto" },
      { type: "meal_time", meal: "lunch", time: "12:00" },
    ]) {
      expect(parseMealConfigurationChange(value)).toBeNull();
    }
  });
});
