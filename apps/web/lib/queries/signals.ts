import type { Id, ProgressSignal } from "@remi/services/shared";
import { people } from "@/lib/fixtures/people";
import { signals } from "@/lib/fixtures/signals";

const newestFirst = (a: ProgressSignal, b: ProgressSignal) =>
  b.observedAt.getTime() - a.observedAt.getTime();

/** What the practitioner has seen happen to one person. See the note in `./clients.ts`. */
export const listSignalsForPerson = async (
  personId: Id,
): Promise<ProgressSignal[]> =>
  signals.filter((signal) => signal.personId === personId).sort(newestFirst);

/**
 * The whole practice's feed, with everything that asks for attention first and
 * the rest newest-first behind it.
 *
 * The ordering is the product rule, so it lives at the seam rather than in the
 * screen: a feed sorted purely by time buries the person who has stopped under
 * three days of good news, which is the failure the practitioner surface exists
 * to prevent.
 */
export const listSignals = async (
  practitionerId: Id,
): Promise<ProgressSignal[]> => {
  const theirPeople = new Set(
    people
      .filter((person) => person.practitionerId === practitionerId)
      .map((person) => person.id),
  );
  const rank = (signal: ProgressSignal) =>
    signal.severity === "attention" ? 0 : 1;

  return signals
    .filter((signal) => theirPeople.has(signal.personId))
    .sort((a, b) => rank(a) - rank(b) || newestFirst(a, b));
};
