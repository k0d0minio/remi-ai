import { cookies } from "next/headers";
import {
  ADMIN_OPEN_TTL_SECONDS,
  SESSION_TTL_SECONDS,
  createOpenGrantToken,
  createSessionToken,
  env,
} from "@remi/services/server";
import { OPEN_GRANT_COOKIE_PREFIX, SESSION_COOKIE } from "./session";

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

/**
 * The cookie of one admin open (story 3): a signed grant for one file, for
 * four hours. Same attributes as the session, for the same reason.
 */
export const setOpenGrantCookie = async (
  operatorId: string,
  patientId: string,
) => {
  const store = await cookies();
  store.set(
    `${OPEN_GRANT_COOKIE_PREFIX}${patientId}`,
    createOpenGrantToken(operatorId, patientId),
    {
      httpOnly: true,
      secure: env().NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: ADMIN_OPEN_TTL_SECONDS,
    },
  );
};
