import type { mealIntents } from "./patient";

type MealIntent = (typeof mealIntents)[number];

/**
 * How the console names a meal's intent (§ 8): « prévu » before the meal,
 * « mangé » after it.
 *
 * The journal card shows the word as a badge, so a planned meal never reads
 * as a report of what happened. The answer to a planned meal is worth most
 * before the meal, so the practitioner must see which one she reads.
 *
 * Isomorphic and pure: no I/O.
 */
export const mealIntentLabels: Record<MealIntent, string> = {
  planned: "prévu",
  eaten: "mangé",
};
