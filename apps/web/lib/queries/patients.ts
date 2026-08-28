import type { Id, Person } from "@remi/services/shared";
import { people } from "@/lib/fixtures/people";

/**
 * The signed-in patient's own record. Distinct from `listClients` in
 * `./clients.ts` on purpose: that one answers "who does this practitioner
 * support", this one answers "who am I", and the two will not be the same call
 * once a real `DatabaseClient` is registered behind them.
 */
export const getPatient = async (patientId: Id): Promise<Person | null> =>
  people.find((person) => person.id === patientId) ?? null;
