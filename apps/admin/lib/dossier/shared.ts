/**
 * The dossier's shared vocabulary.
 *
 * Five pages carry one badge vocabulary and one authorship line, so both live
 * here rather than being restated per page. A badge's intent travels with the
 * data instead of being derived from its French label — a status vocabulary a
 * component has to parse is a vocabulary that drifts.
 *
 * Written in French per the working-languages rule in `CONVENTIONS.md`: the
 * whole shelf is a review document for Morgane and Arnaud. Belgian register and
 * French typography throughout — a space before `%` and `€`, a space as the
 * thousands separator, a comma for the decimal, guillemets for quotes.
 */

export const author = "Jamie Nisbet";

/** The date the dossier was prepared. */
export const preparedOn = "19 août 2026";

export const preparedFor = "Pour Morgane et Arnaud";

/** The shared intent vocabulary — `CONVENTIONS.md` → the design system. */
export type Intent = "neutral" | "info" | "warning" | "error" | "success";

export type Tag = {
  label: string;
  intent: Intent;
};

/** A point in a list: a heading, a paragraph, and optionally a status. */
export type Item = {
  title: string;
  body: string;
  tag?: Tag;
};

export type FactRow = {
  /** Matched positionally to the table's columns. */
  cells: readonly string[];
  /** Rendered in the trailing status column, when the table declares one. */
  tag?: Tag;
};

export type PageHeader = {
  eyebrow: string;
  title: string;
  lead: string;
};

export type Option = {
  label: string;
  detail: string;
  /** Flags the option Jamie would pick, rendered as a small badge. */
  recommended?: true;
};

export type Decision = {
  title: string;
  context: string;
  /** What turns on the answer. Stated because a decision without a stated cost
   * gets postponed indefinitely. */
  consequence: string;
  /** Absent where no option is preferable to another — those say so instead. */
  options?: readonly Option[];
};
