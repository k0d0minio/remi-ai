import type { Actor, Id, Locale } from "@remi/services/shared";

/**
 * Which side of the loop the signed-in person is on. It decides the navigation,
 * the landing route and what the query layer will answer — so it is part of the
 * session rather than something a page looks up.
 */
export type Role = "practitioner" | "person";

export type Session = {
  actor: Actor;
  role: Role;
  name: string;
  locale: Locale;
  /** The practitioner's own id, or — for a person — the practitioner supporting them. */
  practitionerId: Id;
  /** Set only when `role` is "person". */
  personId: Id | null;
};

export type SessionProvider = {
  readonly name: string;
  current: () => Promise<Session | null>;
};

/**
 * No auth vendor is committed yet, so this mirrors how `@remi/services` treats
 * storage, email and AI: an interface plus a registration point, with the
 * concrete provider registered once at process start.
 *
 * It lives in the app rather than in the package because the auth boundary is
 * this app's concern and nothing else consumes it today. It moves to
 * `packages/services` the moment `apps/admin` needs a session too.
 */
let provider: SessionProvider | null = null;

export const registerSessionProvider = (adapter: SessionProvider) => {
  if (provider && provider !== adapter) {
    throw new Error(
      `A session provider is already registered (${provider.name}). Register once, at process start.`,
    );
  }
  provider = adapter;
};

export const isSessionProviderRegistered = () => provider !== null;

/**
 * Falls back to the development session rather than throwing, because the
 * signed-out state is not built yet and a hard failure here would make every
 * route unreachable. Registering a real provider takes precedence.
 */
export const getSession = async (): Promise<Session | null> => {
  if (provider) {
    return provider.current();
  }
  const { developmentSessionProvider } = await import("./development-session");
  return developmentSessionProvider.current();
};
