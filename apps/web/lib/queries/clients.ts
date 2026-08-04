import {
  err,
  ok,
  type Id,
  type Person,
  type ProgressSignal,
  type Result,
  type Step,
} from "@remi/services/shared";
import { people } from "@/lib/fixtures/people";
import { getActivePlan, listSteps } from "@/lib/queries/plans";
import { listSignalsForPerson } from "@/lib/queries/signals";

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

/**
 * A client as the practitioner surface reads them: the record, plus the three
 * derived facts every practitioner screen asks for.
 */
export type ClientOverview = {
  person: Person;
  /** 0–100 across every step that has started, or null when none has. */
  adherence: number | null;
  currentStep: Step | null;
  /** The most recent signal asking for the practitioner's attention. */
  attention: ProgressSignal | null;
};

/**
 * Days applied against days targeted, across every step that has started.
 *
 * Derived rather than stored, and derived once: the roster, the practice screen
 * and the client's own page all quote the same number, and a second definition
 * of "assiduité" is how two screens end up disagreeing about the same person.
 * Upcoming steps are excluded — a step nobody has been asked to start yet is not
 * a step they are failing.
 */
const adherenceOf = (steps: readonly Step[]): number | null => {
  const started = steps.filter((step) => step.status !== "upcoming");
  const targeted = started.reduce((total, step) => total + step.targetDays, 0);

  if (targeted === 0) {
    return null;
  }

  const applied = started.reduce(
    (total, step) => total + step.completedDays,
    0,
  );
  return Math.round((applied / targeted) * 100);
};

const overviewOf = async (person: Person): Promise<ClientOverview> => {
  const plan = await getActivePlan(person.id);
  const steps = plan ? await listSteps(plan.id) : [];
  const signals = await listSignalsForPerson(person.id);

  return {
    person,
    adherence: adherenceOf(steps),
    currentStep: steps.find((step) => step.status === "current") ?? null,
    attention:
      signals.find((signal) => signal.severity === "attention") ?? null,
  };
};

export const listClientOverviews = async (
  practitionerId: Id,
): Promise<ClientOverview[]> => {
  const clients = await listClients(practitionerId);
  return Promise.all(clients.map(overviewOf));
};

/** The same shape for one client, with `getClient`'s two failure branches intact. */
export const getClientOverview = async (
  practitionerId: Id,
  personId: Id,
): Promise<Result<ClientOverview>> => {
  const client = await getClient(practitionerId, personId);

  if (!client.ok) {
    return client;
  }
  return ok(await overviewOf(client.data));
};
