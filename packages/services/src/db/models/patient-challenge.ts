import type { Entity, Id } from "../../types";
import type { challengeOutcomes } from "../../shared/patient";

/** How she closed a challenge — Acquis / Non acquis / Abandonné. */
export type ChallengeOutcome = (typeof challengeOutcomes)[number];

/**
 * One habit Morgane runs with a patient — « Boire 1,5 L d'eau par jour » —
 * from the day she opens it to the day she closes it with an outcome.
 *
 * At most one is open per patient (`closedOn === null`). The two timestamps
 * are the patient's taps through the link, in order: « Challenge acquis »
 * first, and « Prêt(e) pour le prochain » only once that is set. Both freeze
 * when she closes it, so a past challenge keeps what the patient said.
 */
export type PatientChallenge = Entity & {
  patientId: Id;
  text: string;
  why: string;
  /** `YYYY-MM-DD`. */
  startedOn: string;
  /** `YYYY-MM-DD`, or null while it is the current one. */
  closedOn: string | null;
  outcome: ChallengeOutcome | null;
  acquiredAt: Date | null;
  readyForNextAt: Date | null;
};
