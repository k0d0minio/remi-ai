import type { ActivationEviction } from "../../../shared/care-activation";
import type { Id } from "../../../types";
import { activeFoodDirectivesAfterAccessCheck } from "../patient-food-directives";

/** What the activation reads from the practitioner's directives. */
export type ActivationDirectives = {
  /** Each « Éviction totale », with its period or its durable status. */
  evictions: ActivationEviction[];
  /** The elements of the directives that REMI did not recognise. */
  unrecognised: string[];
};

/**
 * The one read of the directives for the activation (story 19). The recap,
 * the blockers, the service and the card read only this function.
 *
 * The caller has already checked the actor's access to `patientId`.
 *
 * An « Éviction totale » is an eviction of the recap, with its period or its
 * durable status. The repo has no term base yet (D-33), so REMI recognises
 * no term. An eviction still applies: the compatibility gate reads it as
 * text. A term « À favoriser » or « À limiter » is applied by nothing yet,
 * so it is listed as not recognised and not applied. It never blocks.
 */
export const listActivationDirectives = async (
  patientId: Id,
): Promise<ActivationDirectives> => {
  const directives = await activeFoodDirectivesAfterAccessCheck(patientId);
  return {
    evictions: directives
      .filter((directive) => directive.kind === "exclude")
      .map((directive) => ({
        label: directive.term,
        periodStart: directive.startsOn,
        periodEnd: directive.endsOn,
        durable: directive.durable,
      })),
    unrecognised: directives
      .filter((directive) => directive.kind !== "exclude")
      .map((directive) => directive.term),
  };
};
