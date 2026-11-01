import { createNeonAuth } from "@neon/auth/next/server";
import { err, ok } from "../../shared/result";
import type { ServiceErrorCode } from "../../shared/result";
import { requireEnv } from "../../server/env";
import type {
  AuthIdentity,
  AuthProvider,
  AuthResult,
  AuthRouteHandlers,
} from "../provider";

/**
 * The Neon Auth adapter — Jamie's choice in `patient-signup-account`, D-28.
 * Neon Auth is managed Better Auth: the users live in the `neon_auth` schema of
 * the same Neon branch, so each preview branch has its own users.
 *
 * The SDK reads the request's cookies through `next/headers`. That ties this
 * file to a Next.js request, which is where every caller runs. Nothing outside
 * this file imports `@neon/auth`: the lint rule on the apps enforces it.
 */

/** The SDK's `{ data, error }` answer, narrowed to what this adapter reads. */
type SdkError = { message?: string; status?: number; code?: string };
type SdkAnswer<T> = Promise<{ data: T | null; error: SdkError | null }>;

type SdkUser = {
  id: string;
  email: string;
  name?: string | null;
  emailVerified?: boolean | null;
};

/**
 * The slice of the SDK this adapter calls. Typed here, not taken from the
 * SDK's generics, so a vendor type change breaks this file and nothing above.
 */
export type NeonAuthClient = {
  signUp: {
    email: (body: {
      email: string;
      password: string;
      name: string;
      callbackURL?: string;
    }) => SdkAnswer<{ user: SdkUser }>;
  };
  signIn: {
    email: (body: {
      email: string;
      password: string;
    }) => SdkAnswer<{ user: SdkUser }>;
    magicLink: (body: {
      email: string;
      name?: string;
      callbackURL: string;
    }) => SdkAnswer<unknown>;
  };
  signOut: () => SdkAnswer<unknown>;
  getSession: () => SdkAnswer<{ user: SdkUser }>;
  requestPasswordReset: (body: {
    email: string;
    redirectTo: string;
  }) => SdkAnswer<unknown>;
  resetPassword: (body: {
    token: string;
    newPassword: string;
  }) => SdkAnswer<unknown>;
  handler: () => AuthRouteHandlers;
};

/** Better Auth's error codes, mapped onto the codes a page can render. */
export const toServiceError = (error: SdkError): ServiceErrorCode => {
  const code = error.code ?? "";
  const status = error.status ?? 0;
  if (code.startsWith("USER_ALREADY_EXISTS")) {
    return "conflict";
  }
  if (
    code === "INVALID_EMAIL_OR_PASSWORD" ||
    code === "EMAIL_NOT_VERIFIED" ||
    code === "INVALID_TOKEN" ||
    status === 401 ||
    status === 403
  ) {
    return "not_permitted";
  }
  if (status === 429) {
    return "rate_limited";
  }
  if (status >= 400 && status < 500) {
    return "invalid_input";
  }
  return "upstream_failed";
};

const fail = (error: SdkError) =>
  err(
    toServiceError(error),
    error.message ?? "the auth service refused the request",
  );

const toIdentity = (user: SdkUser): AuthIdentity => ({
  subject: user.id,
  email: user.email.toLowerCase(),
  name: user.name ?? "",
  emailVerified: user.emailVerified === true,
});

const done = async (answer: SdkAnswer<unknown>): Promise<AuthResult<null>> => {
  const { error } = await answer;
  return error ? fail(error) : ok(null);
};

const signedIn = async (
  answer: SdkAnswer<{ user: SdkUser }>,
): Promise<AuthResult<AuthIdentity>> => {
  const { data, error } = await answer;
  if (error) {
    return fail(error);
  }
  if (!data?.user) {
    return err("upstream_failed", "the auth service returned no user");
  }
  return ok(toIdentity(data.user));
};

/** Build the provider over any client of the SDK's shape. The tests pass a fake. */
export const neonAuthProviderFrom = (client: NeonAuthClient): AuthProvider => {
  let handlers: AuthRouteHandlers | null = null;

  return {
    name: "neon-auth",
    signUp: async ({ email, password, name, callbackPath }) =>
      signedIn(
        client.signUp.email({
          email,
          password,
          name,
          callbackURL: callbackPath,
        }),
      ),
    signIn: async ({ email, password }) =>
      signedIn(client.signIn.email({ email, password })),
    requestMagicLink: async ({ email, name, callbackPath }) =>
      done(client.signIn.magicLink({ email, name, callbackURL: callbackPath })),
    signOut: async () => done(client.signOut()),
    readIdentity: async () => {
      const { data, error } = await client.getSession();
      if (error || !data?.user) {
        return null;
      }
      return toIdentity(data.user);
    },
    requestPasswordReset: async ({ email, redirectPath }) =>
      done(client.requestPasswordReset({ email, redirectTo: redirectPath })),
    resetPassword: async ({ token, newPassword }) =>
      done(client.resetPassword({ token, newPassword })),
    routeHandlers: () => {
      handlers ??= client.handler();
      return handlers;
    },
  };
};

/**
 * The provider over Neon Auth. It needs `NEON_AUTH_BASE_URL`, which the Neon
 * integration sets per target, and `NEON_AUTH_COOKIE_SECRET`, set by hand
 * (`.icm/docs/ENV.md` § Auth).
 */
export const createNeonAuthProvider = (): AuthProvider =>
  neonAuthProviderFrom(
    createNeonAuth({
      baseUrl: requireEnv("NEON_AUTH_BASE_URL", "the Neon Auth adapter"),
      cookies: {
        secret: requireEnv("NEON_AUTH_COOKIE_SECRET", "the Neon Auth adapter"),
      },
    }) as unknown as NeonAuthClient,
  );
