/**
 * The snapshot of a validated protocol — story 20, D-30.
 *
 * A row of `protocol_versions` holds one snapshot: the protocol as the
 * practitioner validated it. The schema checks it on write and on read. The
 * snapshot holds copies, not references: a row that is archived or deleted
 * later stays in the version it was validated in.
 *
 * The snapshot holds only content in force at the validation: no archived
 * row, and no calculation without a validated value. Dates are ISO strings,
 * because the column is `jsonb`.
 *
 * Isomorphic: no I/O, so the patient's pages and the console import it as is.
 */

import { z } from "zod";
import { calculationKinds } from "./calculations";
import {
  FOOD_DIRECTIVE_TERM_MAX,
  foodDirectiveKinds,
  foodLimitLevels,
} from "./food-directives";
import {
  isMealConfigurationEmpty,
  mealFastingOptions,
  mealOrientations,
} from "./meal-configuration";
import { lifestyleAdviceKeys } from "./lifestyle-advice";
import { recommendationCategories } from "./patient";

/**
 * Raise it when the shape changes, and keep a reader of each older shape.
 * `foodDirectives` (REM-54) did not raise it: a snapshot written before the
 * directives existed has none, and it reads with an empty list.
 * `mealConfiguration` (REM-68) did not raise it: the key is optional, and a
 * snapshot from before it reads as a file with no meal configuration.
 * The lifestyle advice (REM-65) did not raise it: an advice is one more row of
 * `recommendations`, with a category that an older snapshot does not have.
 */
export const PROTOCOL_SNAPSHOT_SCHEMA_VERSION = 1;

const position = z.number().int().nonnegative();

const snapshotRecommendation = z.object({
  /** The id of the live row at the validation. The row can be gone since. */
  id: z.uuid(),
  /**
   * A recommendation category, or one of the six lifestyle keys (REM-65). A
   * snapshot from before REM-65 has no row with a lifestyle key.
   */
  category: z.enum([...recommendationCategories, ...lifestyleAdviceKeys]),
  title: z.string().min(1),
  detail: z.string(),
  position,
});

const snapshotGoal = z.object({
  id: z.uuid(),
  title: z.string().min(1),
  baseline: z.string(),
  position,
});

const snapshotSupplement = z.object({
  id: z.uuid(),
  name: z.string().min(1),
  dose: z.string(),
  timing: z.string(),
  reason: z.string(),
  position,
});

const snapshotInstruction = z.object({
  id: z.uuid(),
  /** Written to REMI. The patient never sees it. */
  body: z.string(),
  /** Written to the patient. Null when the practitioner wrote none. */
  patientBody: z.string().nullable(),
});

const snapshotCalculation = z.object({
  kind: z.enum(calculationKinds),
  /** The value that the practitioner validated. Never REMI's estimate. */
  value: z.number().finite().nonnegative(),
  parameters: z.record(z.string(), z.unknown()),
  validatedAt: z.iso.datetime(),
});

const isoDay = z.iso.date();

/**
 * One food directive in force at the validation (REM-54). The term is as the
 * practitioner typed it. An `exclude` directive is a total eviction: it has an
 * end date or the durable status.
 */
const snapshotFoodDirective = z
  .object({
    id: z.uuid(),
    kind: z.enum(foodDirectiveKinds),
    term: z.string().min(1).max(FOOD_DIRECTIVE_TERM_MAX),
    limitLevel: z.enum(foodLimitLevels).nullable(),
    startsOn: isoDay.nullable(),
    endsOn: isoDay.nullable(),
    durable: z.boolean(),
    position,
  })
  .refine(
    (row) => row.kind !== "exclude" || row.durable !== (row.endsOn !== null),
    { message: "an eviction has an end date or the durable status" },
  );

const snapshotMealSlot = z.object({
  /** Null: the practitioner had not set the switch. */
  enabled: z.boolean().nullable(),
  /** Null: no orientation was chosen. */
  orientation: z.enum(mealOrientations).nullable(),
});

/**
 * The meal configuration at the validation (REM-68, REM-70): the switch and
 * the orientation of each meal, and the fasting option. It holds what the
 * practitioner entered. A reader uses `mealSlotState` for what a meal is: a
 * meal that the fasting removes is removed, whatever its switch says.
 */
const snapshotMealConfiguration = z.object({
  meals: z.object({
    breakfast: snapshotMealSlot,
    lunch: snapshotMealSlot,
    snack: snapshotMealSlot,
    dinner: snapshotMealSlot,
  }),
  fasting: z.enum(mealFastingOptions).nullable(),
});

export const protocolSnapshotSchema = z.object({
  schemaVersion: z.literal(PROTOCOL_SNAPSHOT_SCHEMA_VERSION),
  /** In the order of the categories, then by position. */
  recommendations: z.array(snapshotRecommendation),
  /** In the practitioner's order of priority. */
  goals: z.array(snapshotGoal),
  supplements: z.array(snapshotSupplement),
  /** Null when no instruction was in force. */
  instruction: snapshotInstruction.nullable(),
  /** Only the kinds with a validated value that needs no revalidation. */
  calculations: z.array(snapshotCalculation),
  /**
   * « À favoriser », « À limiter » and « Éviction totale », in that order,
   * then by position. Absent in a snapshot from before REM-54: read as empty.
   */
  foodDirectives: z.array(snapshotFoodDirective).default([]),
  /**
   * Absent when the file had no meal configuration, and in a snapshot from
   * before REM-68. Absent is « Non renseigné »: it is not Morgane's table.
   */
  mealConfiguration: snapshotMealConfiguration.optional(),
});

export type ProtocolSnapshot = z.infer<typeof protocolSnapshotSchema>;

/** True when the snapshot holds no content at all. */
export const isEmptyProtocolSnapshot = (snapshot: ProtocolSnapshot) =>
  snapshot.recommendations.length === 0 &&
  snapshot.goals.length === 0 &&
  snapshot.supplements.length === 0 &&
  snapshot.instruction === null &&
  snapshot.calculations.length === 0 &&
  snapshot.foodDirectives.length === 0 &&
  (snapshot.mealConfiguration === undefined ||
    isMealConfigurationEmpty(snapshot.mealConfiguration));
