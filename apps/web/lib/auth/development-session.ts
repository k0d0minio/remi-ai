import { cookies } from "next/headers";
import { practitioner } from "@/lib/fixtures/practitioner";
import { people } from "@/lib/fixtures/people";
import type { Role, Session, SessionProvider } from "./session";

/** Flipped by the role switch in the user menu, so both surfaces are reachable. */
export const ROLE_COOKIE = "remi-role";

export const isRole = (value: unknown): value is Role =>
  value === "practitioner" || value === "patient";

/**
 * The patient role was spelled `person` until REMI-040, and the cookie outlives
 * the rename in every browser that signed in before it. Reading the old value as
 * the new one is what keeps those sessions signed in; without it they would land
 * back on the entry screen. It goes when this file does — a real provider issues
 * its own sessions and never sees this cookie.
 */
const readRole = (value: unknown): Role | null => {
  if (value === "person") {
    return "patient";
  }
  return isRole(value) ? value : null;
};

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
    const role = readRole(store.get(ROLE_COOKIE)?.value);

    if (!role) {
      return null;
    }

    if (role === "patient") {
      const person = people[0];
      return {
        actor: { id: person.id, email: person.email, roles: ["patient"] },
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
