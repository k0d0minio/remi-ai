"use server";

import { redirect } from "next/navigation";
import { signUpPatient, validateSignup } from "@remi/services/server";
import {
  isLocale,
  localePath,
  signupFields,
  type SignupFieldErrors,
} from "@remi/services/shared";
import { ensureAuthProvider } from "@/lib/auth/provider";
import { ensureDatabase } from "@/lib/database";
import { QUESTIONNAIRE_PATH, type SignupState } from "./state";

/**
 * The sign-up form's submit (story 2). A public endpoint: every value is
 * caller input, the token and the locale included. The token arrives in a
 * hidden field because a server action has no route params. The service
 * resolves it again, so a forged token writes nothing.
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
