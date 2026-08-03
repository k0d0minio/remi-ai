import type { Role } from "./session";

/**
 * Where a role starts from once it is signed in. Three callers need the answer —
 * the entry screen, the sign-in submit and the role switch in the user menu — so
 * it lives here rather than being written out at each of them and drifting.
 */
export const landingPath = (role: Role) =>
  role === "practitioner" ? "/clients" : "/today";
