/**
 * What a patient types in a date field or a number field (REM-159, REM-160).
 * A date is typed as « JJ/MM/AAAA » with the numeric keyboard of a phone, and
 * stored as `YYYY-MM-DD`. No native date picker: a picker proposes today, and
 * the patient must step through the months to reach a birth year.
 *
 * Isomorphic and import-free: the field masks the text in the browser, and the
 * server action checks the day again.
 */

const isoDay = /^(\d{4})-(\d{2})-(\d{2})$/;

/** The oldest year a date of the patient's file can name. */
const MIN_YEAR = 1900;

/** A real calendar day as `YYYY-MM-DD`, from 1900. `2026-02-31` is refused. */
export const isCalendarDay = (value: string): boolean => {
  const match = isoDay.exec(value);
  if (!match || Number(match[1]) < MIN_YEAR) {
    return false;
  }
  const day = new Date(`${value}T00:00:00Z`);
  // An impossible day parses to a neighbouring one: the round trip refuses it.
  return (
    !Number.isNaN(day.getTime()) && day.toISOString().slice(0, 10) === value
  );
};

/** The age from which a person can use REMI (REM-159): no minors. */
export const ADULT_AGE = 18;

/**
 * True when a person born on `birthDate` is 18 or older on `today`. Both are
 * `YYYY-MM-DD`. A person born on 29 February is 18 on 1 March of a common year.
 */
export const isAdultOn = (birthDate: string, today: string): boolean => {
  const year = Number(today.slice(0, 4)) - ADULT_AGE;
  return birthDate <= `${String(year).padStart(4, "0")}${today.slice(4)}`;
};

/** True when `day` is `today` or a later day. Both are `YYYY-MM-DD`. */
export const isTodayOrLater = (day: string, today: string): boolean =>
  day >= today;

/** `1990-05-12` as « 12/05/1990 ». Empty for no date, or for a text that is not a day. */
export const dateEntryFromIso = (value: string | null | undefined): string => {
  const match = value ? isoDay.exec(value) : null;
  return match ? `${match[3]}/${match[2]}/${match[1]}` : "";
};

/**
 * The text of a date field after each keystroke: digits only, with the two
 * slashes put in as the patient types. A day or a month typed as one digit
 * and a separator gets its zero (« 1/ » reads « 01 »). A browser that fills
 * the field with `YYYY-MM-DD` gets the same day in the field's format.
 */
export const maskDateEntry = (raw: string): string => {
  const trimmed = raw.trim();
  if (isoDay.test(trimmed)) {
    return dateEntryFromIso(trimmed);
  }
  const segments = trimmed.split(/\D+/);
  const digits = segments
    .map((segment, index) =>
      index < 2 && index < segments.length - 1 && segment.length === 1
        ? `0${segment}`
        : segment,
    )
    .join("")
    .slice(0, 8);
  const day = digits.slice(0, 2);
  const month = digits.slice(2, 4);
  const year = digits.slice(4);
  return [day, month, year].filter((part) => part !== "").join("/");
};

/**
 * How a typed date reads. `incomplete` is a date still being typed: the field
 * shows no error for it before the patient leaves the field.
 */
export type DateEntry =
  | { state: "empty" }
  | { state: "incomplete" }
  | { state: "invalid" }
  | { state: "valid"; iso: string };

const typedDay = /^(\d{1,2})[/.\- ](\d{1,2})[/.\- ](\d{4})$/;

const eightDigits = /^(\d{2})(\d{2})(\d{4})$/;

/** Reads « JJ/MM/AAAA » (or eight digits, or `YYYY-MM-DD`) as a calendar day. */
export const parseDateEntry = (text: string): DateEntry => {
  const trimmed = text.trim();
  if (trimmed === "") {
    return { state: "empty" };
  }
  if (isoDay.test(trimmed)) {
    return isCalendarDay(trimmed)
      ? { state: "valid", iso: trimmed }
      : { state: "invalid" };
  }
  const match = typedDay.exec(trimmed) ?? eightDigits.exec(trimmed);
  if (!match) {
    return /^[\d/.\- ]{1,9}$/.test(trimmed)
      ? { state: "incomplete" }
      : { state: "invalid" };
  }
  const iso = `${match[3]}-${match[2].padStart(2, "0")}-${match[1].padStart(2, "0")}`;
  return isCalendarDay(iso) ? { state: "valid", iso } : { state: "invalid" };
};

/**
 * The text of a number field after each keystroke. `integer` keeps three
 * digits (a height in cm). `decimal` keeps three digits, then one comma or
 * point and one digit (a weight in kg). Every other character is dropped, so
 * the field holds a number on a keyboard that also has letters.
 */
export const maskNumberEntry = (
  raw: string,
  kind: "integer" | "decimal",
): string => {
  if (kind === "integer") {
    return raw.replace(/\D/g, "").slice(0, 3);
  }
  const kept = raw.replace(/[^\d.,]/g, "");
  const at = kept.search(/[.,]/);
  if (at === -1) {
    return kept.slice(0, 3);
  }
  const whole = kept.slice(0, at).slice(0, 3);
  const decimal = kept
    .slice(at + 1)
    .replace(/\D/g, "")
    .slice(0, 1);
  return `${whole}${kept[at]}${decimal}`;
};
