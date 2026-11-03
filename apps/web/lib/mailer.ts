import {
  createResendMailer,
  env,
  isMailerRegistered,
  registerMailer,
} from "@remi/services/server";

/**
 * This app's registration point for the email seam — the one place in the web
 * app that names a mail vendor. The same shape as the admin app's: lazily,
 * from the code that sends, never from `instrumentation.ts`, for the reason
 * `lib/database.ts` gives.
 *
 * It registers only with both variables set. A mailer with a key and no
 * `EMAIL_FROM` cannot send, and `isMailerRegistered()` must then stay false:
 * the inactivity sweep reads it and does nothing rather than delete a file
 * whose notice never went out.
 */
export const mailerReady = () => {
  if (isMailerRegistered()) {
    return true;
  }
  const { RESEND_API_KEY, EMAIL_FROM } = env();
  const missing = [
    RESEND_API_KEY ? null : "RESEND_API_KEY",
    EMAIL_FROM ? null : "EMAIL_FROM",
  ].filter((name) => name !== null);
  if (missing.length > 0) {
    console.error(
      `[mailer] no mailer registered — unset on this deployment: ${missing.join(", ")}. The inactivity sweep sends and deletes nothing. See .icm/docs/ENV.md.`,
    );
    return false;
  }
  registerMailer(createResendMailer());
  return true;
};
