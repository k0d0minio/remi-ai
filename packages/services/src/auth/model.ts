import type { Actor, Id } from "../types";

/**
 * The roles the auth store recognises. Only `operator` is granted today —
 * practitioner and person sign-in stays on `apps/web`'s development seam until
 * REMI-023 replaces it — but the column is free text in Postgres and checked
 * here, so adding one is a value, not a migration.
 */
export const AUTH_ROLES = ["operator"] as const;
export type AuthRole = (typeof AUTH_ROLES)[number];

export const AUTH_USER_STATUSES = ["active", "suspended"] as const;
export type AuthUserStatus = (typeof AUTH_USER_STATUSES)[number];

export const isAuthRole = (value: unknown): value is AuthRole =>
  typeof value === "string" &&
  (AUTH_ROLES as readonly string[]).includes(value);

export const isAuthUserStatus = (value: unknown): value is AuthUserStatus =>
  typeof value === "string" &&
  (AUTH_USER_STATUSES as readonly string[]).includes(value);

/**
 * A row of `auth_user`. `passwordHash` is on this type because the store hands
 * the whole row to the sign-in path, which is the only caller that reads it —
 * `Session` below is what leaves this module, and it carries no hash.
 */
export type AuthUser = {
  id: Id;
  email: string;
  passwordHash: string;
  role: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  lastSignInAt: Date | null;
};

/** A row of `auth_session`. The raw token is never part of it — only its HMAC. */
export type SessionRecord = {
  id: Id;
  userId: Id;
  tokenHash: string;
  expiresAt: Date;
  createdAt: Date;
  revokedAt: Date | null;
};

/**
 * What a gated layout gets back. `role` and `status` are copied from the row the
 * store just read, so they are established from the database on every request —
 * never from the cookie, which carries an opaque token and nothing else.
 */
export type Session = {
  id: Id;
  actor: Actor;
  role: string;
  status: string;
  expiresAt: Date;
};

/**
 * The whole authorisation rule for the two internal consoles, kept pure so it is
 * testable without a database and readable without one either: a session grants
 * the console only while the row that backs it still says operator and active.
 * Suspending an operator therefore takes effect on their next request rather
 * than at their next sign-in.
 */
export const isOperator = (session: Session | null): boolean =>
  session !== null &&
  session.role === "operator" &&
  session.status === "active";
