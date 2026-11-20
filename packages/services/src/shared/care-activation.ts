/**
 * The recap of an activation and its blockers — story 19.
 *
 * Before « Activer l'accompagnement » the practitioner reads a recap: the
 * validated values, each eviction with its period, and the elements that
 * REMI did not recognise. `activationRecap` builds it and names what blocks
 * the activation. The console shows it, and the service runs it again on the
 * server before it activates.
 *
 * The three blockers of this version:
 * - the file has no validated version,
 * - a mandatory safety answer is missing (allergies or intolerances),
 * - an eviction has no period and no durable status.
 *
 * An element that is not recognised never blocks. The recap lists it, and it
 * stays not applied (D-30: unknown composition is never shown as safe).
 *
 * Isomorphic: no I/O and no clock.
 */

import type { CalculationKind } from "./calculations";
import type { ProtocolSnapshot } from "./protocol-snapshot";
import type { SafetyList } from "./safety-highlights";

/** The validated version that the activation will apply. */
export type ActivationVersion = {
  versionNumber: number;
  validatedAt: Date;
  snapshot: ProtocolSnapshot;
};

/**
 * One « Éviction totale » as the recap reads it. The dates are ISO dates
 * (`2026-12-01`). `durable` is the durable status: the eviction has no end.
 */
export type ActivationEviction = {
  /** What is evicted, as the practitioner wrote it. */
  label: string;
  periodStart: string | null;
  periodEnd: string | null;
  durable: boolean;
};

export type ActivationInput = {
  /** Null when the practitioner has validated nothing yet. */
  validated: ActivationVersion | null;
  /** The state of each mandatory safety answer, from `safetyList`. */
  safety: {
    allergies: SafetyList["state"];
    intolerances: SafetyList["state"];
  };
  evictions: readonly ActivationEviction[];
  /** The elements of the directives that REMI did not recognise. */
  unrecognised: readonly string[];
};

export type ActivationBlocker =
  | { kind: "no_validated_version" }
  | { kind: "safety_answer_missing"; field: "allergies" | "intolerances" }
  | { kind: "eviction_without_period"; label: string };

/** The validated values, one entry for each topic of the protocol. */
export type ActivationValues = {
  versionNumber: number;
  validatedAt: Date;
  /** The titles, in the practitioner's order of priority. */
  goals: string[];
  recommendations: number;
  /** The names, in the practitioner's order. */
  supplements: string[];
  /** An instruction is in force. */
  instruction: boolean;
  calculations: { kind: CalculationKind; value: number }[];
};

export type ActivationRecap = {
  /** Null when the file has no validated version. */
  values: ActivationValues | null;
  /** Each eviction. `resolved` is false when it blocks. */
  evictions: (ActivationEviction & { resolved: boolean })[];
  /** Listed, never applied, never a blocker. */
  unrecognised: string[];
  blockers: ActivationBlocker[];
};

const hasText = (value: string | null) =>
  value !== null && value.trim() !== "";

/** An eviction is resolved by a period or by the durable status. */
export const isResolvedEviction = (eviction: ActivationEviction) =>
  eviction.durable ||
  hasText(eviction.periodStart) ||
  hasText(eviction.periodEnd);

const valuesOf = (validated: ActivationVersion): ActivationValues => ({
  versionNumber: validated.versionNumber,
  validatedAt: validated.validatedAt,
  goals: validated.snapshot.goals.map((goal) => goal.title),
  recommendations: validated.snapshot.recommendations.length,
  supplements: validated.snapshot.supplements.map(
    (supplement) => supplement.name,
  ),
  instruction: validated.snapshot.instruction !== null,
  calculations: validated.snapshot.calculations.map((calculation) => ({
    kind: calculation.kind,
    value: calculation.value,
  })),
});

/**
 * The recap and the blockers, from the facts alone. The blockers come in a
 * fixed order: the version, the safety answers, then the evictions in the
 * order of the input.
 */
export const activationRecap = (input: ActivationInput): ActivationRecap => {
  const evictions = input.evictions.map((eviction) => ({
    ...eviction,
    resolved: isResolvedEviction(eviction),
  }));
  const unrecognised = [
    ...new Set(
      input.unrecognised
        .map((element) => element.trim())
        .filter((element) => element !== ""),
    ),
  ];
  const blockers: ActivationBlocker[] = [];
  if (input.validated === null) {
    blockers.push({ kind: "no_validated_version" });
  }
  if (input.safety.allergies === "not_entered") {
    blockers.push({ kind: "safety_answer_missing", field: "allergies" });
  }
  if (input.safety.intolerances === "not_entered") {
    blockers.push({ kind: "safety_answer_missing", field: "intolerances" });
  }
  for (const eviction of evictions) {
    if (!eviction.resolved) {
      blockers.push({ kind: "eviction_without_period", label: eviction.label });
    }
  }
  return {
    values: input.validated === null ? null : valuesOf(input.validated),
    evictions,
    unrecognised,
    blockers,
  };
};

/** True when nothing blocks the activation. */
export const canActivate = (recap: ActivationRecap) =>
  recap.blockers.length === 0;

/** Stored in English. The console's journal has the French of it. */
export const careActivationReason = "the practitioner activated the care";
