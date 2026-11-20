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
import { recommendationCategories } from "./patient";

/** Raise it when the shape changes, and keep a reader of each older shape. */
export const PROTOCOL_SNAPSHOT_SCHEMA_VERSION = 1;

const position = z.number().int().nonnegative();

const snapshotRecommendation = z.object({
  /** The id of the live row at the validation. The row can be gone since. */
  id: z.uuid(),
  category: z.enum(recommendationCategories),
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
});

export type ProtocolSnapshot = z.infer<typeof protocolSnapshotSchema>;

/** True when the snapshot holds no content at all. */
export const isEmptyProtocolSnapshot = (snapshot: ProtocolSnapshot) =>
  snapshot.recommendations.length === 0 &&
  snapshot.goals.length === 0 &&
  snapshot.supplements.length === 0 &&
  snapshot.instruction === null &&
  snapshot.calculations.length === 0;
