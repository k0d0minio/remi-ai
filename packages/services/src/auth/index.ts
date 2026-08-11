/**
 * @remi/services/auth — operator sign-in.
 *
 * Server-only: hashing needs `node:crypto` and the store needs a connection
 * string, so importing this from a client component or from middleware's edge
 * runtime is a build error. The one thing middleware does need — the cookie's
 * name — lives on the isomorphic surface instead (`@remi/services/shared`).
 *
 * The seam is the same one storage, email and AI use: an interface, one
 * registration point, one adapter. It moved here from `apps/web/lib/auth/` for
 * the reason that file's own comment gave — the moment a second app needs a
 * session, the session stops being one app's concern. `apps/web` still runs its
 * development role-picker until REMI-023; nothing here is wired to it.
 */

export { isOperator } from "./model";
export type {
  AuthRole,
  AuthUser,
  AuthUserStatus,
  Session,
  SessionRecord,
} from "./model";

export { registerAuthStore } from "./store";
export type { AuthStore, NewAuthUser, NewSession } from "./store";

export {
  createOperator,
  resolveSession,
  SIGN_IN_FAILED,
  signInWithPassword,
  signOut,
} from "./service";
export type { SessionProvider, SignedIn } from "./service";

export { registerNeonAuthStore } from "./adapters/neon";
