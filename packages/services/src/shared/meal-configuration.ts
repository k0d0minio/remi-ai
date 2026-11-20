/**
 * The meal configuration of a patient file — REM-68 and REM-70, stories 11
 * and 12.
 *
 * The practitioner sets which of the four meals the patient eats, the
 * orientation of each, and the intermittent fasting option. An orientation is
 * a soft preference: it has no macronutrient quota.
 *
 * Each value has three states: not entered (`null`), and its values. REMI
 * enters no value: a file with no configuration reads « Non renseigné ».
 * Morgane's table of story 11 (`defaultMealConfiguration`) applies only when
 * the practitioner asks for it.
 *
 * The fasting option and the switch of a meal are two facts. `mealSlotState`
 * is the one reading of the two: a meal that the fasting removes is removed,
 * whatever its switch says.
 *
 * Isomorphic and pure: no I/O and no clock.
 */

export const mealSlots = ["breakfast", "lunch", "snack", "dinner"] as const;

export type MealSlot = (typeof mealSlots)[number];

/** The five orientations of story 11, in the order of Morgane's table. */
export const mealOrientations = [
  "protein_fat",
  "complete_balanced",
  "light_plant",
  "carb_leaning",
  "free",
] as const;

export type MealOrientation = (typeof mealOrientations)[number];

/** The three options of story 12. `none` is « Aucun jeûne intermittent ». */
export const mealFastingOptions = [
  "none",
  "skip_breakfast",
  "skip_dinner",
] as const;

export type MealFasting = (typeof mealFastingOptions)[number];

export type MealSlotSetting = {
  /** Null: the practitioner has not said whether the patient eats it. */
  enabled: boolean | null;
  /** Null: no orientation is chosen. Kept while the meal is off. */
  orientation: MealOrientation | null;
};

export type MealConfiguration = {
  meals: Record<MealSlot, MealSlotSetting>;
  /** Null: the practitioner has not chosen an option. */
  fasting: MealFasting | null;
};

const notEntered: MealSlotSetting = { enabled: null, orientation: null };

/** The configuration of a file with no value at all. */
export const emptyMealConfiguration: MealConfiguration = {
  meals: {
    breakfast: notEntered,
    lunch: notEntered,
    snack: notEntered,
    dinner: notEntered,
  },
  fasting: null,
};

/**
 * Morgane's table of story 11, and « Aucun jeûne intermittent » of story 12.
 * The snack is off and keeps its orientation.
 */
export const defaultMealConfiguration: MealConfiguration = {
  meals: {
    breakfast: { enabled: true, orientation: "protein_fat" },
    lunch: { enabled: true, orientation: "complete_balanced" },
    snack: { enabled: false, orientation: "carb_leaning" },
    dinner: { enabled: true, orientation: "light_plant" },
  },
  fasting: "none",
};

/** True when no value is entered. */
export const isMealConfigurationEmpty = (
  configuration: MealConfiguration,
): boolean =>
  configuration.fasting === null &&
  mealSlots.every(
    (meal) =>
      configuration.meals[meal].enabled === null &&
      configuration.meals[meal].orientation === null,
  );

/** The meal that a fasting option removes, or null. */
export const mealRemovedByFasting = (
  fasting: MealFasting | null,
): MealSlot | null => {
  if (fasting === "skip_breakfast") {
    return "breakfast";
  }
  if (fasting === "skip_dinner") {
    return "dinner";
  }
  return null;
};

/**
 * What a meal is, from its switch and the fasting option together:
 * - `removed_by_fasting`: the fasting option removes it. This wins over the
 *   switch, so the two settings give one result (story 12, question 2).
 * - `not_entered`: the practitioner has not set the switch.
 * - `on` and `off`: the switch.
 */
export type MealSlotState = "removed_by_fasting" | "not_entered" | "on" | "off";

export const mealSlotState = (
  configuration: MealConfiguration,
  meal: MealSlot,
): MealSlotState => {
  if (mealRemovedByFasting(configuration.fasting) === meal) {
    return "removed_by_fasting";
  }
  const { enabled } = configuration.meals[meal];
  if (enabled === null) {
    return "not_entered";
  }
  return enabled ? "on" : "off";
};

/** The meals that the patient eats: the switch is on and no fasting removes it. */
export const activeMealSlots = (configuration: MealConfiguration): MealSlot[] =>
  mealSlots.filter((meal) => mealSlotState(configuration, meal) === "on");

/** One act of the practitioner on the configuration. */
export type MealConfigurationChange =
  | { type: "meal_enabled"; meal: MealSlot; enabled: boolean }
  | { type: "meal_orientation"; meal: MealSlot; orientation: MealOrientation }
  | { type: "fasting"; fasting: MealFasting }
  /** Morgane's table, for each value that is not entered. */
  | { type: "defaults" };

const isOneOf = <T extends string>(
  list: readonly T[],
  value: unknown,
): value is T => typeof value === "string" && list.includes(value as T);

/**
 * Reads a change from an untyped value. Null for a value that is not a
 * change: the caller refuses it.
 */
export const parseMealConfigurationChange = (
  value: unknown,
): MealConfigurationChange | null => {
  if (typeof value !== "object" || value === null) {
    return null;
  }
  const change = value as Record<string, unknown>;
  if (change.type === "defaults") {
    return { type: "defaults" };
  }
  if (change.type === "fasting" && isOneOf(mealFastingOptions, change.fasting)) {
    return { type: "fasting", fasting: change.fasting };
  }
  if (!isOneOf(mealSlots, change.meal)) {
    return null;
  }
  if (change.type === "meal_enabled" && typeof change.enabled === "boolean") {
    return { type: "meal_enabled", meal: change.meal, enabled: change.enabled };
  }
  if (
    change.type === "meal_orientation" &&
    isOneOf(mealOrientations, change.orientation)
  ) {
    return {
      type: "meal_orientation",
      meal: change.meal,
      orientation: change.orientation,
    };
  }
  return null;
};

/**
 * The configuration after one change. The input is not changed.
 *
 * - A meal that is switched on with no orientation takes the orientation of
 *   Morgane's table for that meal (story 11, question 2: the snack starts as
 *   « Plutôt glucidique »). An orientation that is entered is kept.
 * - A meal that is switched off keeps its orientation.
 * - The fasting option does not change a switch: `mealSlotState` reads the
 *   two. Thus the meal comes back as it was when the fasting is removed.
 * - `defaults` fills each value that is not entered. It replaces no value.
 */
export const applyMealConfigurationChange = (
  current: MealConfiguration,
  change: MealConfigurationChange,
): MealConfiguration => {
  if (change.type === "fasting") {
    return { ...current, fasting: change.fasting };
  }
  if (change.type === "defaults") {
    return {
      meals: Object.fromEntries(
        mealSlots.map((meal) => [
          meal,
          {
            enabled:
              current.meals[meal].enabled ??
              defaultMealConfiguration.meals[meal].enabled,
            orientation:
              current.meals[meal].orientation ??
              defaultMealConfiguration.meals[meal].orientation,
          },
        ]),
      ) as Record<MealSlot, MealSlotSetting>,
      fasting: current.fasting ?? defaultMealConfiguration.fasting,
    };
  }
  const setting = current.meals[change.meal];
  const next: MealSlotSetting =
    change.type === "meal_orientation"
      ? { ...setting, orientation: change.orientation }
      : {
          enabled: change.enabled,
          orientation:
            setting.orientation ??
            (change.enabled
              ? defaultMealConfiguration.meals[change.meal].orientation
              : null),
        };
  return { ...current, meals: { ...current.meals, [change.meal]: next } };
};

/** One value that a change moved, for the audit event. No patient text. */
export type MealConfigurationFieldChange = {
  /** `fasting`, `<meal>.enabled` or `<meal>.orientation`. */
  field: string;
  from: string | boolean | null;
  to: string | boolean | null;
};

/** The values that differ between two configurations, in a fixed order. */
export const mealConfigurationChanges = (
  before: MealConfiguration,
  after: MealConfiguration,
): MealConfigurationFieldChange[] => {
  const changes: MealConfigurationFieldChange[] = [];
  for (const meal of mealSlots) {
    for (const key of ["enabled", "orientation"] as const) {
      const from = before.meals[meal][key];
      const to = after.meals[meal][key];
      if (from !== to) {
        changes.push({ field: `${meal}.${key}`, from, to });
      }
    }
  }
  if (before.fasting !== after.fasting) {
    changes.push({ field: "fasting", from: before.fasting, to: after.fasting });
  }
  return changes;
};
