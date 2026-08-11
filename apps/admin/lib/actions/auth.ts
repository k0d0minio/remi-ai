"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  signInWithPassword,
  signOut as revokeSession,
} from "@remi/services/auth";
import { SESSION_COOKIE, sessionCookieOptions } from "@remi/services/shared";

/**
 * The sign-in form's submit. Both fields are re-derived from the form rather
 * than trusted — a server action is a public endpoint like any other — and the
 * only thing that ever comes back out is a token.
 *
 * Failure redirects rather than returning a message, which keeps the form a
 * server component: `useActionState` would make the whole screen a client
 * island for one line of text. The query flag says only that something failed;
 * which thing is deliberately not knowable, here or anywhere else.
 */
export const signIn = async (formData: FormData) => {
  const email = formData.get("email");
  const password = formData.get("password");

  if (typeof email !== "string" || typeof password !== "string") {
    redirect("/sign-in?failed=1");
  }

  const result = await signInWithPassword({ email, password });

  if (!result.ok) {
    redirect("/sign-in?failed=1");
  }

  const store = await cookies();
  store.set(SESSION_COOKIE, result.data.token, sessionCookieOptions());

  redirect("/");
};

/**
 * Revokes the row first, then clears the cookie. That order matters: clearing
 * the cookie only asks this browser to forget a token that would otherwise keep
 * working everywhere it had been copied.
 */
export const signOut = async () => {
  const store = await cookies();
  await revokeSession(store.get(SESSION_COOKIE)?.value ?? null);
  store.delete(SESSION_COOKIE);

  redirect("/sign-in");
};
