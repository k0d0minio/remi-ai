/**
 * The design system's intent vocabulary, as a value.
 *
 * `Badge`, `Card` and everything added after them take an intent rather than a
 * colour — that rule is in `CONVENTIONS.md`. The variant unions themselves are
 * inferred from each component's `cva` config, which is right for the props but
 * useless to a consumer that wants to *hold* an intent: a status map in an app
 * needs the vocabulary as a named type, and copying the five strings into each
 * app is exactly the second design system the rule exists to prevent.
 *
 * `outline` is deliberately absent. It is a badge treatment, not an intent.
 */

export const intents = [
  "success",
  "warning",
  "error",
  "info",
  "neutral",
] as const;

export type Intent = (typeof intents)[number];
