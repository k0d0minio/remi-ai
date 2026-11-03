"use server";

import { redirect } from "next/navigation";
import {
  checkSignupConsents,
  signUpPatient,
  validateSignup,
} from "@remi/services/server";
import {
  isLocale,
  localePath,
  parseShownConsent,
  signupFields,
  type ShownConsent,
  type SignupFieldErrors,
} from "@remi/services/shared";
import { ensureAuthProvider } from "@/lib/auth/provider";
import { ensureDatabase } from "@/lib/database";
import { QUESTIONNAIRE_PATH } from "@/lib/patient-auth/paths";
import type { SignupState } from "./state";

/**
 * The sign-up form's submit (story 2). A public endpoint: every value is
 * caller input, the token and the locale included. The token arrives in a
 * hidden field because a server action has no route params. The service
 * resolves it again, so a forged token writes nothing.
 *
 * The consents come first (story 3): with a mandatory one unticked, or a text
 * that changed since the render, nothing is checked further and nothing is
 * written. `signUpPatient` checks them again before it writes.
 */
export const signUpAction = async (
  _previous: SignupState,
  formData: FormData,
): Promise<SignupState> => {
  const rawLocale = formData.get("locale");
  const token = formData.get("token");
  if (typeof rawLocale !== "string" || !isLocale(rawLocale)) {
    return { fields: {}, form: "invalid_link" };
  }
  if (typeof token !== "string") {
    return { fields: {}, form: "invalid_link" };
  }

  const consents = formData
    .getAll("consent")
    .map(parseShownConsent)
    .filter((shown): shown is ShownConsent => shown !== null);
  const consentCheck = checkSignupConsents(consents);
  if (!consentCheck.ok) {
    const missingOnly =
      consentCheck.missing.length > 0 && consentCheck.stale.length === 0;
    return {
      fields: {},
      form: missingOnly ? "consent_missing" : "consent_stale",
    };
  }

  const checked = validateSignup(
    Object.fromEntries(signupFields.map((name) => [name, formData.get(name)])),
  );
  if (!checked.ok) {
    return { fields: checked.fields, form: null };
  }

  ensureDatabase();
  if (!ensureAuthProvider()) {
    return { fields: {}, form: "unavailable" };
  }

  const landing = localePath(rawLocale, QUESTIONNAIRE_PATH);
  const result = await signUpPatient({
    token,
    locale: rawLocale,
    data: checked.data,
    callbackPath: landing,
    consents: consentCheck.consents,
  });
  if (!result.ok) {
    const fields: SignupFieldErrors = {};
    switch (result.error) {
      case "not_found":
        return { fields, form: "invalid_link" };
      case "conflict":
        return { fields, form: "already_registered" };
      case "rate_limited":
        return { fields, form: "rate_limited" };
      default:
        console.error("[signup] the sign-up failed", {
          error: result.error,
          message: result.message,
        });
        return { fields, form: "unavailable" };
    }
  }
  redirect(landing);
};
