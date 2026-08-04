import type { Entity, Id } from "../../types";

/** One précepte: a rule of the practitioner's own practice. */
export type FramePrinciple = {
  id: Id;
  title: string;
  detail: string;
  /**
   * Whether REMI generates under this précepte today. A principle switched off
   * is not the same as one never written: the practitioner has considered it and
   * ruled it out for now, and the frame screen has to be able to show both.
   */
  active: boolean;
};

/**
 * The practitioner's therapeutic frame — the préceptes REMI generates inside.
 *
 * This is what makes REMI a copilot for *this* practice rather than a generic
 * diet app: the practitioner sets the frame, and nothing REMI suggests may fall
 * outside it. `excluded` is a hard boundary, not a preference.
 */
export type TherapeuticFrame = Entity & {
  practitionerId: Id;
  name: string;
  summary: string;
  principles: readonly FramePrinciple[];
  /** Never suggest these — ingredients, food groups, approaches. */
  excluded: readonly string[];
  /** Favour these where a choice exists. */
  emphasised: readonly string[];
};
