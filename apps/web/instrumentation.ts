/**
 * Process-start registration for the storage seam, per
 * `packages/services/AGENTS.md`: the app that owns the process names the
 * vendor once, here. Only the patient-link route reads the database today —
 * every signed-in screen still sits on fixtures until REMI-013 replaces them.
 *
 * With `DATABASE_URL` unset nothing is registered and the patient link throws
 * its "no database adapter registered" error — loud, never a page quietly
 * rendering fiction.
 */
export const register = async () => {
  // NEXT_RUNTIME is read literally rather than through env(): Next.js sets it
  // per runtime at build, and this hook must not pull the Node driver into the
  // edge bundle the proxy runs in.
  if (process.env.NEXT_RUNTIME && process.env.NEXT_RUNTIME !== "nodejs") {
    return;
  }
  const services = await import("@remi/services/server");
  if (services.env().DATABASE_URL && !services.isDatabaseRegistered()) {
    services.registerDatabase(services.createNeonDatabase());
  }
};
