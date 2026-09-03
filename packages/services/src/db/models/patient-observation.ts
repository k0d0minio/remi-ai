import type { Entity, Id } from "../../types";
import type { MealEntry } from "./meal-entry";

/**
 * Something Morgane noticed about a patient that belongs to no single meal —
 * the other half of § 5 step 4's « mémorisation utile ».
 *
 * A week's review produces both kinds. Attaching "elle prend toujours des
 * yaourts sucrés le matin" to whichever entry happened to be on screen would
 * record it as coming from a meal it did not come from, so it gets a row of its
 * own and the learnings view merges the two.
 */
export type PatientObservation = Entity & {
  patientId: Id;
  body: string;
  /** The day she noticed it — `YYYY-MM-DD`, backdatable like a meal. */
  observedOn: string;
  archivedAt: Date | null;
};

/**
 * One line in the per-patient learnings view, from either source.
 *
 * A discriminated union rather than a flattened row, because the difference is
 * the whole content of the view: a learning noticed on a meal carries that meal
 * with it, and a standalone observation carries nothing — which is what tells
 * Morgane where each one came from.
 */
export type PatientLearning =
  | { kind: "meal"; id: Id; body: string; on: string; entry: MealEntry }
  | {
      kind: "observation";
      id: Id;
      body: string;
      on: string;
      observation: PatientObservation;
    };
