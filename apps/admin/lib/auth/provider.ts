import {
  createNeonAuthProvider,
  env,
  isAuthProviderRegistered,
  registerAuthProvider,
} from "@remi/services/server";

/**
 * This app's registration point for the auth seam, the one place in the
 * admin app that names the auth adapter. Operators do not sign in through it:
 * their session is `lib/auth/session.ts`. The console uses one call of the
 * seam, `deleteUser`, which `deletePatient` makes when the patient has an
 * account (REM-133). The adapter builds the vendor SDK only for a sign-in
 * call, so this app needs no `NEON_AUTH_*` variable. `deleteUser` needs
 * `DATABASE_URL`.
 *
 * Lazily, from the code that deletes, and through `/server`: that is the copy
 * of the seam that `deletePatient` reads (`packages/services/AGENTS.md`).
 *
 * With `DATABASE_URL` unset nothing is registered. The log names the
 * variable, and `deletePatient` refuses to delete a patient who has an
 * account.
 */
export const authProviderReady = () => {
  if (isAuthProviderRegistered()) {
    return true;
  }
  if (!env().DATABASE_URL) {
    console.error(
      "[auth] no adapter registered — DATABASE_URL is unset on this deployment. A patient with an account cannot be deleted. See .icm/docs/ENV.md.",
    );
    return false;
  }
  registerAuthProvider(createNeonAuthProvider());
  return true;
};
