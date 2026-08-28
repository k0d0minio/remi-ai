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

export const formatDate = (value: Date | string, locale = DEFAULT_LOCALE) =>
  new Intl.DateTimeFormat(locale, { dateStyle: "medium" }).format(
    typeof value === "string" ? new Date(value) : value,
  );

/**
 * The weekday on its own — what a meal in a person's week is labelled with. The
 * date itself is noise there: "Monday · dinner" is how someone reads a plan for
 * the week ahead, not "3 Aug 2026 · dinner".
 */
export const formatWeekday = (value: Date | string, locale = DEFAULT_LOCALE) =>
  new Intl.DateTimeFormat(locale, { weekday: "long" }).format(
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
