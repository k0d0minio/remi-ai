/**
 * Registers the auth adapter once, before anything else in the server runtime.
 * Identical to `apps/admin/instrumentation.ts`, including the runtime guard:
 * `register()` also runs for the edge runtime, where `@remi/services/auth`'s
 * `node:crypto` import cannot be bundled — and nothing on that side needs it,
 * because `middleware.ts` only looks for a cookie.
 */
export const register = async () => {
  if (process.env.NEXT_RUNTIME !== "nodejs") {
    return;
  }

  const { registerNeonAuthStore } = await import("@remi/services/auth");
  registerNeonAuthStore();
};
