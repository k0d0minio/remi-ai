/**
 * A refusal of the sign-in form. A wrong e-mail and a wrong password share
 * one code, so the page never tells which one is wrong.
 */
export type SignInFormError =
  | "wrong_credentials"
  /** The identity store knows the person, but no patient file holds them. */
  | "no_account"
  | "rate_limited"
  | "unavailable";

/** What the sign-in form shows after a refused submit. A success redirects. */
export type SignInState = { form: SignInFormError | null };

export const initialSignInState: SignInState = { form: null };

/**
 * What a form that sends a link shows: the magic link and the reset link.
 * `sent` reads the same whether the e-mail holds an account or not.
 */
export type LinkRequestState = {
  status: "sent" | "rate_limited" | "unavailable" | null;
};

export const initialLinkRequestState: LinkRequestState = { status: null };

/** A refusal of the new-password form. */
export type NewPasswordFormError =
  | "too_short"
  | "too_long"
  | "invalid_link"
  | "rate_limited"
  | "unavailable";

export type NewPasswordState = { form: NewPasswordFormError | null };

export const initialNewPasswordState: NewPasswordState = { form: null };
