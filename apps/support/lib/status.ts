import type { ServiceId } from "@/lib/content/types";

/**
 * The status page's data.
 *
 * It is placeholder, and the page says so in its own words rather than leaving
 * a reader to assume otherwise: REMI is pre-launch, no monitoring is connected,
 * and nothing below has been measured. It lives here anyway so the page is a
 * finished thing the day real checks exist — swapping this module for a probe's
 * output moves no markup.
 *
 * It is not in the locale dictionaries because a history is not language: two
 * copies of the same ninety days would be two chances to disagree about them.
 */

export type DayState = "up" | "degraded" | "down";

const HISTORY_DAYS = 90;

/**
 * Day offsets into the window, where 0 is the oldest day drawn and 89 is today.
 * Everything not listed is `up`, which is what keeps a service's history to the
 * few days that are actually worth writing down.
 */
type Incidents = Record<number, DayState>;

const history = (incidents: Incidents): DayState[] =>
  Array.from(
    { length: HISTORY_DAYS },
    (_, day): DayState => incidents[day] ?? "up",
  );

type ServiceHistory = {
  id: ServiceId;
  days: DayState[];
};

/** The order the page lists them in: what a visitor uses, then what we use. */
export const services: ServiceHistory[] = [
  { id: "web", days: history({ 17: "degraded", 46: "down", 47: "degraded" }) },
  { id: "marketing", days: history({ 62: "degraded" }) },
  { id: "support", days: history({}) },
  { id: "docs", days: history({ 8: "degraded", 71: "degraded" }) },
  {
    id: "admin",
    days: history({ 33: "degraded", 34: "down", 80: "degraded" }),
  },
  {
    id: "demo",
    days: history({ 25: "degraded", 26: "degraded", 55: "down" }),
  },
];

/**
 * A degraded day counts as half. A day where a page was slow and a day where it
 * was gone are not the same fact, and averaging them into one number without
 * saying so is the small dishonesty every status page is tempted by.
 */
const WEIGHTS: Record<DayState, number> = { up: 1, degraded: 0.5, down: 0 };

/** 0–1, for the caller to format in its own locale. */
export const uptimeRatio = (days: DayState[]) =>
  days.reduce((total, day) => total + WEIGHTS[day], 0) / days.length;
