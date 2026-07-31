"use server";

export type ContactState = {
  status: "idle" | "success" | "error";
  message?: string;
  /** Field name → what is wrong with it. Rendered by `Field`'s `error` prop. */
  errors?: Partial<Record<"name" | "email" | "message" | "consent", string>>;
};

export const initialContactState: ContactState = { status: "idle" };

/**
 * A loose email check on purpose. The only way to know an address is real is to
 * send to it, and a strict pattern's failure mode is rejecting somebody's valid
 * address — which is worse than accepting one that bounces.
 */
const looksLikeEmail = (value: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

/**
 * Deliberately not `zod`: four fields do not justify a dependency this app has
 * no other use for, and CONVENTIONS.md is explicit that every dependency needs
 * an import to earn its place.
 */
export const submitContact = async (
  _previous: ContactState,
  formData: FormData,
): Promise<ContactState> => {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();
  const consent = formData.get("consent") === "on";

  const errors: ContactState["errors"] = {};
  if (!name) {
    errors.name = "Please tell us your name.";
  }
  if (!email) {
    errors.email = "Please give us an email address to reply to.";
  } else if (!looksLikeEmail(email)) {
    errors.email = "That does not look like an email address.";
  }
  if (message.length < 10) {
    errors.message = "A little more detail will get you a better answer.";
  }
  if (!consent) {
    errors.consent = "We need your agreement before we can hold your message.";
  }

  if (Object.keys(errors).length > 0) {
    return {
      status: "error",
      message: "Please check the fields below.",
      errors,
    };
  }

  // The email seam is not wired yet — packages/services keeps an interface and a
  // registration point for email, and no vendor has been chosen. Until one is,
  // this validates and acknowledges without delivering anywhere, which is why
  // the success message says so rather than promising a reply.
  //
  // When an adapter lands: import it from "@remi/services/email" and send from
  // here. Nothing else about this action needs to change.

  return {
    status: "success",
    message:
      "Thanks — your message passed validation. Delivery is not connected yet, so nothing has been sent.",
  };
};
