import type { SignupFieldErrors } from "@remi/services/shared";

/** Where a new patient lands, as a path under the locale. */
export const QUESTIONNAIRE_PATH = "/questionnaire";

/** A refusal of the whole form, not of one field. */
export type SignupFormError =
  | "invalid_link"
  | "already_registered"
  | "rate_limited"
  | "unavailable";

/** What the form shows after a refused submit. A success redirects. */
export type SignupState = {
  fields: SignupFieldErrors;
  form: SignupFormError | null;
};

export const initialSignupState: SignupState = { fields: {}, form: null };
