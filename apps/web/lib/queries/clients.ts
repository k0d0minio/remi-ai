import {
  err,
  ok,
  type Id,
  type Person,
  type Result,
} from "@remi/services/shared";
import { people } from "@/lib/fixtures/people";

/**
 * Reads for the practitioner surface.
 *
 * Every function here is already `async` and already returns the domain shape,
 * so registering a `DatabaseClient` means replacing the body of each one with a
 * `getDatabase().collection<Person>("people")` call — the callers do not move.
 */
export const listClients = async (practitionerId: Id): Promise<Person[]> =>
  people.filter((person) => person.practitionerId === practitionerId);

/**
 * Returns a `Result` rather than `null`: "no such client" and "not your client"
 * are different answers and the UI has to render them differently.
 */
export const getClient = async (
  practitionerId: Id,
  personId: Id,
): Promise<Result<Person>> => {
  const person = people.find((candidate) => candidate.id === personId);

  if (!person) {
    return err("not_found", `No client with id ${personId}.`);
  }
  if (person.practitionerId !== practitionerId) {
    return err("not_permitted", "That client belongs to another practitioner.");
  }
  return ok(person);
};
