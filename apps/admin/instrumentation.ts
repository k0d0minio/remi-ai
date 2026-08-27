/**
 * Process-start registration for the storage seam, per
 * `packages/services/AGENTS.md`: the app that owns the process names the
 * vendor once, here, and nothing else does.
 *
 * With `DATABASE_URL` unset nothing is registered and the first query throws
 * its "no database adapter registered" error — a deploy without a database is
 * loud, never a console quietly showing nothing.
 */
export const register = async () => {
  // NEXT_RUNTIME is read literally rather than through env(): Next.js sets it
  // per runtime at build, and this hook is the one place the answer matters.
  if (process.env.NEXT_RUNTIME && process.env.NEXT_RUNTIME !== "nodejs") {
    return;
  }
  const services = await import("@remi/services/server");
  if (services.env().DATABASE_URL && !services.isDatabaseRegistered()) {
    services.registerDatabase(services.createNeonDatabase());
  }
};
