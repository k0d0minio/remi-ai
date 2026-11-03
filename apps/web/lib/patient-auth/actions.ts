"use server";

import { redirect } from "next/navigation";
import {
  requestPatientMagicLink,
  requestPatientPasswordReset,
  resetPatientPassword,
  signInPatient,
} from "@remi/services/server";
import { isLocale, localePath } from "@remi/services/shared";
import { ensureAuthProvider } from "@/lib/auth/provider";
import { ensureDatabase } from "@/lib/database";
import {
  landingPaths,
  MAGIC_LINK_PATH,
  NEW_PASSWORD_PATH,
  SIGN_IN_PATH,
} from "./paths";
import type { LinkRequestState, NewPasswordState, SignInState } from "./state";

/**
 * The patient's sign-in, sign-out and password reset (story 2). Public
 * endpoints: every value is caller input, the locale included. The services
 * check each value again.
 */

const localeOf = (formData: FormData) => {
  const locale = formData.get("locale");
  return typeof locale === "string" && isLocale(locale) ? locale : null;
};

/** The auth and database adapters, or `false` when a variable is unset. */
const ready = () => {
  ensureDatabase();
  return ensureAuthProvider() !== null;
};

export const signInAction = async (
  _previous: SignInState,
  formData: FormData,
): Promise<SignInState> => {
  const locale = localeOf(formData);
  if (!locale || !ready()) {
    return { form: "unavailable" };
  }
  const result = await signInPatient({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!result.ok) {
    switch (result.error) {
      case "not_permitted":
        return { form: "wrong_credentials" };
      case "not_found":
        return { form: "no_account" };
      case "rate_limited":
        return { form: "rate_limited" };
      default:
        console.error("[sign-in] the sign-in failed", {
          error: result.error,
          message: result.message,
        });
        return { form: "unavailable" };
    }
  }
  redirect(localePath(locale, landingPaths[result.data.landing]));
};

export const magicLinkAction = async (
  _previous: LinkRequestState,
  formData: FormData,
): Promise<LinkRequestState> => {
  const locale = localeOf(formData);
  if (!locale || !ready()) {
    return { status: "unavailable" };
  }
  const result = await requestPatientMagicLink({
    email: formData.get("email"),
    callbackPath: localePath(locale, MAGIC_LINK_PATH),
  });
  if (!result.ok) {
    if (result.error === "rate_limited") {
      return { status: "rate_limited" };
    }
    console.error("[sign-in] the magic link failed", {
      error: result.error,
      message: result.message,
    });
    return { status: "unavailable" };
  }
  return { status: "sent" };
};

export const forgotPasswordAction = async (
  _previous: LinkRequestState,
  formData: FormData,
): Promise<LinkRequestState> => {
  const locale = localeOf(formData);
  if (!locale || !ready()) {
    return { status: "unavailable" };
  }
  const result = await requestPatientPasswordReset({
    email: formData.get("email"),
    redirectPath: localePath(locale, NEW_PASSWORD_PATH),
  });
  if (!result.ok) {
    if (result.error === "rate_limited") {
      return { status: "rate_limited" };
    }
    console.error("[sign-in] the reset request failed", {
      error: result.error,
      message: result.message,
    });
    return { status: "unavailable" };
  }
  return { status: "sent" };
};

export const newPasswordAction = async (
  _previous: NewPasswordState,
  formData: FormData,
): Promise<NewPasswordState> => {
  const locale = localeOf(formData);
  if (!locale || !ready()) {
    return { form: "unavailable" };
  }
  const token = formData.get("token");
  const newPassword = formData.get("password");
  const result = await resetPatientPassword({
    token: typeof token === "string" ? token : "",
    email: formData.get("email"),
    newPassword: typeof newPassword === "string" ? newPassword : "",
  });
  if (!result.ok) {
    if (result.error === "upstream_failed") {
      console.error("[sign-in] the new password failed", {
        message: result.message,
      });
      return { form: "unavailable" };
    }
    return { form: result.error };
  }
  if (result.data.signedIn) {
    redirect(localePath(locale, landingPaths[result.data.landing]));
  }
  redirect(`${localePath(locale, SIGN_IN_PATH)}?notice=password_changed`);
};

/** Ends the session on this device, then opens the sign-in page. */
export const signOutAction = async (formData: FormData) => {
  const locale = localeOf(formData) ?? "fr";
  const provider = ensureAuthProvider();
  if (provider) {
    const result = await provider.signOut();
    if (!result.ok) {
      console.error("[sign-in] the sign-out failed", {
        error: result.error,
        message: result.message,
      });
    }
  }
  redirect(localePath(locale, SIGN_IN_PATH));
};
