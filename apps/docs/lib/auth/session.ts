import { cookies } from "next/headers";
import { isOperator, resolveSession } from "@remi/services/auth";
import { SESSION_COOKIE } from "@remi/services/shared";

/**
 * The docs site is gated against the same `auth_user` table as the console, for
 * the reason the audit gave: it publishes the pilot's exact pricing and the
 * internal reasoning behind it, which the public site deliberately withholds.
 * One operator account therefore opens both.
 *
 * Same shape as `apps/admin/lib/auth/session.ts` — the cookie carries a token
 * and nothing else, and every attribute of the session is read back out of
 * Postgres on every request.
 */
export const isOperatorSignedIn = async (): Promise<boolean> => {
  const store = await cookies();
  const session = await resolveSession(
    store.get(SESSION_COOKIE)?.value ?? null,
  );
  return isOperator(session);
};
