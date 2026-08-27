import { createHmac, timingSafeEqual } from "node:crypto";
import { requireEnv } from "../server/env";
import type { Id } from "../types";

/**
 * Stateless session tokens for the operator console: an HMAC-signed payload,
 * keyed by `AUTH_SECRET`. No session table and no revocation list — at one
 * operator, rotating `AUTH_SECRET` is revocation. The app owns the cookie;
 * this module only mints and checks the value inside it.
 */

export const SESSION_TTL_SECONDS = 60 * 60 * 24 * 30;

type SessionPayload = {
  /** The operator's id. */
  sub: Id;
  /** Unix seconds after which the token is dead. */
  exp: number;
};

const encode = (value: object) =>
  Buffer.from(JSON.stringify(value)).toString("base64url");

const sign = (payload: string) =>
  createHmac("sha256", requireEnv("AUTH_SECRET", "session tokens"))
    .update(payload)
    .digest("base64url");

export const createSessionToken = (
  operatorId: Id,
  ttlSeconds: number = SESSION_TTL_SECONDS,
): string => {
  const payload = encode({
    sub: operatorId,
    exp: Math.floor(Date.now() / 1000) + ttlSeconds,
  } satisfies SessionPayload);
  return `${payload}.${sign(payload)}`;
};

/** The operator id, or null for anything expired, tampered with, or malformed. */
export const verifySessionToken = (token: string): Id | null => {
  const [payload, signature] = token.split(".");
  if (!payload || !signature) {
    return null;
  }

  const expected = Buffer.from(sign(payload));
  const given = Buffer.from(signature);
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) {
    return null;
  }

  try {
    const parsed: unknown = JSON.parse(
      Buffer.from(payload, "base64url").toString(),
    );
    if (
      typeof parsed !== "object" ||
      parsed === null ||
      typeof (parsed as SessionPayload).sub !== "string" ||
      typeof (parsed as SessionPayload).exp !== "number"
    ) {
      return null;
    }
    const { sub, exp } = parsed as SessionPayload;
    return exp * 1000 > Date.now() ? sub : null;
  } catch {
    return null;
  }
};
