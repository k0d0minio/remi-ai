import { cookies } from "next/headers";
import {
  SESSION_TTL_SECONDS,
  createSessionToken,
  env,
} from "@remi/services/server";
import { SESSION_COOKIE } from "./session";

/**
 * Minting the session cookie, in one place.
 *
 * Two flows create a session — signing in, and accepting an invitation — and
 * they live in different action modules. A second copy of these cookie
 * attributes is how one of them ends up without `httpOnly` after a refactor
 * nobody reviewed twice.
 */
export const setSessionCookie = async (operatorId: string) => {
  const store = await cookies();
  store.set(SESSION_COOKIE, createSessionToken(operatorId), {
    httpOnly: true,
    secure: env().NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  });
};
