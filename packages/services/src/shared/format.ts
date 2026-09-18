/**
 * Formatting helpers with exactly one home.
 *
 * Before adding a helper here, grep — a second copy of a formatter is how two
 * screens end up disagreeing about what a date looks like. See CONVENTIONS.md →
 * "Grep before writing a helper".
 */

const DEFAULT_LOCALE = "en-GB";

export const formatCurrency = (
  amountInMinorUnits: number,
  currency = "EUR",
  locale = DEFAULT_LOCALE,
) =>
  new Intl.NumberFormat(locale, { style: "currency", currency }).format(
    amountInMinorUnits / 100,
  );

/**
 * A number with its locale's grouping — `3 484` in French, `3,484` in English.
 *
 * `fractionDigits` is fixed rather than maximum, because a column of nutrient
 * values that alternates between `0,5` and `12` reads as noise; the console
 * passes the precision the component's unit deserves.
 */
export const formatNumber = (
  value: number,
  locale = DEFAULT_LOCALE,
  fractionDigits?: number,
) =>
  new Intl.NumberFormat(
    locale,
    fractionDigits === undefined
      ? {}
      : {
          minimumFractionDigits: fractionDigits,
          maximumFractionDigits: fractionDigits,
        },
  ).format(value);

/**
 * The practice's clock. Every patient in the pilot is one of Morgane's, and she
 * practises in Belgium — so "today" is Belgian, not the server's.
 */
export const PRACTICE_TIME_ZONE = "Europe/Brussels";

/**
 * Today as `YYYY-MM-DD`, in the practice's timezone.
 *
 * `toISOString().slice(0, 10)` is the obvious version and it is wrong here: it
 * reads UTC, which is behind Brussels, so a meal entered after midnight local
 * time would be dated the day before — and the patient sees that date on their
 * own journal, with no field to correct it.
 */
export const todayAtPractice = (at: Date = new Date()) => {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: PRACTICE_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(at);
  const part = (type: "year" | "month" | "day") =>
    parts.find((candidate) => candidate.type === type)?.value ?? "";
  return `${part("year")}-${part("month")}-${part("day")}`;
};

export const formatDate = (value: Date | string, locale = DEFAULT_LOCALE) =>
  new Intl.DateTimeFormat(locale, { dateStyle: "medium" }).format(
    typeof value === "string" ? new Date(value) : value,
  );

export const formatDateTime = (value: Date | string, locale = DEFAULT_LOCALE) =>
  new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(typeof value === "string" ? new Date(value) : value);

/** Initials for an avatar fallback — one implementation, used by every app. */
export const initials = (name: string) =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");

/**
 * Whole years since a `YYYY-MM-DD` birth date, or null when there is no date
 * or the string is not one. Derived at every read site rather than stored: an
 * age written to a column is wrong from the next birthday onwards.
 */
export const ageInYears = (birthDate: string | null): number | null => {
  if (!birthDate) {
    return null;
  }
  const born = new Date(`${birthDate}T00:00:00Z`);
  if (Number.isNaN(born.getTime())) {
    return null;
  }
  const now = new Date();
  let age = now.getUTCFullYear() - born.getUTCFullYear();
  const monthDelta = now.getUTCMonth() - born.getUTCMonth();
  if (
    monthDelta < 0 ||
    (monthDelta === 0 && now.getUTCDate() < born.getUTCDate())
  ) {
    age -= 1;
  }
  return age >= 0 && age < 130 ? age : null;
};
