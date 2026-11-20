/**
 * The food directives of a patient file — REM-54, story 13, D-30.
 *
 * The practitioner writes three fields: « À favoriser », « À limiter » and
 * « Éviction totale ». Each field splits on « ; » into one term for each
 * directive. A term is stored as typed. REMI has no term base yet, so no term
 * is recognised: the console shows each term with the mark « non reconnu ».
 *
 * A total eviction is safety data (story 14). It has an end date or the
 * durable status, never the two and never none. A term that REMI does not
 * recognise is not absent: `evictionsOfDirectives` gives it to the
 * compatibility gate as typed, and the gate decides.
 *
 * Isomorphic and pure: no I/O and no clock. The console runs the checks before
 * the save, and the service runs them again.
 */

import type { TotalEviction } from "../ai/compatibility";

export const foodDirectiveKinds = ["favour", "limit", "exclude"] as const;

export type FoodDirectiveKind = (typeof foodDirectiveKinds)[number];

/**
 * The levels of « À limiter ». Morgane named no level (food-directives,
 * question 2). These two are the default of the breakdown. A directive with no
 * level has `null`: REMI does not choose one.
 */
export const foodLimitLevels = ["reduce", "rare"] as const;

export type FoodLimitLevel = (typeof foodLimitLevels)[number];

/** The longest term that a save accepts. */
export const FOOD_DIRECTIVE_TERM_MAX = 200;

/** One directive as the practitioner submits it, and as a snapshot holds it. */
export type FoodDirectiveDraft = {
  kind: FoodDirectiveKind;
  /** The term as typed, with the outer spaces removed. */
  term: string;
  /** For `limit` only. Null when the practitioner chose no level. */
  limitLevel: FoodLimitLevel | null;
  /** For `exclude` only. `YYYY-MM-DD`, or null: applies from the save. */
  startsOn: string | null;
  /** For `exclude` only. `YYYY-MM-DD`, or null for a durable eviction. */
  endsOn: string | null;
  /** For `exclude` only. The durable medical exclusion. */
  durable: boolean;
};

const singular = (word: string) => {
  if (word.length <= 3) {
    return word;
  }
  if (word.endsWith("eaux") || word.endsWith("oux")) {
    return word.slice(0, -1);
  }
  if (word.endsWith("s") && !word.endsWith("ss")) {
    return word.slice(0, -1);
  }
  return word;
};

/**
 * The key that compares two terms: lower case, no accent, no ligature, no
 * punctuation, singular words. « Brocolis » and « brocoli » have the same key.
 * The key is for comparison only. It is never stored and never shown.
 *
 * The gate (`ai/compatibility.ts`) folds text by the same rules in a function
 * that it does not export. When the term base arrives, the two become one.
 */
export const foodDirectiveTermKey = (term: string): string =>
  term
    .toLowerCase()
    .replace(/œ/g, "oe")
    .replace(/æ/g, "ae")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .split(" ")
    .filter((word) => word !== "")
    .map(singular)
    .join(" ");

/**
 * Splits one field on « ; » into its terms. Each term loses its outer spaces
 * and its inner runs of spaces. An empty part gives no term. A term that is in
 * the field two times is kept one time, as it was typed first.
 *
 * A term with no letter and no digit has an empty key. It is kept: the save
 * refuses it by name, and it is not lost without a message.
 */
export const splitFoodDirectiveTerms = (text: string): string[] => {
  const seen = new Set<string>();
  const terms: string[] = [];
  for (const part of text.split(";")) {
    const term = part.replace(/\s+/g, " ").trim();
    if (term === "") {
      continue;
    }
    const key = foodDirectiveTermKey(term);
    if (key !== "" && seen.has(key)) {
      continue;
    }
    seen.add(key);
    terms.push(term);
  }
  return terms;
};

/** The text of one field from its terms: the reverse of the split. */
export const joinFoodDirectiveTerms = (terms: readonly string[]): string =>
  terms.join(" ; ");

export type FoodDirectiveFaultCode =
  /** The term has no letter and no digit. */
  | "unreadable_term"
  /** The term is longer than `FOOD_DIRECTIVE_TERM_MAX`. */
  | "term_too_long"
  /** The term is two times in the same field. */
  | "duplicate_term"
  /** The term is in « À favoriser » and in « Éviction totale ». */
  | "favour_and_exclude"
  /** The eviction has no end date and is not durable. */
  | "eviction_without_period"
  /** The eviction is durable and has an end date. */
  | "durable_with_end"
  /** A date is not a real day in `YYYY-MM-DD`. */
  | "invalid_date"
  /** The end date is before the start date. */
  | "end_before_start"
  /** A directive that is not an eviction has a date or the durable status. */
  | "period_on_other_kind"
  /** A directive that is not « À limiter » has a limit level. */
  | "level_on_other_kind";

export type FoodDirectiveFault = {
  code: FoodDirectiveFaultCode;
  /** The term as typed, so that the message can name it. */
  term: string;
};

const ISO_DAY = /^(\d{4})-(\d{2})-(\d{2})$/;

/** True for a real calendar day in `YYYY-MM-DD`. « 2026-02-30 » is not one. */
export const isIsoDay = (value: string): boolean => {
  const match = ISO_DAY.exec(value);
  if (!match) {
    return false;
  }
  const [year, month, day] = [
    Number(match[1]),
    Number(match[2]),
    Number(match[3]),
  ];
  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
};

/**
 * The faults of one set of directives: the whole section as the practitioner
 * submits it. An empty list means that the save can proceed. A fault refuses
 * the whole save (story 13 criteria 7 and 8, story 14 criterion 1).
 */
export const foodDirectiveFaults = (
  drafts: readonly FoodDirectiveDraft[],
): FoodDirectiveFault[] => {
  const faults: FoodDirectiveFault[] = [];
  const fault = (code: FoodDirectiveFaultCode, term: string) => {
    faults.push({ code, term });
  };
  const keysOf = (kind: FoodDirectiveKind) =>
    new Set(
      drafts
        .filter((draft) => draft.kind === kind)
        .map((draft) => foodDirectiveTermKey(draft.term)),
    );
  const excluded = keysOf("exclude");
  const seen = new Set<string>();

  for (const draft of drafts) {
    const key = foodDirectiveTermKey(draft.term);
    if (key === "") {
      fault("unreadable_term", draft.term);
      continue;
    }
    if (draft.term.length > FOOD_DIRECTIVE_TERM_MAX) {
      fault("term_too_long", draft.term);
    }
    const slot = `${draft.kind}:${key}`;
    if (seen.has(slot)) {
      fault("duplicate_term", draft.term);
    }
    seen.add(slot);

    if (draft.kind === "favour" && excluded.has(key)) {
      fault("favour_and_exclude", draft.term);
    }
    if (draft.kind !== "limit" && draft.limitLevel !== null) {
      fault("level_on_other_kind", draft.term);
    }
    if (draft.kind !== "exclude") {
      if (draft.startsOn !== null || draft.endsOn !== null || draft.durable) {
        fault("period_on_other_kind", draft.term);
      }
      continue;
    }

    const datesValid =
      (draft.startsOn === null || isIsoDay(draft.startsOn)) &&
      (draft.endsOn === null || isIsoDay(draft.endsOn));
    if (!datesValid) {
      fault("invalid_date", draft.term);
      continue;
    }
    if (draft.durable && draft.endsOn !== null) {
      fault("durable_with_end", draft.term);
    }
    if (!draft.durable && draft.endsOn === null) {
      fault("eviction_without_period", draft.term);
    }
    if (
      draft.startsOn !== null &&
      draft.endsOn !== null &&
      draft.endsOn < draft.startsOn
    ) {
      fault("end_before_start", draft.term);
    }
  }
  return faults;
};

/**
 * The total evictions of a set of directives, as the compatibility gate reads
 * them (`checkCompatibility`, field `evictions`). Give it only directives in
 * force: the active rows of the file, or the directives of a validated
 * snapshot.
 *
 * Each `exclude` directive gives one eviction, with its term as typed. No
 * directive is dropped: not a term that REMI does not recognise, and not an
 * eviction past its end date. The gate does not lift an eviction. The
 * practitioner ends one, and then it is not in force.
 *
 * An eviction with no end date reads as durable in the gate. That is also the
 * result for a row that is not durable and has no end date. The save refuses
 * such a row, and if one exists, the strict reading applies.
 */
export const evictionsOfDirectives = (
  directives: readonly Pick<
    FoodDirectiveDraft,
    "kind" | "term" | "startsOn" | "endsOn" | "durable"
  >[],
): TotalEviction[] =>
  directives
    .filter((directive) => directive.kind === "exclude")
    .map((directive) => ({
      term: directive.term,
      startsOn: directive.startsOn,
      endsOn: directive.durable ? null : directive.endsOn,
    }));
