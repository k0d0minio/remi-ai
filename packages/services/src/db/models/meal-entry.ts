import type { Entity, Id } from "../../types";
import type {
  mealIntents,
  mealSlots,
  writtenByKinds,
} from "../../shared/patient";

export type MealSlot = (typeof mealSlots)[number];

/** Whether the meal is still ahead or already behind — see `mealIntents`. */
export type MealIntent = (typeof mealIntents)[number];

/** Whose words a row holds — see `writtenByKinds`. */
export type WrittenBy = (typeof writtenByKinds)[number];

/**
 * One meal in a patient's journal, with Morgane's answer to it — the § 5 loop
 * that lives in WhatsApp today.
 *
 * Both halves are on one entity because the feedback is 1:1 with the meal and
 * always hers. `feedbackWrittenAt` is the state, not `feedback` itself: an
 * entry transcribed this morning and not yet answered is the normal case, and
 * it is what the console marks and what the patient link will later read.
 *
 * There is no photo here. Decision #6 keeps the journal text-only until a
 * blob-storage vendor is chosen — an owner decision that creates a files seam,
 * never one made in passing.
 */
export type MealEntry = Entity & {
  patientId: Id;
  /** The day of the meal, not of the transcription — `YYYY-MM-DD`. */
  eatenOn: string;
  /** Null is a real answer: not every meal she logs has a slot. */
  slot: MealSlot | null;
  /** What was eaten, as she transcribes it. Prose, not a structure. */
  description: string;
  /** The patient's own words, when there were any. Empty when there weren't. */
  patientComment: string;
  /** Her answer: what is good, plus one or two priorities. */
  feedback: string;
  /** Set the moment feedback exists, cleared the moment it is emptied. */
  feedbackWrittenAt: Date | null;
  /** The « mémorisation utile » noticed on this meal, if one was. */
  learning: string;
  /** Set when the entry leaves the journal without leaving the record. */
  archivedAt: Date | null;
  /** Her transcription, or the patient's own entry through their link. */
  writtenBy: WrittenBy;
  /**
   * Written before the meal or after it. A planned entry is flipped in place
   * once it has been eaten, so this is the row's current state and not a
   * record of how it started.
   */
  intent: MealIntent;
};
