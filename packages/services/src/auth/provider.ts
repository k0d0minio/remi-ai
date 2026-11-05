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

export type AuthProvider = {
  /** Vendor name, for logs only. */
  readonly name: string;
  signUp: (input: PasswordSignUpInput) => Promise<AuthResult<AuthIdentity>>;
  signIn: (input: PasswordSignInInput) => Promise<AuthResult<AuthIdentity>>;
  requestMagicLink: (input: MagicLinkInput) => Promise<AuthResult<null>>;
  signOut: () => Promise<AuthResult<null>>;
  /** The signed-in user of the current request, or `null`. */
  readIdentity: () => Promise<AuthIdentity | null>;
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
