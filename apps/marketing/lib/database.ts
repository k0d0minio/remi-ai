import {
  createNeonDatabase,
  env,
  isDatabaseRegistered,
  registerDatabase,
} from "@remi/services/server";

/**
 * This app's registration point for the storage seam — the one place in the
 * marketing app that names a database vendor. The site stores one thing: a
 * waiting-list lead, from the server action in `lib/leads/actions.ts`.
 *
 * Called lazily from the action, like the mailer, and conditional on
 * `DATABASE_URL`: with it unset nothing is registered, the log names the
 * variable, and the action still sends the notification email.
 */
export const ensureDatabase = () => {
  if (isDatabaseRegistered()) {
    return;
  }

  if (!env().DATABASE_URL) {
    console.error(
      "[database] no adapter registered — DATABASE_URL is unset on this deployment. Leads reach the email only. See .icm/docs/ENV.md.",
    );
    return;
  }

  registerDatabase(createNeonDatabase());
};
