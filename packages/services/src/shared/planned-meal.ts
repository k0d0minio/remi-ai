/**
 * The meal that a patient types on the home page (stories 28 and 31): the
 * dish and, when the patient knows them, the ingredients. Text only (D-12).
 */

/** The longest text the field accepts. */
export const PLANNED_MEAL_MAX_LENGTH = 500;

/** How many meals one patient can record for one day. */
export const PLANNED_MEALS_PER_DAY = 20;

export type PlannedMealTextError = "empty" | "too_long";

export type PlannedMealText =
  { ok: true; text: string } | { ok: false; error: PlannedMealTextError };

/**
 * The text as it is stored, or why it is refused. A browser sends a line break
 * of a textarea as two characters and counts it as one against `maxLength`, so
 * the line breaks are made one character before the count.
 */
export const checkPlannedMealText = (value: unknown): PlannedMealText => {
  if (typeof value !== "string") {
    return { ok: false, error: "empty" };
  }
  const text = value.replace(/\r\n?/g, "\n").trim();
  if (text === "") {
    return { ok: false, error: "empty" };
  }
  if (text.length > PLANNED_MEAL_MAX_LENGTH) {
    return { ok: false, error: "too_long" };
  }
  return { ok: true, text };
};
