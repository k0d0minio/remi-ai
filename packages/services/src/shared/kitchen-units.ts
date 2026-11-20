/**
 * The unit system of a recipe quantity — REM-190.
 *
 * One rule: each quantity is a weight in grams. This module writes a weight as
 * a text that a person reads in a kitchen (« 2 œufs », « 1 c. à soupe »,
 * « 150 g »), and reads the text back to a weight. It is pure: no table, no
 * clock.
 *
 * Where the values come from:
 * - A generic unit (c. à café, c. à soupe, pincée, verre, tasse) has a fixed
 *   volume, written here. Its weight is the volume times the density of the
 *   food. A food with no density has no generic unit.
 * - A food can have its own units with a weight (1 œuf = 55 g). They come from
 *   the food record, after a person confirmed them.
 * - With no confirmed unit, the caller gives `null` and the text is in grams.
 *   This module invents no weight (D-30).
 *
 * The rounding rule, one for all:
 * 1. Try the units in a fixed order: the food's own units in their order, then
 *    verre, tasse, c. à soupe, c. à café, pincée.
 * 2. A unit has a short list of counts that a person can measure. Take the
 *    count of the list that is nearest to the exact count.
 * 3. Keep the first unit whose rounded weight is inside the tolerance. Thus
 *    the text is never « 1,37 œuf »: it is « 1 œuf », or it is in grams.
 * 4. If no unit fits, write grams, rounded to a step that stays inside the
 *    same tolerance.
 *
 * Morgane has not validated the volumes and the tolerance. It is a debt of
 * REM-190.
 */

import { z } from "zod";

/** A unit of one food: « œuf », « œufs », 55. */
export type FoodUnit = {
  /** The French name for a count below 2. */
  one: string;
  /** The French name for a count of 2 and more. */
  many: string;
  /** The weight of one unit, in grams. */
  grams: number;
};

/** The confirmed units of one food. */
export type FoodKitchenUnits = {
  /** Grams for one millilitre. Set for a liquid or a powder, else null. */
  densityGPerMl: number | null;
  units: readonly FoodUnit[];
};

/** In the order of preference of the rounding rule. */
export const genericKitchenUnits = [
  "glass",
  "cup",
  "tbsp",
  "tsp",
  "pinch",
] as const;

export type GenericKitchenUnit = (typeof genericKitchenUnits)[number];

type GenericUnit = {
  /** The fixed volume, in millilitres. */
  ml: number;
  one: string;
  many: string;
  /** The counts that a person can measure with this unit. */
  counts: readonly number[];
};

export const genericKitchenUnitTable: Record<GenericKitchenUnit, GenericUnit> =
  {
    glass: { ml: 200, one: "verre", many: "verres", counts: [0.5, 1, 2, 3] },
    cup: { ml: 250, one: "tasse", many: "tasses", counts: [1, 2, 3] },
    tbsp: {
      ml: 15,
      one: "c. à soupe",
      many: "c. à soupe",
      counts: [0.5, 1, 2, 3, 4],
    },
    tsp: { ml: 5, one: "c. à café", many: "c. à café", counts: [0.5, 1, 2] },
    pinch: { ml: 0.3, one: "pincée", many: "pincées", counts: [1, 2] },
  };

/** A food's own unit is counted in whole units, up to this count. */
export const OWN_UNIT_MAX_COUNT = 12;

/**
 * The tolerance of a shown quantity: the weight that the text means differs
 * from the exact weight by 10 % at most, or by half a gram at most for a very
 * small weight. The larger of the two applies.
 */
export const KITCHEN_TOLERANCE_RATIO = 0.1;
export const KITCHEN_TOLERANCE_GRAMS = 0.5;

/** True when `shownGrams` is an acceptable text for `grams`. */
export const withinKitchenTolerance = (grams: number, shownGrams: number) =>
  Math.abs(shownGrams - grams) <=
  Math.max(grams * KITCHEN_TOLERANCE_RATIO, KITCHEN_TOLERANCE_GRAMS) + 1e-9;

export type KitchenUnitRef =
  | { kind: "gram" }
  | { kind: "generic"; unit: GenericKitchenUnit }
  /** A unit of the food, named by its `one`. */
  | { kind: "own"; one: string };

export type KitchenQuantity = {
  /** « 2 œufs », « 1/2 c. à café », « 150 g », « 1,25 kg ». */
  text: string;
  /** The count that the text shows. For grams: the grams shown. */
  count: number;
  unit: KitchenUnitRef;
  /** The weight that the text means. `kitchenQuantityToGrams` gives the same. */
  grams: number;
};

const usableWeight = (grams: number) => Number.isFinite(grams) && grams > 0;

const usableDensity = (units: FoodKitchenUnits | null): number | null =>
  units !== null &&
  units.densityGPerMl !== null &&
  usableWeight(units.densityGPerMl)
    ? units.densityGPerMl
    : null;

const nearest = (counts: readonly number[], exact: number) =>
  counts.reduce((best, count) =>
    Math.abs(count - exact) < Math.abs(best - exact) ? count : best,
  );

const decimal = (value: number) => String(value).replace(".", ",");

const countText = (count: number) => (count === 0.5 ? "1/2" : decimal(count));

const unitText = (count: number, one: string, many: string) =>
  `${countText(count)} ${count >= 2 ? many : one}`;

/** The step of a weight in grams. Each step stays inside the tolerance. */
const gramStep = (grams: number) => {
  if (grams < 1) {
    return 0.1;
  }
  if (grams < 25) {
    return 1;
  }
  if (grams < 250) {
    return 5;
  }
  if (grams < 1000) {
    return 10;
  }
  return 50;
};

const inGrams = (grams: number): KitchenQuantity => {
  const step = gramStep(grams);
  // Below 1 g the step is a tenth: this form keeps 0,3 as 0,3 and not as
  // 0,30000000000000004.
  const rounded = Math.max(
    step,
    step < 1 ? Math.round(grams * 10) / 10 : Math.round(grams / step) * step,
  );
  return {
    text:
      rounded >= 1000 ? `${decimal(rounded / 1000)} kg` : `${decimal(rounded)} g`,
    count: rounded,
    unit: { kind: "gram" },
    grams: rounded,
  };
};

const ownCounts = Array.from(
  { length: OWN_UNIT_MAX_COUNT },
  (_, index) => index + 1,
);

/**
 * A weight as a kitchen quantity. `units` is null when the food has no
 * confirmed unit: the text is then in grams. Null for a weight that is not a
 * positive number: no text is invented.
 */
export const toKitchenQuantity = (
  grams: number,
  units: FoodKitchenUnits | null,
): KitchenQuantity | null => {
  if (!usableWeight(grams)) {
    return null;
  }
  for (const unit of units?.units ?? []) {
    if (!usableWeight(unit.grams)) {
      continue;
    }
    const count = nearest(ownCounts, grams / unit.grams);
    const shown = count * unit.grams;
    if (withinKitchenTolerance(grams, shown)) {
      return {
        text: unitText(count, unit.one, unit.many),
        count,
        unit: { kind: "own", one: unit.one },
        grams: shown,
      };
    }
  }
  const density = usableDensity(units);
  if (density !== null) {
    for (const key of genericKitchenUnits) {
      const generic = genericKitchenUnitTable[key];
      const unitGrams = generic.ml * density;
      const count = nearest(generic.counts, grams / unitGrams);
      const shown = count * unitGrams;
      if (withinKitchenTolerance(grams, shown)) {
        return {
          text: unitText(count, generic.one, generic.many),
          count,
          unit: { kind: "generic", unit: key },
          grams: shown,
        };
      }
    }
  }
  return inGrams(grams);
};

/** The text alone: « 2 œufs ». Null for a weight that is not a positive number. */
export const kitchenQuantityText = (
  grams: number,
  units: FoodKitchenUnits | null,
): string | null => toKitchenQuantity(grams, units)?.text ?? null;

/**
 * The way back: the weight of a count of a unit. Null when the food does not
 * have the unit, or has no density for a generic unit. No weight is invented.
 */
export const kitchenQuantityToGrams = (
  count: number,
  unit: KitchenUnitRef,
  units: FoodKitchenUnits | null,
): number | null => {
  if (!usableWeight(count)) {
    return null;
  }
  if (unit.kind === "gram") {
    return count;
  }
  if (unit.kind === "generic") {
    const density = usableDensity(units);
    return density === null
      ? null
      : count * genericKitchenUnitTable[unit.unit].ml * density;
  }
  const own = units?.units.find((entry) => entry.one === unit.one);
  return own && usableWeight(own.grams) ? count * own.grams : null;
};

/* ───────────────────────── what a person or REMI enters ───────────────────────── */

export const FOOD_UNITS_MAX = 6;
const UNIT_NAME_MAX_LENGTH = 40;

/** Water is 1. Oil is near 0,92, flour near 0,55, honey near 1,4. */
export const DENSITY_MIN = 0.05;
export const DENSITY_MAX = 3;

/** One unit weighs between a tenth of a gram and five kilograms. */
export const UNIT_GRAMS_MIN = 0.1;
export const UNIT_GRAMS_MAX = 5000;

const unitName = z.string().trim().min(1).max(UNIT_NAME_MAX_LENGTH);

/** The units of a food, as a person confirms them or as REMI proposes them. */
export const foodKitchenUnitsSchema = z.object({
  densityGPerMl: z.number().min(DENSITY_MIN).max(DENSITY_MAX).nullable(),
  units: z
    .array(
      z.object({
        one: unitName,
        many: unitName,
        grams: z.number().min(UNIT_GRAMS_MIN).max(UNIT_GRAMS_MAX),
      }),
    )
    .max(FOOD_UNITS_MAX)
    .refine(
      (units) =>
        new Set(units.map((unit) => unit.one.toLowerCase())).size ===
        units.length,
      { message: "a unit name is in two lines" },
    ),
});
