import {
  createNeonDatabase,
  env,
  isDatabaseRegistered,
  registerDatabase,
} from "@remi/services/server";

/**
 * This app's registration point for the storage seam — the one place in the
 * web app that names a database vendor.
 *
 * Called lazily from the code that reads, not from an `instrumentation.ts`
 * hook, for the same reason as the marketing app's mailer: a route that
 * cold-starts has no boot it can rely on having happened in its own module
 * graph, and re-checking a boolean per request costs nothing.
 *
 * With `DATABASE_URL` unset nothing is registered: the log names the variable
 * to go and set, and a read still fails loudly rather than rendering fiction.
 */
export const ensureDatabase = () => {
  if (isDatabaseRegistered()) {
    return;
  }

  if (!env().DATABASE_URL) {
    console.error(
      "[database] no adapter registered — DATABASE_URL is unset on this deployment. See .icm/docs/ENV.md.",
    );
    return;
  }

  registerDatabase(createNeonDatabase());
};
