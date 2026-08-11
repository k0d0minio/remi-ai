import { err, ok, type Result } from "../shared/result";
import { SESSION_TTL_SECONDS } from "../shared/session-cookie";
import type { AuthUser, Session } from "./model";
import { hashPassword, verifyPassword } from "./password";
import { getAuthStore } from "./store";
import { createSessionToken, hashSessionToken } from "./tokens";

/**
 * The callable surface over the auth seam. Everything a gated app does — sign
 * in, resolve, sign out — is one of these three, and none of them takes a role,
 * a name or anything else from the caller: the only thing that crosses the wire
 * from a browser is an opaque token, and every attribute of the session is read
 * back out of Postgres.
 */

/**
 * One message for every failure mode — unknown email, wrong password, suspended
 * account, expired session. Distinguishing them is an account-existence oracle,
 * and this form is reachable by anyone who can reach the sign-in page.
 */
export const SIGN_IN_FAILED = "That email and password are not valid.";

/**
 * Burned when no user matches, so a missing email and a wrong password take
 * comparable time. Any well-formed scrypt string works — this one hashes a value
 * nothing can type, and exists only to make the work happen.
 */
const DECOY_HASH = [
  "scrypt",
  16_384,
  8,
  1,
  Buffer.alloc(16).toString("base64"),
  Buffer.alloc(64).toString("base64"),
].join("$");
export const normaliseEmail = (email: string) => email.trim().toLowerCase();

const toSession = (
  sessionId: string,
  user: AuthUser,
  expiresAt: Date,
): Session => ({
  id: sessionId,
  actor: { id: user.id, email: user.email, roles: [user.role] },
  role: user.role,
  status: user.status,
  expiresAt,
});

const expiryFrom = (now: Date) =>
  new Date(now.getTime() + SESSION_TTL_SECONDS * 1000);

export type SignedIn = {
  /** The raw token. Goes straight into the cookie and is never stored or logged. */
  token: string;
  session: Session;
  expiresAt: Date;
};

export const signInWithPassword = async (input: {
  email: string;
  password: string;
}): Promise<Result<SignedIn, "not_permitted">> => {
  const store = getAuthStore();
  const email = normaliseEmail(input.email);
  const user = email ? await store.findUserByEmail(email) : null;

  const matches = await verifyPassword(
    input.password,
    user?.passwordHash ?? DECOY_HASH,
  );

  if (!user || !matches || user.status !== "active") {
    return err("not_permitted", SIGN_IN_FAILED);
  }

  const now = new Date();
  const expiresAt = expiryFrom(now);
  const token = createSessionToken();
  const session = await store.createSession({
    userId: user.id,
    tokenHash: hashSessionToken(token),
    expiresAt,
  });

  await store.markSignedIn(user.id, now);

  return ok({
    token,
    session: toSession(session.id, user, expiresAt),
    expiresAt,
  });
};

export type SessionProvider = {
  readonly name: string;
  /** Resolves the raw cookie value. A null, empty or unknown token is signed out. */
  current: (token: string | null) => Promise<Session | null>;
};

/**
 * The read side of the seam, and the only thing a gated layout depends on.
 *
 * It slides the expiry forward on every resolve, which is what makes the
 * eight-hour window a rolling one rather than a hard cut in the middle of an
 * operator's afternoon. The refresh is fire-and-forget in effect — the session
 * it returns is already valid — but it is awaited so a failing database surfaces
 * here rather than as an unhandled rejection.
 */
export const sessionProvider: SessionProvider = {
  name: "auth-store",
  current: async (token) => {
    if (!token) {
      return null;
    }

    const store = getAuthStore();
    const now = new Date();
    const live = await store.findLiveSession(hashSessionToken(token), now);
    if (!live) {
      return null;
    }

    const expiresAt = expiryFrom(now);
    await store.touchSession(live.session.id, expiresAt);

    return toSession(live.session.id, live.user, expiresAt);
  },
};

export const resolveSession = (token: string | null): Promise<Session | null> =>
  sessionProvider.current(token);

/**
 * Sign-out revokes the row, not just the cookie. Clearing a cookie only asks the
 * browser to forget a token that still works — anything that copied it in the
 * meantime would keep the session.
 */
export const signOut = async (token: string | null): Promise<void> => {
  if (!token) {
    return;
  }
  await getAuthStore().revokeSession(hashSessionToken(token), new Date());
};

/**
 * The seed path. Re-running it against an existing email rotates that operator's
 * password, which is the whole rotation story this ticket ships — there is no
 * self-service reset until REMI-023.
 */
export const createOperator = async (input: {
  email: string;
  password: string;
}): Promise<Result<AuthUser, "invalid_input">> => {
  const email = normaliseEmail(input.email);
  if (!email.includes("@")) {
    return err("invalid_input", "an operator needs an email address");
  }

  return ok(
    await getAuthStore().upsertUser({
      email,
      passwordHash: await hashPassword(input.password),
      role: "operator",
      status: "active",
    }),
  );
};
