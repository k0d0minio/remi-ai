import { createHmac, randomBytes } from "node:crypto";
import { requireEnv } from "../server/env";

/** 256 bits, base64url so it survives a cookie without escaping. */
const TOKEN_BYTES = 32;

export const createSessionToken = (): string =>
  randomBytes(TOKEN_BYTES).toString("base64url");

/**
 * What `auth_session.token_hash` actually holds.
 *
 * The pepper — `AUTH_SECRET`, which lives in Vercel and never in Postgres — is
 * the point of using an HMAC rather than a plain digest: a read-only leak of the
 * session table hands over a column of hashes that cannot be turned back into
 * live cookies without also holding the secret. It is also what gives
 * `AUTH_SECRET` a real reader rather than a reserved row in `docs/ENV.md`.
 *
 * Read through `requireEnv` on every call rather than cached at module load, so
 * a deployment that forgot the variable fails naming it instead of quietly
 * hashing against `undefined`.
 */
export const hashSessionToken = (token: string): string =>
  createHmac(
    "sha256",
    requireEnv("AUTH_SECRET", "operator session tokens (@remi/services/auth)"),
  )
    .update(token)
    .digest("hex");
