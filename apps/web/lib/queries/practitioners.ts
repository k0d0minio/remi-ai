import type { Id, Practitioner } from "@remi/services/shared";
import { practitioner } from "@/lib/fixtures/practitioner";

/**
 * Who is behind the plan, read from the patient's side. See the note in
 * `./clients.ts`.
 */
export const getPractitioner = async (
  practitionerId: Id,
): Promise<Practitioner | null> =>
  practitioner.id === practitionerId ? practitioner : null;
