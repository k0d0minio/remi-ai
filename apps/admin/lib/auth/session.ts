import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import {
  getOperator,
  verifySessionToken,
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
 * The second boundary, for anything touching accounts. It redirects rather
 * than 403s: an operator who followed a link they should not see has made a
 * navigation mistake, not an attack, and the console has one place to send
 * them back to.
 *
 * Every account action calls this, not just the page — the page decides what
 * renders, the action decides what happens.
 */
export const requireOwner = async (): Promise<Operator> => {
  const operator = await requireOperator();
  if (!canManageOperators(operator.role)) {
    redirect("/");
  }
  return operator;
};
