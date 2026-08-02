import type { Entity, Id } from "../../types";
import type { Locale } from "../../shared/i18n";

/**
 * The health practitioner: the one who decides. Every plan REMI produces is
 * traceable to a practitioner and constrained by their therapeutic frame —
 * REMI applies recommendations, it never makes them.
 */
export type Practitioner = Entity & {
  name: string;
  email: string;
  /** Free text — "functional medicine", "nutritherapy", "naturopathy". */
  discipline: string;
  clinic: string | null;
  locale: Locale;
  /** Null until they have set one up; REMI cannot generate without it. */
  frameId: Id | null;
};
