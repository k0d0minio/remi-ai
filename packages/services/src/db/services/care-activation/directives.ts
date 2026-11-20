import type { ActivationEviction } from "../../../shared/care-activation";
import type { Id } from "../../../types";

/** What the activation reads from the practitioner's directives. */
export type ActivationDirectives = {
  /** Each « Éviction totale », with its period or its durable status. */
  evictions: ActivationEviction[];
  /** The elements of the directives that REMI did not recognise. */
  unrecognised: string[];
};

/**
 * The one read of the directives for the activation (story 19).
 *
 * TO WIRE AFTER THE MERGE OF BURST 2. The table of evictions comes from
 * another ticket of the same burst, so this ticket cannot read it. Today the
 * function returns two empty lists. Thus no eviction blocks an activation,
 * and the recap lists no eviction and no element that is not recognised.
 *
 * When the table is on the branch, read the rows in force of `patientId`
 * here and map each row to an `ActivationEviction`:
 * - `label`: what is evicted, as the practitioner wrote it,
 * - `periodStart` and `periodEnd`: the ISO dates, or null,
 * - `durable`: true for the durable status.
 * Put the elements that are not recognised in `unrecognised`.
 * No other file changes: the recap, the blockers, the service and the card
 * read only this function.
 */
export const listActivationDirectives = async (
  _patientId: Id,
): Promise<ActivationDirectives> => ({ evictions: [], unrecognised: [] });
