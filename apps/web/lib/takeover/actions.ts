"use server";

import { redirect } from "next/navigation";
import {
  checkSignupConsents,
  requestFileClaim,
  takeOverPatientFile,
} from "@remi/services/server";
import {
  isLocale,
  localePath,
  minPasswordLength,
  parseShownConsent,
  type ShownConsent,
} from "@remi/services/shared";
import { ensureAuthProvider } from "@/lib/auth/provider";
import { ensureDatabase } from "@/lib/database";
import { mailerReady } from "@/lib/mailer";
import { QUESTIONNAIRE_PATH } from "@/lib/patient-auth/paths";
import { takeoverLinkFor } from "./link";
import type { ClaimRequestState, TakeoverState } from "./state";

/**
 * The takeover of a practitioner-created file (`patient-takes-over-file`).
 * Public endpoints: every value is caller input, the token and the locale
 * included. The services check each value again.
 */

const localeOf = (formData: FormData) => {
  const locale = formData.get("locale");
  return typeof locale === "string" && isLocale(locale) ? locale : null;
};

/**
 * The takeover form's submit. The consents come first: with a mandatory one
 * unticked, or a text that changed since the render, nothing is written. Then
 * the password. Then `takeOverPatientFile` checks both again and writes.
 */
export const takeOverAction = async (
  _previous: TakeoverState,
  formData: FormData,
): Promise<TakeoverState> => {
  const locale = localeOf(formData);
  const token = formData.get("token");
  const password = formData.get("password");
  if (!locale || typeof token !== "string" || typeof password !== "string") {
    return { form: "spent" };
  }

  const consents = formData
    .getAll("consent")
    .map(parseShownConsent)
    .filter((shown): shown is ShownConsent => shown !== null);
  const consentCheck = checkSignupConsents(consents);
  if (!consentCheck.ok) {
    const missingOnly =
      consentCheck.missing.length > 0 && consentCheck.stale.length === 0;
    return { form: missingOnly ? "consent_missing" : "consent_stale" };
  }
  if (password.length < minPasswordLength) {
    return { form: "too_short" };
  }
  if (password.length > 128) {
    return { form: "too_long" };
  }

  ensureDatabase();
  if (!ensureAuthProvider()) {
    return { form: "unavailable" };
  }

  // The landing is the page before activation: a takeover never activates.
  const landing = localePath(locale, QUESTIONNAIRE_PATH);
  const result = await takeOverPatientFile({
    token,
    password,
    consents: consentCheck.consents,
    callbackPath: landing,
  });
  if (!result.ok) {
    switch (result.error) {
      case "not_found":
      case "spent":
        return { form: "spent" };
      case "has_account":
        return { form: "has_account" };
      case "rate_limited":
        return { form: "rate_limited" };
      case "invalid_input":
        return { form: "too_short" };
      default:
        console.error("[takeover] the takeover failed", {
          error: result.error,
          message: result.message,
        });
        return { form: "unavailable" };
    }
  }
  redirect(landing);
};

/**
 * « Recevoir un lien par e-mail » on the sign-up form, after « Un dossier
 * existe déjà pour cette adresse » (path 2). The sign-up's own fields post
 * here: the practitioner's token and the e-mail. The answer reads the same
 * whether a file matched or not.
 */
export const requestClaimAction = async (
  _previous: ClaimRequestState,
  formData: FormData,
): Promise<ClaimRequestState> => {
  const token = formData.get("token");
  // The service compares the address with each file's, so a malformed value
  // matches nothing. This only spares it the lookup.
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (typeof token !== "string" || !/^[^\s@]+@[^\s@]+$/.test(email)) {
    return { status: "unavailable" };
  }

  ensureDatabase();
  if (!mailerReady()) {
    return { status: "unavailable" };
  }
  const result = await requestFileClaim({
    practitionerToken: token,
    email,
    linkFor: await takeoverLinkFor(),
  });
  if (!result.ok) {
    return {
      status: result.error === "rate_limited" ? "rate_limited" : "unavailable",
    };
  }
  return { status: "sent" };
};
