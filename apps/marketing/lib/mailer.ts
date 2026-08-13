import {
  createResendMailer,
  env,
  isMailerRegistered,
  registerMailer,
} from "@remi/services/server";

/**
 * This app's registration point for the email seam — the one place in the
 * marketing app that names a mail vendor.
 *
 * Called from the server action rather than from an `instrumentation.ts` hook on
 * purpose: a route that cold-starts has no boot the action can rely on having
 * happened in its own module graph, and re-checking a boolean per submission
 * costs nothing. When instrumentation lands for error tracking, this stays where
 * it is; it is not the same concern.
 *
 * Registration is conditional. With no key there is nothing to register, the
 * seam keeps its logging fallback, and `isMailerRegistered()` stays false — so
 * the caller can tell the sender the truth instead of acknowledging a message
 * that went nowhere.
 */
export const ensureMailer = () => {
  if (isMailerRegistered() || !env().RESEND_API_KEY) {
    return;
  }
  registerMailer(createResendMailer());
};
