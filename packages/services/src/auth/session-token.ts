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

/**
 * How long one admin open of another practitioner's file holds (story 3,
 * question 3): four hours. After it, the console asks for a reason again.
 */
export const ADMIN_OPEN_TTL_SECONDS = 60 * 60 * 4;

type OpenGrantPayload = {
  /** The admin's operator id. */
  sub: Id;
  /** The patient file the admin opened. */
  pid: Id;
  exp: number;
};

/**
 * The grant signs under its own label, so a grant never verifies as a session
 * token, and a session token never verifies as a grant.
 */
const signGrant = (payload: string) => sign(`open-grant.${payload}`);

/** The value of the cookie that records one admin open, after the reason. */
export const createOpenGrantToken = (
  operatorId: Id,
  patientId: Id,
  ttlSeconds: number = ADMIN_OPEN_TTL_SECONDS,
): string => {
  const payload = encode({
    sub: operatorId,
    pid: patientId,
    exp: Math.floor(Date.now() / 1000) + ttlSeconds,
  } satisfies OpenGrantPayload);
  return `${payload}.${signGrant(payload)}`;
};

/**
 * The opened file's id, when the grant is this operator's and still holds.
 * Null for anything expired, tampered with, malformed or of another operator.
 */
export const verifyOpenGrantToken = (
  token: string,
  operatorId: Id,
): Id | null => {
  const [payload, signature] = token.split(".");
  if (!payload || !signature) {
    return null;
  }
  const expected = Buffer.from(signGrant(payload));
  const given = Buffer.from(signature);
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) {
    return null;
  }
  try {
    const parsed: unknown = JSON.parse(
      Buffer.from(payload, "base64url").toString(),
    );
    if (typeof parsed !== "object" || parsed === null) {
      return null;
    }
    const { sub, pid, exp } = parsed as Partial<OpenGrantPayload>;
    if (
      typeof sub !== "string" ||
      typeof pid !== "string" ||
      typeof exp !== "number"
    ) {
      return null;
    }
    return sub === operatorId && exp * 1000 > Date.now() ? pid : null;
  } catch {
    return null;
  }
};
