/**
 * The operator session cookie's name and shape.
 *
 * This is the one part of auth that lives on the isomorphic surface, and the
 * reason is a runtime boundary rather than a preference: each gated app's
 * `middleware.ts` runs in the edge runtime and has to know which cookie to look
 * for, while everything that touches a token needs `node:crypto` and therefore
 * cannot be reached from there. A cookie name and a TTL carry no secret and no
 * Node dependency, so they are safe here; the token, the hashing and the store
 * stay behind `@remi/services/auth`, which is server-only.
 *
 * Host-only on purpose — no `domain`. A parent-domain cookie would never be
 * sent to a preview deployment, which answers on `*.vercel.app`, so a gated
 * preview would be impossible to sign in to. The cost is signing in once per
 * internal app; that is the better trade until the domain question settles.
 */
export const SESSION_COOKIE = "remi-operator-session";

/** Eight hours — a working day — refreshed every time the session is resolved. */
export const SESSION_TTL_SECONDS = 8 * 60 * 60;

export type SessionCookieOptions = {
  httpOnly: true;
  secure: true;
  sameSite: "lax";
  path: "/";
  maxAge: number;
};

/**
 * `secure` is unconditional. Browsers treat `http://localhost` as a trustworthy
 * origin and set Secure cookies on it anyway, so there is no development
 * carve-out to make — and a carve-out keyed on `NODE_ENV` is exactly how a
 * production deployment ends up shipping a cookie over plaintext.
 */
export const sessionCookieOptions = (
  maxAgeSeconds: number = SESSION_TTL_SECONDS,
): SessionCookieOptions => ({
  httpOnly: true,
  secure: true,
  sameSite: "lax",
  path: "/",
  maxAge: maxAgeSeconds,
});
