/**
 * The lifestyle advice of a patient file — REM-65, story 17.
 *
 * The practitioner writes advice in six categories. An advice is a row of
 * `patient_recommendations` with one of the six keys below as its category:
 * the text is in `title`, and the optional details (frequency, moment of the
 * day, duration) are in `detail`. The table of its own is the stub
 * `advice-table`, which is still open.
 *
 * The old categories `habit` and `activity` hold the same kind of content.
 * No row is rewritten: an old row is read in the category that
 * `lifestyleKeyOf` gives, and it keeps its stored category.
 *
 * Isomorphic and pure: no I/O.
 */

/** The six categories, in Morgane's order (her story 17). */
export const lifestyleAdviceKeys = [
  "physical_activity",
  "stress_management",
  "sleep",
  "hydration",
  "eating_behaviour",
  "lifestyle_other",
] as const;

export type LifestyleAdviceKey = (typeof lifestyleAdviceKeys)[number];

/** Where a row of an old recommendation category is read. */
export const legacyLifestyleCategories = {
  activity: "physical_activity",
  habit: "eating_behaviour",
} as const satisfies Record<string, LifestyleAdviceKey>;

export const isLifestyleAdviceKey = (
  category: string,
): category is LifestyleAdviceKey =>
  (lifestyleAdviceKeys as readonly string[]).includes(category);

/**
 * The category of the section for a stored category, or null when the row is
 * not a lifestyle advice.
 */
export const lifestyleKeyOf = (category: string): LifestyleAdviceKey | null => {
  if (isLifestyleAdviceKey(category)) {
    return category;
  }
  return category === "activity" || category === "habit"
    ? legacyLifestyleCategories[category]
    : null;
};

export const LIFESTYLE_ADVICE_TEXT_MAX = 2000;
export const LIFESTYLE_ADVICE_DETAILS_MAX = 2000;

/** One advice as the section shows it. */
export type LifestyleAdvice = {
  id: string;
  category: LifestyleAdviceKey;
  /** The practitioner's text, as written. */
  text: string;
  /** Frequency, moment of the day, duration: free text, or "". */
  details: string;
  position: number;
  /** Set when the advice is disabled. */
  disabledAt: Date | null;
};

/** A new advice of one save. */
export type LifestyleAdviceDraft = {
  category: LifestyleAdviceKey;
  text: string;
  details: string;
};

/** A changed advice of one save. The category of an advice does not change. */
export type LifestyleAdviceEdit = { id: string; text: string; details: string };

export type LifestyleAdviceFaultCode =
  | "text_missing"
  | "text_too_long"
  | "details_too_long";

export type LifestyleAdviceFault = {
  code: LifestyleAdviceFaultCode;
  /** `added` for a new line, `edited` for a line that exists. */
  list: "added" | "edited";
  /** The place of the line in its list, from 1. */
  line: number;
  /** The category of a new line. Null for an edited line. */
  category: LifestyleAdviceKey | null;
};

const faultCodeOf = (
  text: string,
  details: string,
): LifestyleAdviceFaultCode | null => {
  if (text.trim() === "") {
    return "text_missing";
  }
  if (text.trim().length > LIFESTYLE_ADVICE_TEXT_MAX) {
    return "text_too_long";
  }
  return details.trim().length > LIFESTYLE_ADVICE_DETAILS_MAX
    ? "details_too_long"
    : null;
};

/**
 * The faults of one save, in the order of the lines. An advice with no text
 * cannot be saved (Morgane's criterion 2). The line number of a new advice
 * counts inside its category, so the message can name the empty line.
 */
export const lifestyleAdviceFaults = (
  added: readonly LifestyleAdviceDraft[],
  edited: readonly LifestyleAdviceEdit[],
): LifestyleAdviceFault[] => {
  const seen = new Map<LifestyleAdviceKey, number>();
  const faults: LifestyleAdviceFault[] = [];
  for (const draft of added) {
    const line = (seen.get(draft.category) ?? 0) + 1;
    seen.set(draft.category, line);
    const code = faultCodeOf(draft.text, draft.details);
    if (code) {
      faults.push({ code, list: "added", line, category: draft.category });
    }
  }
  for (const [index, edit] of edited.entries()) {
    const code = faultCodeOf(edit.text, edit.details);
    if (code) {
      faults.push({ code, list: "edited", line: index + 1, category: null });
    }
  }
  return faults;
};

type Stored = {
  id: string;
  category: string;
  title: string;
  detail: string;
  position: number;
};

/**
 * The lifestyle rows of a list of stored rows, each under its category of the
 * section, in the order of the six categories and then by position. A row of
 * another category is not in the result. The sort is stable: two rows with one
 * position keep the order of the input.
 */
export const lifestyleRowsByKey = <T extends Stored>(
  rows: readonly T[],
): { category: LifestyleAdviceKey; rows: T[] }[] =>
  lifestyleAdviceKeys.map((category) => ({
    category,
    rows: rows
      .filter((row) => lifestyleKeyOf(row.category) === category)
      .sort((a, b) => a.position - b.position),
  }));
