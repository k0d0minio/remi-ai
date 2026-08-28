"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  defaultLocale,
  isLocale,
  localePath,
  type Locale,
} from "@remi/services/shared";
import { isRole, ROLE_COOKIE } from "@/lib/auth/development-session";
import { landingPath } from "@/lib/auth/landing";
import type { Role } from "@/lib/auth/session";

/** Writes the dev session, then lands on the surface that role starts from. */
const enter = async (role: Role, locale: Locale) => {
  const store = await cookies();
  store.set(ROLE_COOKIE, role, { httpOnly: true, sameSite: "lax", path: "/" });
  redirect(localePath(locale, landingPath(role)));
};

/**
 * The entry screen's submit. Nothing reads the email or the password — there is
 * no auth vendor to check them against — so the role picker is the only field
 * that decides anything, and it decides exactly what `switchRole` does.
 *
 * Both fields are re-derived from the form rather than trusted: a form value is
 * caller input, and this action is a public endpoint like any other.
 */
export const signIn = async (formData: FormData) => {
  const role = formData.get("role");
  const locale = formData.get("locale");

  await enter(
    isRole(role) ? role : "patient",
    typeof locale === "string" && isLocale(locale) ? locale : defaultLocale,
  );
};

/**
 * Flips the surface the shell renders. This exists because no auth vendor is
 * committed yet and both sides of the loop have to be reachable — it goes with
 * `lib/auth/development-session.ts` the moment a real provider is registered.
 */
export const switchRole = async (role: Role, locale: Locale) => {
  await enter(role, locale);
};

export const setLocale = async (locale: string, path: string) => {
  if (!isLocale(locale)) {
    return;
  }
  redirect(localePath(locale, path));
};
