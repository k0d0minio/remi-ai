import {
  createNeonAuthProvider,
  env,
  getAuthProvider,
  isAuthProviderRegistered,
  registerAuthProvider,
  type AuthProvider,
} from "@remi/services/server";

/**
 * This app's registration point for the auth seam — the one place in the web
 * app that names the auth adapter. Called lazily from the code that needs it,
 * never from `instrumentation.ts`: each route bundle has its own copy of the
 * seam, so a boot hook's registration would not reach it (see
 * `packages/services/AGENTS.md`).
 *
 * With a variable unset nothing is registered: the log names the variable, and
 * the caller answers "not configured" instead of a crash.
 */
export const ensureAuthProvider = (): AuthProvider | null => {
  if (isAuthProviderRegistered()) {
    return getAuthProvider();
  }

  const { NEON_AUTH_BASE_URL, NEON_AUTH_COOKIE_SECRET } = env();
  if (!NEON_AUTH_BASE_URL || !NEON_AUTH_COOKIE_SECRET) {
    console.error(
      "[auth] no adapter registered — NEON_AUTH_BASE_URL or NEON_AUTH_COOKIE_SECRET is unset on this deployment. See .icm/docs/ENV.md § Auth.",
    );
    return null;
  }

  const provider = createNeonAuthProvider();
  registerAuthProvider(provider);
  return provider;
};
