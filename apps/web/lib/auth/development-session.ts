import { cookies } from "next/headers";
import { practitioner } from "@/lib/fixtures/practitioner";
import { people } from "@/lib/fixtures/people";
import type { Role, Session, SessionProvider } from "./session";

/** Flipped by the role switch in the user menu, so both surfaces are reachable. */
export const ROLE_COOKIE = "remi-role";

export const isRole = (value: unknown): value is Role =>
  value === "practitioner" || value === "person";

/**
 * Stands in until an auth vendor is chosen. It is registered by nothing — the
 * seam falls back to it — so deleting this file and registering a real provider
 * is the whole migration.
 *
 * No cookie means signed out. That is what makes the entry screen at
 * `/[locale]` reachable at all: the cookie is set by signing in there, and by
 * the role switch in the user menu.
 */
export const developmentSessionProvider: SessionProvider = {
  name: "development",
  current: async (): Promise<Session | null> => {
    const store = await cookies();
    const role = store.get(ROLE_COOKIE)?.value;

    if (!isRole(role)) {
      return null;
    }

    if (role === "person") {
      const person = people[0];
      return {
        actor: { id: person.id, email: person.email, roles: ["person"] },
        role,
        name: person.name,
        locale: person.locale,
        practitionerId: person.practitionerId,
        personId: person.id,
      };
    }

    return {
      actor: {
        id: practitioner.id,
        email: practitioner.email,
        roles: ["practitioner"],
      },
      role,
      name: practitioner.name,
      locale: practitioner.locale,
      practitionerId: practitioner.id,
      personId: null,
    };
  },
};
