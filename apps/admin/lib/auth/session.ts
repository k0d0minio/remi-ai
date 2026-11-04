import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import {
  getOperator,
  operatorActor,
  verifyOpenGrantToken,
  verifySessionToken,
  type Actor,
  type Operator,
} from "@remi/services/server";
import { canManageOperators } from "@remi/services/shared";
import { ensureDatabase } from "@/lib/database";

export const SESSION_COOKIE = "remi-admin-session";

/**
 * The signed-in operator, or null. Cached per request so the layout guard and
 * every action asking again share one cookie read and one lookup.
 */
export const getOperatorSession = cache(async (): Promise<Operator | null> => {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) {
    return null;
  }
  const operatorId = verifySessionToken(token);
  if (!operatorId) {
    return null;
  }
  ensureDatabase();
  return getOperator(operatorId);
});

/**
 * The operator boundary, resolved once in the `(admin)` layout — and again at
 * the top of every server action, because an action is an endpoint of its own:
 * the layout guards what is rendered, never what can be called.
 */
export const requireOperator = async (): Promise<Operator> => {
  const operator = await getOperatorSession();
  if (!operator) {
    redirect("/sign-in");
  }
  return operator;
};

/**
 * One cookie per file an admin opened with a reason (story 3). The value is a
 * signed grant that names the admin, the file and the end of the open.
 */
export const OPEN_GRANT_COOKIE_PREFIX = "remi-admin-open-";

/**
 * The actor every patient service takes (D-27): the signed-in operator, and
 * for an admin the files it opened with a reason in the last four hours.
 * Cached per request like the session itself.
 */
export const actorOf = async (operator: Operator): Promise<Actor> => {
  const store = await cookies();
  const opened = store
    .getAll()
    .filter((cookie) => cookie.name.startsWith(OPEN_GRANT_COOKIE_PREFIX))
    .map((cookie) => verifyOpenGrantToken(cookie.value, operator.id))
    .filter((id): id is string => id !== null);
  return operatorActor(operator, opened);
};

/** The same actor for a page or an action, behind the operator boundary. */
export const requireActor = cache(async (): Promise<Actor> =>
  actorOf(await requireOperator()),
);

/**
 * The second boundary, for anything touching accounts. It redirects rather
 * than 403s: an operator who followed a link they should not see has made a
 * navigation mistake, not an attack, and the console has one place to send
 * them back to.
 *
 * Every account action calls this, not just the page — the page decides what
 * renders, the action decides what happens.
 */
export const requireAdmin = async (): Promise<Operator> => {
  const operator = await requireOperator();
  if (!canManageOperators(operator.role)) {
    redirect("/");
  }
  return operator;
};
