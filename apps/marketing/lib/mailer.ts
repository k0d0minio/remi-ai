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
 * Registration is conditional, and on **both** variables. This app never passes
 * a from-address, so a mailer holding a key but no `EMAIL_FROM` is one that
 * cannot succeed — registering it would turn a misconfiguration into a failed
 * send per submission. Refusing instead keeps `isMailerRegistered()` false, so
 * the caller tells the sender the truth rather than acknowledging a message
 * that went nowhere, and the log names the variable to go and set.
 */
export const ensureMailer = () => {
  if (isMailerRegistered()) {
    return;
  }

  const { RESEND_API_KEY, EMAIL_FROM } = env();
  const missing = [
    RESEND_API_KEY ? null : "RESEND_API_KEY",
    EMAIL_FROM ? null : "EMAIL_FROM",
  ].filter((name) => name !== null);

  if (missing.length > 0) {
    console.error(
      `[mailer] no mailer registered — unset on this deployment: ${missing.join(", ")}. Contact-form submissions cannot be delivered. See .icm/docs/ENV.md.`,
    );
    return;
  }

  registerMailer(createResendMailer());
};
