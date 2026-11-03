import type { SignupFieldErrors } from "@remi/services/shared";

/** A refusal of the whole form, not of one field. */
export type SignupFormError =
  | "invalid_link"
  | "already_registered"
  | "rate_limited"
  | "unavailable"
  /** A mandatory consent has no tick (story 3). */
  | "consent_missing"
  /** A consent names a text that is no longer current. */
  | "consent_stale";

/** What the form shows after a refused submit. A success redirects. */
export type SignupState = {
  fields: SignupFieldErrors;
  form: SignupFormError | null;
};

export const initialSignupState: SignupState = { fields: {}, form: null };

/** A refusal that sends the patient back to the consent step. */
export const isConsentError = (form: SignupFormError | null) =>
  form === "consent_missing" || form === "consent_stale";
