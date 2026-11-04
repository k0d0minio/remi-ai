/** A refusal of the takeover form. A success redirects. */
export type TakeoverFormError =
  /** A mandatory consent has no tick (story 3). */
  | "consent_missing"
  /** A consent names a text that is no longer current. */
  | "consent_stale"
  | "too_short"
  | "too_long"
  /** The link served once, or expired, between the render and the submit. */
  | "spent"
  /** The file or its e-mail holds an account. The form shows the sign-in link. */
  | "has_account"
  | "rate_limited"
  | "unavailable";

export type TakeoverState = { form: TakeoverFormError | null };

export const initialTakeoverState: TakeoverState = { form: null };

/** A refusal that sends the patient back to the consent step. */
export const isTakeoverConsentError = (form: TakeoverFormError | null) =>
  form === "consent_missing" || form === "consent_stale";

/** The answer to « Recevoir un lien par e-mail » on the sign-up form. */
export type ClaimRequestState = {
  status: "idle" | "sent" | "rate_limited" | "unavailable";
};

export const initialClaimRequestState: ClaimRequestState = { status: "idle" };
