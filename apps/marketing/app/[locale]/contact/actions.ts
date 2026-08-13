"use server";

import { isMailerRegistered, sendEmail } from "@remi/services/server";
import { defaultLocale, isLocale } from "@remi/services/shared";
import { buildContactEmail } from "@/lib/contact-email";
import { getContent } from "@/lib/content";
import type { Content } from "@/lib/content/types";
import { ensureMailer } from "@/lib/mailer";

export type ContactState = {
  status: "idle" | "success" | "error";
  message?: string;
  /** A second line under `message`. Only delivery failures need one. */
  detail?: string;
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
 * Both ways delivery can fail read the same to the sender, because the
 * difference is ours to fix and theirs to work around: the copy keeps the direct
 * addresses in front of them either way.
 */
const deliveryFailed = (form: Content["contact"]["form"]): ContactState => ({
  status: "error",
  message: form.deliveryErrorTitle,
  detail: form.deliveryErrorBody,
});

/**
 * Deliberately not `zod`: four fields do not justify a dependency this app has
 * no other use for. The locale travels as a hidden field so the validation
 * messages come back in the language the visitor is reading.
 */
export const submitContact = async (
  _previous: ContactState,
  formData: FormData,
): Promise<ContactState> => {
  const rawLocale = String(formData.get("locale") ?? "");
  const locale = isLocale(rawLocale) ? rawLocale : defaultLocale;
  const { form, people } = getContent(locale).contact;

  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();
  const consent = formData.get("consent") === "on";

  const errors: ContactState["errors"] = {};
  if (!name) {
    errors.name = form.errors.name;
  }
  if (!email) {
    errors.email = form.errors.emailMissing;
  } else if (!looksLikeEmail(email)) {
    errors.email = form.errors.emailInvalid;
  }
  if (message.length < 10) {
    errors.message = form.errors.message;
  }
  if (!consent) {
    errors.consent = form.errors.consent;
  }

  if (Object.keys(errors).length > 0) {
    return {
      status: "error",
      message: form.errorBanner,
      errors,
    };
  }

  ensureMailer();

  // No adapter means the seam is on the mailer that only logs. Telling a visitor
  // their message arrived when it reached stdout is the exact dishonesty this
  // form used to admit to in its success copy, so an unregistered mailer is a
  // failure here — not a quiet success.
  if (!isMailerRegistered()) {
    console.error(
      "[contact] no mailer registered — RESEND_API_KEY is unset, so the submission was not delivered",
    );
    return deliveryFailed(form);
  }

  // The recipients are the addresses the page already puts in front of the
  // visitor, so what the form does and what the page says stay one fact.
  try {
    await sendEmail(
      buildContactEmail({
        name,
        email,
        message,
        locale,
        to: people.map((person) => person.email),
      }),
    );
  } catch (error) {
    // The provider's complaint belongs in the server log, where it can be read
    // in full; the sender gets copy that gives them somewhere else to go.
    console.error("[contact] delivery failed", error);
    return deliveryFailed(form);
  }

  return {
    status: "success",
    message: form.successBody,
  };
};
