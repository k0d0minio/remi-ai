"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  signInWithPassword,
  signOut as revokeSession,
} from "@remi/services/auth";
import { SESSION_COOKIE, sessionCookieOptions } from "@remi/services/shared";
import { SIGN_IN_PATH } from "./constants";

/**
 * The same action as the console's, minus the design system. Failure redirects
 * back with a flag rather than returning a message, which keeps the form a
 * server component — and the flag says only that something failed, never which
 * part, so the form cannot be used to find out which addresses exist.
 */
export const signIn = async (formData: FormData) => {
  const email = formData.get("email");
  const password = formData.get("password");

  if (typeof email !== "string" || typeof password !== "string") {
    redirect(`${SIGN_IN_PATH}?failed=1`);
  }

  const result = await signInWithPassword({ email, password });

  if (!result.ok) {
    redirect(`${SIGN_IN_PATH}?failed=1`);
  }

  const store = await cookies();
  store.set(SESSION_COOKIE, result.data.token, sessionCookieOptions());

  redirect("/");
};

/** Revokes the row first, then clears the cookie — same order, same reason. */
export const signOut = async () => {
  const store = await cookies();
  await revokeSession(store.get(SESSION_COOKIE)?.value ?? null);
  store.delete(SESSION_COOKIE);

  redirect(SIGN_IN_PATH);
};
