import {
  createResendMailer,
  env,
  isMailerRegistered,
  registerMailer,
} from "@remi/services/server";

/**
 * This app's registration point for the email seam — the one place in the admin
 * app that names a mail vendor. Same shape as the marketing app's: lazily, from
 * the code that sends, never from `instrumentation.ts`. Next.js gives every
 * route its own copy of the services module graph, so a boot hook's
 * registration never reaches the route that sends.
 *
 * Registration is conditional on **both** variables, because this app passes no
 * from-address: a mailer holding a key but no `EMAIL_FROM` cannot succeed, and
 * registering it would turn a misconfiguration into a failed send per invite.
 * Refusing keeps `isMailerRegistered()` false, which is what lets the invite
 * flow tell the truth — it falls back to the copyable link and says so, rather
 * than reporting a delivery that never happened.
 */
const ensureMailer = () => {
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
      `[mailer] no mailer registered — unset on this deployment: ${missing.join(", ")}. Invitations and patient links fall back to a copyable link. See .icm/docs/ENV.md.`,
    );
    return;
  }

  registerMailer(createResendMailer());
};

/**
 * Whether this deployment can actually send, registering the adapter on the way
 * if it has not been. The module's only export: `ensureMailer` has no caller of
 * its own, because every question this app asks of the mail seam is really this
 * one — can I promise a delivery — and answering it requires the registration
 * to have been attempted first.
 *
 * Asked before promising anyone a delivery, and rendered in the UI so the
 * fallback is visible rather than silent.
 */
export const mailerReady = () => {
  ensureMailer();
  return isMailerRegistered();
};
