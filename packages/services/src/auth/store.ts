import type { Id } from "../types";
import type { AuthUser, SessionRecord } from "./model";

/**
 * The auth seam.
 *
 * Same shape as storage, email and AI: an interface, one registration point, and
 * nothing above it naming a vendor. It lives here rather than in `apps/web`
 * because the session is now needed by three apps — the comment on
 * `apps/web/lib/auth/session.ts` said this move happens the moment `apps/admin`
 * needs a session, and it does.
 *
 * The interface is deliberately narrow. It is not a general table gateway: every
 * method is one step of the sign-in / resolve / sign-out path, so the service
 * above it cannot grow queries the adapter never agreed to answer.
 */

export type NewAuthUser = {
  email: string;
  passwordHash: string;
  role: string;
  status: string;
};

export type NewSession = {
  userId: Id;
  tokenHash: string;
  expiresAt: Date;
};

export type AuthStore = {
  /** Vendor name, for logs and the health endpoint — e.g. "neon". */
  readonly driver: string;
  /** Case-insensitive: the unique index is on `lower(email)`. */
  findUserByEmail: (email: string) => Promise<AuthUser | null>;
  /** Upserts on email, so re-running the seed script rotates a password. */
  upsertUser: (user: NewAuthUser) => Promise<AuthUser>;
  markSignedIn: (id: Id, at: Date) => Promise<void>;
  createSession: (session: NewSession) => Promise<SessionRecord>;
  /**
   * One round trip for the whole gate: the session row joined to its user, and
   * only when the row is unexpired and unrevoked. Returning the user is what
   * lets the role be read from the database on every request instead of being
   * carried in something the client can write.
   */
  findLiveSession: (
    tokenHash: string,
    now: Date,
  ) => Promise<{ session: SessionRecord; user: AuthUser } | null>;
  /** Slides the expiry forward. Called on every resolve, hence its own method. */
  touchSession: (id: Id, expiresAt: Date) => Promise<void>;
  /** Sign-out. Revokes the row so the token is dead even if the cookie survives. */
  revokeSession: (tokenHash: string, at: Date) => Promise<void>;
};

let store: AuthStore | null = null;

/**
 * Register the adapter once, at process start — each gated app's
 * `instrumentation.ts`. Registering a second, different adapter is a bug rather
 * than a swap: callers already resolved through the first one.
 */
export const registerAuthStore = (adapter: AuthStore) => {
  if (store && store !== adapter) {
    throw new Error(
      `an auth store ("${store.driver}") is already registered — register once at process start`,
    );
  }
  store = adapter;
};

export const getAuthStore = (): AuthStore => {
  if (!store) {
    throw new Error(
      "no auth store registered — call registerAuthStore() at process start (see packages/services/AGENTS.md)",
    );
  }
  return store;
};

export const isAuthStoreRegistered = () => store !== null;
