import { cookies } from "next/headers";
import { isOperator, resolveSession, type Session } from "@remi/services/auth";
import { SESSION_COOKIE } from "@remi/services/shared";

/**
 * The app's half of the seam: read the cookie, hand the opaque token to
 * `@remi/services/auth`, and take back whatever the database says. Nothing here
 * interprets the cookie — it is a token and only a token — so there is no shape
 * in which a role could arrive from the client.
 *
 * Writing the cookie lives in `lib/actions/auth.ts` instead, because Next only
 * allows a mutation from a server action or a route handler.
 */
export const currentSession = async (): Promise<Session | null> => {
  const store = await cookies();
  return resolveSession(store.get(SESSION_COOKIE)?.value ?? null);
};

/** The console's whole authorisation rule, resolved server-side per request. */
export const currentOperator = async (): Promise<Session | null> => {
  const session = await currentSession();
  return isOperator(session) ? session : null;
};

/** What the header shows. There is no name column yet — operators are seeded. */
export const operatorLabel = (session: Session) =>
  session.actor.email.split("@")[0];
