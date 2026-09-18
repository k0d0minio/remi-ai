import type { Entity } from "../../types";

/**
 * A food from CIQUAL — ANSES's food-composition table, edition 2025.
 *
 * Reference data, not patient data. The identity that matters is CIQUAL's own
 * `code` (`alim_code`), because that is what the import upserts on and what a
 * later edition is diffed against; the uuid is the storage seam's requirement,
 * not the domain's.
 */
export type Food = Entity & {
  /** CIQUAL's `alim_code`. */
  code: string;
  nameFr: string;
  nameEn: string;
  /** `nameFr`, lowercased and stripped of accents — what search matches on. */
  searchName: string;
  groupCode: string;
  groupNameFr: string;
  subGroupCode: string;
  subGroupNameFr: string;
};

/**
 * Why a value is what it is.
 *
 * CIQUAL publishes four kinds of cell and they mean different things: a
 * measurement, a quantity too small to quantify, an upper bound, and no
 * determination at all. Ranking that treats the last three as numbers produces
 * a confident wrong answer, which is the failure mode this type exists to
 * prevent.
 */
export type NutrientMarker =
  "exact" | "traces" | "less_than" | "not_determined";

/** CIQUAL's confidence in the value: A is the best, D the weakest. */
export type ConfidenceCode = "A" | "B" | "C" | "D";

/** One food's content of one component, per 100 g. */
export type FoodNutrient = Entity & {
  /** CIQUAL's `alim_code`, matching `Food["code"]`. */
  foodCode: string;
  /** CIQUAL's `const_code`. */
  componentCode: string;
  componentNameFr: string;
  unit: string;
  /** Null exactly when `marker` is `not_determined`. */
  value: number | null;
  marker: NutrientMarker;
  /** The publisher's own string — `20,9`, `traces`, `< 0,01`, `-`. */
  rawValue: string;
  confidence: ConfidenceCode | "";
};

/** What one run of the import script left behind. */
export type CiqualImport = Entity & {
  edition: string;
  foodCount: number;
  nutrientCount: number;
  /** `<file>:<sha256>` per source file, newline-separated. */
  sourceChecksums: string;
};
