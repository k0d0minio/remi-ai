/**
 * The motion tokens, mirrored from tokens.css as literals.
 *
 * They are duplicated rather than read: `motion` animates with the Web Animations
 * API and JS numbers, not CSS custom properties, so a `var()` would arrive as an
 * uninterpolatable string. Reading them back with `getComputedStyle` would work
 * but costs a forced layout on every mount, which is a poor trade for four
 * numbers that change roughly never.
 *
 * Keep in step with the `--duration-*`, `--ease-*` and `--motion-rise` blocks in
 * src/tokens.css. Seconds here, milliseconds there — `motion` takes seconds.
 */

export const duration = {
  instant: 0.08,
  fast: 0.16,
  base: 0.24,
  slow: 0.4,
  slower: 0.7,
} as const;

/** Cubic-bezier control points, matching the `--ease-*` tokens. */
export const ease = {
  standard: [0.2, 0, 0, 1],
  entrance: [0.05, 0.7, 0.1, 1],
  exit: [0.3, 0, 0.8, 0.15],
  spring: [0.34, 1.56, 0.64, 1],
} as const;

/** How far a fading-in element travels, in pixels. Mirrors `--motion-rise`. */
export const rise = 16;

/**
 * How much of an element must be visible before it animates, and the fact that
 * it only ever animates once. Re-animating on scroll-back reads as a glitch, not
 * as polish.
 */
export const viewport = { once: true, amount: 0.25 } as const;
