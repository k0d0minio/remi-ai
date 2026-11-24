import type { Result, ServiceErrorCode } from "../shared/result";

/**
 * The auth seam — D-28: one seam under both apps, one adapter behind it.
 *
 * It mirrors storage, email and files: an interface and a registration point.
 * The app that owns the process registers the adapter lazily, at first use,
 * from an idempotent `ensure*()` helper. Nothing above this file names the
 * vendor, so a change of vendor is one adapter file and one registration line.
 *
 * A patient signs up and signs in two ways: an e-mail and a password, or a
 * magic link sent to the e-mail (Jamie, 2026-11-01). The operator console still
 * signs in through `password.ts` and `session-token.ts`. Operators move onto
 * this seam in a later ticket.
 */

/** The identity store's view of the signed-in user. It names no vendor. */
export type AuthIdentity = {
  /** The adapter's user id. `patient_accounts.auth_subject` stores it. */
  subject: string;
  email: string;
  name: string;
  emailVerified: boolean;
};

export type AuthResult<T> = Result<T, ServiceErrorCode>;

export type PasswordSignUpInput = {
  email: string;
  password: string;
  name: string;
  /** Where the e-mail verification link returns to, as a path of this app. */
  callbackPath?: string;
};

export type PasswordSignInInput = {
  email: string;
  password: string;
};

export type MagicLinkInput = {
  email: string;
  /** Used when the link creates the user. */
  name?: string;
  /** Where the link lands after it signs the patient in, as a path of this app. */
  callbackPath: string;
};

export type PasswordResetRequestInput = {
  email: string;
  /** The page that asks for the new password, as a path of this app. */
  redirectPath: string;
};

export type PasswordResetInput = {
  token: string;
  newPassword: string;
};

type RouteContext = { params: Promise<{ path: string[] }> };

type RouteHandler = (
  request: Request,
  context: RouteContext,
) => Promise<Response>;

/**
 * The HTTP surface the adapter needs, mounted by the app at
 * `app/api/auth/[...path]/route.ts`: the magic link, the e-mail verification
 * and the password reset links all land here.
 */
export type AuthRouteHandlers = {
  GET: RouteHandler;
  POST: RouteHandler;
  PUT: RouteHandler;
  PATCH: RouteHandler;
  DELETE: RouteHandler;
};

/**
 * A session read that got no answer from the identity store: the store was
 * not reachable, it refused the read (a rate limit), or it answered an error.
 * It is not a sign-out. The session of the visitor is unknown, so the caller
 * shows an error and keeps the visitor's cookies. It never treats the visitor
 * as signed in, and it never sends them to the sign-in page as signed out.
 *
 * `reason` is a status and a code of the store. It holds no cookie, no token
 * and no session id.
 */
export class SessionReadError extends Error {
  override readonly name = "SessionReadError";
  readonly reason: string;

  constructor(reason: string) {
    super(`the session read failed (${reason})`);
    this.reason = reason;
  }
}

/**
 * True for a `SessionReadError`. It reads the name, not the class: each route
 * bundle has its own copy of this module, and `instanceof` fails across two
 * copies.
 */
export const isSessionReadError = (error: unknown): error is SessionReadError =>
  typeof error === "object" &&
  error !== null &&
  (error as { name?: unknown }).name === "SessionReadError";

/**
 * What the proxy applies when the adapter renewed its cached session for a
 * page request (`renewSessionCache`).
 */
export type SessionRenewal = {
  /** The `set-cookie` lines for the browser. They set the cache only. */
  setCookies: string[];
  /** The `cookie` header of this request, with the renewed cache added. */
  cookieHeader: string;
};

export type AuthProvider = {
  /** Vendor name, for logs only. */
  readonly name: string;
  signUp: (input: PasswordSignUpInput) => Promise<AuthResult<AuthIdentity>>;
  signIn: (input: PasswordSignInInput) => Promise<AuthResult<AuthIdentity>>;
  requestMagicLink: (input: MagicLinkInput) => Promise<AuthResult<null>>;
  signOut: () => Promise<AuthResult<null>>;
  /**
   * The signed-in user of the current request, or `null` when the identity
   * store answers that nobody is signed in. It throws `SessionReadError` when
   * the store gave no answer: a failed read is not a sign-out.
   */
  readIdentity: () => Promise<AuthIdentity | null>;
  /**
   * Renews the adapter's cached session for one page request. The caller is
   * the app's proxy, the one place where a page request can write a cookie
   * (a page render cannot). With a fresh cache, `readIdentity` does not call
   * the identity store. It answers `null` when there is nothing to renew, and
   * when the renewal failed: the read then goes to the store as before. It
   * never clears a cookie.
   */
  renewSessionCache: (request: Request) => Promise<SessionRenewal | null>;
  requestPasswordReset: (
    input: PasswordResetRequestInput,
  ) => Promise<AuthResult<null>>;
  resetPassword: (input: PasswordResetInput) => Promise<AuthResult<null>>;
  /**
   * Completes a sign-in that returns from an e-mail link. The link proves the
   * identity on the auth server's own host. This call turns that proof into a
   * session on this app's host. It answers the redirect that stores the
   * session, or `null` when the request carries no proof or the proof fails.
   * The caller is the route where the link lands, with that route's request.
   */
  completeRedirectSignIn: (request: Request) => Promise<Response | null>;
  /**
   * Deletes one user of the identity store by its subject, with its sessions
   * and its sign-in methods. The caller is `deletePatient`: the patient file
   * and the user go together (REM-133). A subject that the store does not
   * know is a success: the user is already gone, so a second try succeeds.
   * It answers `upstream_failed` when the store did not delete the user.
   */
  deleteUser: (subject: string) => Promise<AuthResult<null>>;
  routeHandlers: () => AuthRouteHandlers;
};

let provider: AuthProvider | null = null;

/**
 * Register once per module graph, lazily at first use. A second, different
 * adapter is a bug, not a swap: callers that already resolved the first one
 * would keep it.
 */
export const registerAuthProvider = (adapter: AuthProvider) => {
  if (provider && provider !== adapter) {
    throw new Error(
      `an auth provider ("${provider.name}") is already registered — register once, at first use`,
    );
  }
  provider = adapter;
};

export const getAuthProvider = (): AuthProvider => {
  if (!provider) {
    throw new Error(
      "no auth provider registered — call registerAuthProvider() from the app's ensureAuthProvider() (see packages/services/AGENTS.md)",
    );
  }
  return provider;
};

export const isAuthProviderRegistered = () => provider !== null;
