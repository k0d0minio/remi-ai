/**
 * The share of the day that each meal carries — REM-197, decision M5 of
 * `.icm/docs/research/recipe-generation.md` (section 9).
 *
 * The validated protocol gives targets for the whole day. To build one meal,
 * REMI must know which part of the day's energy and protein that meal
 * carries. `defaultMealShareTable` is the first table. Morgane corrects it in
 * the console (`server/meal-shares`), and the corrected table is one value of
 * `app_settings`.
 *
 * A share is a weight, not a quota (story 11: no strict macronutrient
 * quota for each meal). `mealTargets` divides the day between the active
 * meals in proportion to their weights. Thus a meal that is off, or that the
 * fasting option removes, gets zero, and the other meals carry its part.
 *
 * Isomorphic and pure: no I/O and no clock.
 */

import {
  defaultMealConfiguration,
  mealOrientations,
  mealSlots,
  mealSlotState,
  type MealConfiguration,
  type MealOrientation,
  type MealSlot,
} from "./meal-configuration";

/** The two day targets that a meal takes a part of. */
export const mealShareNutrients = ["energy", "protein"] as const;

export type MealShareNutrient = (typeof mealShareNutrients)[number];

/** The weight of one meal with one orientation, in percent of the day. */
export type MealShare = Record<MealShareNutrient, number>;

export type MealShareTable = Record<
  MealSlot,
  Record<MealOrientation, MealShare>
>;

/** A weight is a whole number of percent in this range. */
export const MEAL_SHARE_MIN = 1;
export const MEAL_SHARE_MAX = 100;

/**
 * The first table: a draft for Morgane to correct. No number in it is hers.
 *
 * The text of story 11 is not in this repository. Its summary
 * (`.icm/intake/meal-structure/breakdown.md`) gives the five orientations and
 * her default day, and it gives no percentage. Thus each number below rests on
 * one of these four grounds, and on nothing else:
 *
 * 1. Energy by meal. The reference day is her default day with the snack on:
 *    breakfast « Protéiné et lipidique » 25, lunch « Complet et équilibré »
 *    40, snack « Plutôt glucidique » 10, dinner « Léger à dominante
 *    végétale » 25. This is the usual split of French and Belgian dietetic
 *    practice (about a quarter in the morning, the largest meal at noon, a
 *    small snack), with the dinner at the low end because her default dinner
 *    is « léger ». It is a convention, not a measured value.
 * 2. Protein by meal. Section 3.3 of the research: a review proposes about
 *    0.4 g/kg for each main meal, and the split is a soft preference. So the
 *    three main meals carry near-equal protein (30, 35, 30) and the snack
 *    carries little (5). Example, as a check only: 84 g for the day on her
 *    default day of three meals gives 27 g, 31 g and 26 g, that is 0.37 to
 *    0.44 g/kg for a person of 70 kg.
 * 3. The orientation of a meal moves its weight from the « Complet et
 *    équilibré » row, by the words of her table. The size of each move
 *    (5 or 10 points) is our guess. « Léger » carries 5 points less energy,
 *    and 5 points less protein at a main meal. « Protéiné et lipidique »
 *    carries 5 points more protein. « Plutôt glucidique » carries 5 to 10
 *    points less protein at a main meal. A main meal never falls under 15 %
 *    of the day's protein, so that each main meal keeps a sufficient part
 *    (the note of REM-197).
 * 4. « Libre / selon les besoins » states no preference. It takes the
 *    « Complet et équilibré » row.
 *
 * The rule of the table: on the reference day, each column is 100 %.
 */
export const defaultMealShareTable: MealShareTable = {
  breakfast: {
    protein_fat: { energy: 25, protein: 30 },
    complete_balanced: { energy: 25, protein: 25 },
    light_plant: { energy: 20, protein: 20 },
    carb_leaning: { energy: 25, protein: 15 },
    free: { energy: 25, protein: 25 },
  },
  lunch: {
    protein_fat: { energy: 40, protein: 40 },
    complete_balanced: { energy: 40, protein: 35 },
    light_plant: { energy: 35, protein: 30 },
    carb_leaning: { energy: 40, protein: 30 },
    free: { energy: 40, protein: 35 },
  },
  snack: {
    protein_fat: { energy: 10, protein: 10 },
    complete_balanced: { energy: 10, protein: 5 },
    light_plant: { energy: 5, protein: 5 },
    carb_leaning: { energy: 10, protein: 5 },
    free: { energy: 10, protein: 5 },
  },
  dinner: {
    protein_fat: { energy: 30, protein: 40 },
    complete_balanced: { energy: 30, protein: 35 },
    light_plant: { energy: 25, protein: 30 },
    carb_leaning: { energy: 30, protein: 25 },
    free: { energy: 30, protein: 35 },
  },
};

/**
 * The orientation of each meal on the reference day: Morgane's table of story
 * 11, with the four meals on. The validation of a table reads these four
 * cells of each column.
 */
export const referenceDayOrientations: Record<MealSlot, MealOrientation> = {
  breakfast: defaultMealConfiguration.meals.breakfast.orientation ?? "free",
  lunch: defaultMealConfiguration.meals.lunch.orientation ?? "free",
  snack: defaultMealConfiguration.meals.snack.orientation ?? "free",
  dinner: defaultMealConfiguration.meals.dinner.orientation ?? "free",
};

/** The sum of one column on the reference day. A valid table gives 100. */
export const referenceDayTotal = (
  table: MealShareTable,
  nutrient: MealShareNutrient,
): number =>
  mealSlots.reduce(
    (sum, meal) => sum + table[meal][referenceDayOrientations[meal]][nutrient],
    0,
  );

export type MealShareTableProblem =
  /** The value is not a table: a cell is absent or is not a number. */
  | { type: "malformed" }
  /** A cell is not a whole number from 1 to 100. */
  | {
      type: "out_of_range";
      meal: MealSlot;
      orientation: MealOrientation;
      nutrient: MealShareNutrient;
    }
  /** A column of the reference day does not give 100. */
  | { type: "reference_total"; nutrient: MealShareNutrient; total: number };

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

/**
 * Reads a table from an untyped value: a form of the console, or the JSON of
 * `app_settings`. It returns the table with only the known cells, or the
 * problems. A table with a problem is never used.
 */
export const parseMealShareTable = (
  value: unknown,
):
  | { ok: true; table: MealShareTable }
  | { ok: false; problems: MealShareTableProblem[] } => {
  if (!isRecord(value)) {
    return { ok: false, problems: [{ type: "malformed" }] };
  }
  const problems: MealShareTableProblem[] = [];
  const table = {} as MealShareTable;
  for (const meal of mealSlots) {
    const row = value[meal];
    if (!isRecord(row)) {
      return { ok: false, problems: [{ type: "malformed" }] };
    }
    table[meal] = {} as Record<MealOrientation, MealShare>;
    for (const orientation of mealOrientations) {
      const cell = row[orientation];
      if (!isRecord(cell)) {
        return { ok: false, problems: [{ type: "malformed" }] };
      }
      const share = {} as MealShare;
      for (const nutrient of mealShareNutrients) {
        const weight = cell[nutrient];
        if (typeof weight !== "number" || Number.isNaN(weight)) {
          return { ok: false, problems: [{ type: "malformed" }] };
        }
        if (
          !Number.isInteger(weight) ||
          weight < MEAL_SHARE_MIN ||
          weight > MEAL_SHARE_MAX
        ) {
          problems.push({ type: "out_of_range", meal, orientation, nutrient });
        }
        share[nutrient] = weight;
      }
      table[meal][orientation] = share;
    }
  }
  if (problems.length > 0) {
    return { ok: false, problems };
  }
  for (const nutrient of mealShareNutrients) {
    const total = referenceDayTotal(table, nutrient);
    if (total !== 100) {
      problems.push({ type: "reference_total", nutrient, total });
    }
  }
  return problems.length > 0 ? { ok: false, problems } : { ok: true, table };
};

/** One cell that differs between two tables, for the audit event. */
export type MealShareChange = {
  /** `<meal>.<orientation>.<nutrient>`. */
  cell: string;
  from: number;
  to: number;
};

/** The cells that differ between two tables, in the order of the table. */
export const mealShareChanges = (
  before: MealShareTable,
  after: MealShareTable,
): MealShareChange[] => {
  const changes: MealShareChange[] = [];
  for (const meal of mealSlots) {
    for (const orientation of mealOrientations) {
      for (const nutrient of mealShareNutrients) {
        const from = before[meal][orientation][nutrient];
        const to = after[meal][orientation][nutrient];
        if (from !== to) {
          changes.push({ cell: `${meal}.${orientation}.${nutrient}`, from, to });
        }
      }
    }
  }
  return changes;
};

/**
 * The validated targets of the day. Null: the practitioner has validated no
 * value, or the value needs a new validation. REMI's estimate is never given
 * here (D-30).
 */
export type DayTargets = {
  energyKcal: number | null;
  proteinG: number | null;
};

export type MealTarget = {
  meal: MealSlot;
  /** True when the patient eats the meal: its switch is on, no fasting removes it. */
  active: boolean;
  /**
   * The orientation that gave the weight. An active meal with no orientation
   * is read as « Libre / selon les besoins ». Null for a meal that is not
   * active.
   */
  orientation: MealOrientation | null;
  /** kcal. Zero for a meal that is not active. Null: see `MealTargets.energy`. */
  energyKcal: number | null;
  /** Grams. Zero for a meal that is not active. Null: see `MealTargets.protein`. */
  proteinG: number | null;
};

/**
 * Why a column has values or has none:
 * - `ok`: each meal has a value, and the values sum to the day's target.
 * - `no_validated_target`: the day has no validated value. No value is given.
 * - `no_active_meal`: no meal can carry the day. No value is given.
 */
export type MealTargetStatus = "ok" | "no_validated_target" | "no_active_meal";

export type MealTargets = {
  energy: MealTargetStatus;
  protein: MealTargetStatus;
  /** The four meals, in the order of the day. */
  meals: MealTarget[];
};

/**
 * Divides a total between weights, in whole units, so that the parts sum to
 * the total exactly (the largest-remainder rule):
 * 1. Each part is its exact value rounded down to the unit.
 * 2. The units that remain go one by one to the parts with the largest
 *    remainder. On equal remainders the earlier meal of the day wins.
 * 3. A total that is not a whole number leaves a fraction under one unit. It
 *    goes to the part with the largest weight (the earlier meal on a tie).
 */
const divideInUnits = (total: number, weights: number[]): number[] => {
  const weightSum = weights.reduce((sum, weight) => sum + weight, 0);
  const units = Math.floor(total);
  const exact = weights.map((weight) => (units * weight) / weightSum);
  const parts = exact.map((value) => Math.floor(value));
  const byRemainder = exact
    .map((value, index) => ({ index, remainder: value - Math.floor(value) }))
    .sort((a, b) => b.remainder - a.remainder || a.index - b.index);
  let left = units - parts.reduce((sum, part) => sum + part, 0);
  for (const { index } of byRemainder) {
    if (left <= 0) {
      break;
    }
    parts[index] = (parts[index] ?? 0) + 1;
    left -= 1;
  }
  const fraction = total - units;
  if (fraction > 0) {
    const largest = weights.indexOf(Math.max(...weights));
    parts[largest] = (parts[largest] ?? 0) + fraction;
  }
  return parts;
};

/**
 * The energy and protein target of each meal of one patient.
 *
 * - An active meal takes the weight of its slot and its orientation. The day
 *   is divided between the active meals in proportion to these weights. Thus
 *   the part of a meal that is off or fasted goes to the other meals in
 *   proportion, and the values always sum to the day's target.
 * - A meal that is not active gets zero.
 * - Rounding: whole kcal and whole grams, by `divideInUnits`.
 * - With no validated target for a column, that column has no value at all
 *   and says `no_validated_target`. The other column is not affected.
 * - A file with no meal configuration has no active meal.
 */
export const mealTargets = (
  configuration: MealConfiguration | null,
  day: DayTargets,
  table: MealShareTable = defaultMealShareTable,
): MealTargets => {
  const rows = mealSlots.map((meal) => {
    const active =
      configuration !== null && mealSlotState(configuration, meal) === "on";
    const orientation = active
      ? (configuration?.meals[meal].orientation ?? "free")
      : null;
    return { meal, active, orientation };
  });
  const activeRows = rows.filter((row) => row.active);

  const column = (
    total: number | null,
    nutrient: MealShareNutrient,
  ): { status: MealTargetStatus; values: (number | null)[] } => {
    const none = rows.map(() => null);
    if (total === null || !Number.isFinite(total) || total < 0) {
      return { status: "no_validated_target", values: none };
    }
    if (activeRows.length === 0) {
      return { status: "no_active_meal", values: none };
    }
    const weights = rows.map((row) =>
      row.orientation === null ? 0 : table[row.meal][row.orientation][nutrient],
    );
    if (weights.every((weight) => weight <= 0)) {
      return { status: "no_active_meal", values: none };
    }
    return { status: "ok", values: divideInUnits(total, weights) };
  };

  const energy = column(day.energyKcal, "energy");
  const protein = column(day.proteinG, "protein");
  return {
    energy: energy.status,
    protein: protein.status,
    meals: rows.map((row, index) => ({
      ...row,
      energyKcal: energy.values[index] ?? null,
      proteinG: protein.values[index] ?? null,
    })),
  };
};
