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
