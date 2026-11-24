import { createNeonAuth } from "@neon/auth/next/server";
import { neon } from "@neondatabase/serverless";
import { err, ok } from "../../shared/result";
import type { ServiceErrorCode } from "../../shared/result";
import { requireEnv } from "../../server/env";
import { SessionReadError } from "../provider";
import type {
  AuthIdentity,
  AuthProvider,
  AuthResult,
  AuthRouteHandlers,
  SessionRenewal,
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

/**
 * The query parameter that Neon Auth adds when it redirects back from an
 * e-mail link. Its value is the one-time proof that `get-session` exchanges.
 */
export const SESSION_VERIFIER_PARAM = "neon_auth_session_verifier";

/**
 * The two cookies of a session. The token is the session: the auth server
 * checks it. The cache is the session's data, signed by this app, and it
 * lives 5 minutes (`cookies.sessionDataTtl`). While the cache is fresh,
 * `getSession` reads it and does not call the auth server.
 *
 * The SDK writes the cache at sign-in. After that, only its route handler and
 * its middleware renew it, and this app does not mount the middleware. Thus
 * `renewSessionCache` renews it from the app's proxy. Without it, each session
 * read of each request is a call to the auth server, and the auth server
 * limits the calls of one address (HTTP 429).
 */
const SESSION_TOKEN_COOKIE = "__Secure-neon-auth.session_token";
const SESSION_CACHE_COOKIE = "__Secure-neon-auth.local.session_data";

/** The cookie names of a `cookie` header. A value is never read here. */
const cookieNames = (cookieHeader: string): Set<string> =>
  new Set(
    cookieHeader
      .split(";")
      .map((pair) => pair.split("=")[0]?.trim() ?? "")
      .filter((name) => name !== ""),
  );

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

/**
 * One answer of `getSession`, sorted. The three cases must stay apart:
 * `failed` is not `nobody`. Before 2026-11-20 each error was read as `nobody`,
 * and a signed-in patient saw the sign-in page when the auth server refused
 * one read.
 */
export type SessionRead =
  | { kind: "identity"; identity: AuthIdentity }
  | { kind: "nobody" }
  | { kind: "failed"; reason: string; retry: boolean };

/** How long the adapter waits before the second and the third read. */
export const SESSION_READ_WAITS_MS = [150, 450] as const;

const wait = (ms: number) =>
  new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });

/**
 * Sorts the SDK's answer. The auth server answers `200 null` when nobody is
 * signed in, and that is the only `nobody`, with a 401. Each other error is a
 * failed read: a transport error (502 from the SDK), a 5xx, a rate limit.
 * A rate limit is not read again at once: the wait that it asks (36 seconds
 * when measured) is longer than the retries.
 */
export const sortSessionAnswer = (answer: {
  data: { user?: SdkUser | null } | null;
  error: SdkError | null;
}): SessionRead => {
  const { data, error } = answer;
  if (error) {
    if (error.status === 401) {
      return { kind: "nobody" };
    }
    return {
      kind: "failed",
      reason: `${error.status ?? "no status"} ${error.code ?? "no code"}`,
      retry: error.status !== 429,
    };
  }
  return data?.user
    ? { kind: "identity", identity: toIdentity(data.user) }
    : { kind: "nobody" };
};

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

/**
 * Removes one row of `neon_auth."user"`. The cascades of the schema remove
 * the user's sessions, sign-in methods (`account`) and organisation
 * memberships. It throws when the database refuses the statement.
 */
export type RemoveUser = (subject: string) => Promise<void>;

/** The shape of a Neon Auth user id. No other value can match a row. */
const USER_ID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * The users live in the `neon_auth` schema of the database that
 * `DATABASE_URL` names: the Neon integration sets that variable and
 * `NEON_AUTH_BASE_URL` from the same branch. The SDK has no call that deletes
 * another user without an admin session, and the operator console does not
 * sign in through Neon Auth. Thus the adapter deletes the row itself. The
 * owner role of the database is a member of the role `neon_auth`, which owns
 * the table.
 */
const removeUserByQuery = (): RemoveUser => {
  let remove: RemoveUser | null = null;
  return async (subject) => {
    if (!remove) {
      const sql = neon(
        requireEnv("DATABASE_URL", "the Neon Auth adapter's user deletion"),
      );
      remove = async (id) => {
        await sql.query('delete from neon_auth."user" where id = $1', [id]);
      };
    }
    await remove(subject);
  };
};

/**
 * Build the provider over any client of the SDK's shape, or over a function
 * that builds the client. The function runs once, at the first call that
 * uses the client. The tests pass a fake, a `wait` that does not wait and a
 * fake `removeUser`.
 */
export const neonAuthProviderFrom = (
  client: NeonAuthClient | (() => NeonAuthClient),
  options: {
    wait?: (ms: number) => Promise<void>;
    removeUser?: RemoveUser;
  } = {},
): AuthProvider => {
  let built: NeonAuthClient | null = null;
  const sdk = () =>
    (built ??= typeof client === "function" ? client() : client);
  const pause = options.wait ?? wait;
  const removeUser = options.removeUser ?? removeUserByQuery();
  let handlers: AuthRouteHandlers | null = null;
  const routeHandlers = () => {
    handlers ??= sdk().handler();
    return handlers;
  };

  /**
   * One read. A throw of the SDK is a failed read too: the SDK throws when
   * the auth server sends a cookie during a page render, which cannot write
   * one (the daily renewal of a session does this). The next read succeeds.
   */
  const readOnce = async (): Promise<SessionRead> => {
    try {
      return sortSessionAnswer(await sdk().getSession());
    } catch (cause) {
      return {
        kind: "failed",
        // The name only: a message can quote a request.
        reason: cause instanceof Error ? cause.name : "unknown error",
        retry: true,
      };
    }
  };

  return {
    name: "neon-auth",
    signUp: async ({ email, password, name, callbackPath }) =>
      signedIn(
        sdk().signUp.email({
          email,
          password,
          name,
          callbackURL: callbackPath,
        }),
      ),
    signIn: async ({ email, password }) =>
      signedIn(sdk().signIn.email({ email, password })),
    requestMagicLink: async ({ email, name, callbackPath }) =>
      done(sdk().signIn.magicLink({ email, name, callbackURL: callbackPath })),
    signOut: async () => done(sdk().signOut()),
    // A failed read is read again, twice at most. Then it is an error for
    // the caller, never "nobody is signed in". The check itself stays as it
    // was: an identity comes only from an answer that has a user.
    readIdentity: async () => {
      let read = await readOnce();
      for (const ms of SESSION_READ_WAITS_MS) {
        if (read.kind !== "failed" || !read.retry) {
          break;
        }
        await pause(ms);
        read = await readOnce();
      }
      if (read.kind === "identity") {
        return read.identity;
      }
      if (read.kind === "nobody") {
        return null;
      }
      console.error("[auth] the session read failed", { reason: read.reason });
      throw new SessionReadError(read.reason);
    },
    // The SDK's own route handler renews the cache: asked for `get-session`
    // with a token and no cache, it reads the session at the auth server and
    // answers the cache cookie. Only that cookie goes on. A deletion, or a
    // change of the token, never leaves this function.
    renewSessionCache: async (request): Promise<SessionRenewal | null> => {
      const cookieHeader = request.headers.get("cookie") ?? "";
      const names = cookieNames(cookieHeader);
      if (!names.has(SESSION_TOKEN_COOKIE) || names.has(SESSION_CACHE_COOKIE)) {
        return null;
      }
      try {
        const url = new URL("/api/auth/get-session", request.url);
        const answer = await routeHandlers().GET(
          new Request(url, {
            headers: { cookie: cookieHeader, origin: url.origin },
          }),
          { params: Promise.resolve({ path: ["get-session"] }) },
        );
        const body = (await answer
          .clone()
          .json()
          .catch(() => null)) as { user?: unknown } | null;
        if (!answer.ok || !body?.user) {
          return null;
        }
        const prefix = `${SESSION_CACHE_COOKIE}=`;
        const line = answer.headers
          .getSetCookie()
          .find((cookie) => cookie.startsWith(prefix));
        const value = line?.slice(prefix.length).split(";")[0];
        if (!line || !value) {
          return null;
        }
        return {
          setCookies: [line],
          cookieHeader: `${cookieHeader}; ${prefix}${value}`,
        };
      } catch (cause) {
        console.error("[auth] the session cache was not renewed", {
          name: cause instanceof Error ? cause.name : "unknown error",
        });
        return null;
      }
    },
    requestPasswordReset: async ({ email, redirectPath }) =>
      done(sdk().requestPasswordReset({ email, redirectTo: redirectPath })),
    resetPassword: async ({ token, newPassword }) =>
      done(sdk().resetPassword({ token, newPassword })),
    // The link lands on the auth server's host, and the server redirects back
    // with the verifier. The auth handler sends it to `get-session`, as the
    // browser SDK does, and answers the session cookies for this app's host.
    // The route then redirects to the same path without the verifier.
    completeRedirectSignIn: async (request) => {
      const url = new URL(request.url);
      if (!url.searchParams.has(SESSION_VERIFIER_PARAM)) {
        return null;
      }
      const answer = await routeHandlers().GET(request, {
        params: Promise.resolve({ path: ["get-session"] }),
      });
      const body = (await answer
        .clone()
        .json()
        .catch(() => null)) as { user?: unknown } | null;
      const cookies = answer.headers.getSetCookie();
      if (!answer.ok || !body?.user || cookies.length === 0) {
        return null;
      }
      url.searchParams.delete(SESSION_VERIFIER_PARAM);
      const headers = new Headers({ location: url.toString() });
      for (const cookie of cookies) {
        headers.append("set-cookie", cookie);
      }
      return new Response(null, { status: 303, headers });
    },
    // A subject that is not a Neon Auth user id matches no row: the user is
    // already gone. A refused statement is logged with the error's name only:
    // a message can quote the subject.
    deleteUser: async (subject) => {
      if (!USER_ID.test(subject)) {
        return ok(null);
      }
      try {
        await removeUser(subject);
        return ok(null);
      } catch (cause) {
        console.error("[auth] the user was not deleted", {
          name: cause instanceof Error ? cause.name : "unknown error",
        });
        return err("upstream_failed", "the auth store did not delete the user");
      }
    },
    routeHandlers,
  };
};

/**
 * The provider over Neon Auth. The SDK needs `NEON_AUTH_BASE_URL`, which the
 * Neon integration sets per target, and `NEON_AUTH_COOKIE_SECRET`, set by hand
 * (`.icm/docs/ENV.md` § Auth). The adapter builds the SDK at the first call
 * that uses it. `deleteUser` does not use it: it needs `DATABASE_URL` only.
 * Thus the admin app, which has no `NEON_AUTH_*` variable, registers this
 * adapter to delete a patient's user.
 */
export const createNeonAuthProvider = (): AuthProvider =>
  neonAuthProviderFrom(
    () =>
      createNeonAuth({
        baseUrl: requireEnv("NEON_AUTH_BASE_URL", "the Neon Auth adapter"),
        cookies: {
          secret: requireEnv(
            "NEON_AUTH_COOKIE_SECRET",
            "the Neon Auth adapter",
          ),
        },
      }) as unknown as NeonAuthClient,
  );
