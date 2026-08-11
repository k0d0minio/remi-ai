/**
 * Where the auth adapter is registered — once, before anything else in the
 * server runtime, which is what `instrumentation.ts` is for.
 *
 * The runtime guard is not defensive noise: `register()` is called for the edge
 * runtime too, and `@remi/services/auth` reaches for `node:crypto`. A static
 * import here would fail the edge bundle even though nothing on that side ever
 * signs anyone in — `middleware.ts` only looks for a cookie.
 */
export const register = async () => {
  if (process.env.NEXT_RUNTIME !== "nodejs") {
    return;
  }

  const { registerNeonAuthStore } = await import("@remi/services/auth");
  registerNeonAuthStore();
};
