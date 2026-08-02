"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { isLocale, localePath, type Locale } from "@remi/services/shared";
import { ROLE_COOKIE } from "@/lib/auth/development-session";
import type { Role } from "@/lib/auth/session";

/**
 * Flips the surface the shell renders. This exists because no auth vendor is
 * committed yet and both sides of the loop have to be reachable — it goes with
 * `lib/auth/development-session.ts` the moment a real provider is registered.
 */
export const switchRole = async (role: Role, locale: Locale) => {
  const store = await cookies();
  store.set(ROLE_COOKIE, role, { httpOnly: true, sameSite: "lax", path: "/" });
  redirect(localePath(locale, role === "practitioner" ? "/clients" : "/today"));
};

export const setLocale = async (locale: string, path: string) => {
  if (!isLocale(locale)) {
    return;
  }
  redirect(localePath(locale, path));
};
