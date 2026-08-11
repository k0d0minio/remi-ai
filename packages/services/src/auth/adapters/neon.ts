import { neon } from "@neondatabase/serverless";
import { requireEnv } from "../../server/env";
import type { AuthUser, SessionRecord } from "../model";
import type { AuthStore, NewAuthUser, NewSession } from "../store";
import { registerAuthStore } from "../store";

/**
 * The auth store on Neon — serverless Postgres, EU region.
 *
 * It uses the HTTP driver rather than a pooled TCP client on purpose: every call
 * on this path is a single statement made from a short-lived serverless
 * function, where a connection pool is a lifecycle to manage rather than a
 * saving. The pooled connection string is still the right one to configure — it
 * is what the HTTP endpoint fronts — and when REMI-022 lands the general
 * `DatabaseClient` this adapter folds onto that shared connection.
 *
 * This file is the only place in the repo that names a database vendor.
 */

type Row = Record<string, unknown>;

/**
 * The driver parses `timestamptz` for us on most paths, but not on every one, so
 * both shapes are accepted. Silently returning an Invalid Date would turn an
 * expired session into a live one, so a value that is neither is a bug worth a
 * throw.
 */
const toDate = (value: unknown): Date => {
  const date = value instanceof Date ? value : new Date(String(value));
  if (Number.isNaN(date.getTime())) {
    throw new Error(
      `auth store returned an unreadable timestamp: ${String(value)}`,
    );
  }
  return date;
};

const toNullableDate = (value: unknown): Date | null =>
  value === null || value === undefined ? null : toDate(value);

const toUser = (row: Row): AuthUser => ({
  id: String(row.id),
  email: String(row.email),
  passwordHash: String(row.password_hash),
  role: String(row.role),
  status: String(row.status),
  createdAt: toDate(row.created_at),
  updatedAt: toDate(row.updated_at),
  lastSignInAt: toNullableDate(row.last_sign_in_at),
});

const toSessionRecord = (row: Row): SessionRecord => ({
  id: String(row.id),
  userId: String(row.user_id),
  tokenHash: String(row.token_hash),
  expiresAt: toDate(row.expires_at),
  createdAt: toDate(row.created_at),
  revokedAt: toNullableDate(row.revoked_at),
});

/**
 * Resolved on first use rather than at import, so importing this module in a
 * build step — or in a runtime that never signs anyone in — does not demand a
 * connection string that path has no need for.
 */
let sql: ReturnType<typeof neon> | null = null;

const connection = () => {
  if (!sql) {
    sql = neon(
      requireEnv("DATABASE_URL", "the Neon auth store (@remi/services/auth)"),
    );
  }
  return sql;
};

export const neonAuthStore: AuthStore = {
  driver: "neon",

  findUserByEmail: async (email: string) => {
    const db = connection();
    const rows = (await db`
      SELECT * FROM auth_user WHERE lower(email) = lower(${email}) LIMIT 1
    `) as Row[];
    return rows[0] ? toUser(rows[0]) : null;
  },

  upsertUser: async (user: NewAuthUser) => {
    const db = connection();
    /*
     * The conflict target is the expression the unique index is built on, not
     * the column — `auth_user_email_key` is `UNIQUE (lower(email))`, so naming
     * `email` here would not match it and the insert would raise instead of
     * updating. Re-running the seed is how an operator's password is rotated.
     */
    const rows = (await db`
      INSERT INTO auth_user (email, password_hash, role, status)
      VALUES (${user.email}, ${user.passwordHash}, ${user.role}, ${user.status})
      ON CONFLICT (lower(email)) DO UPDATE
        SET password_hash = EXCLUDED.password_hash,
            role          = EXCLUDED.role,
            status        = EXCLUDED.status,
            updated_at    = now()
      RETURNING *
    `) as Row[];
    return toUser(rows[0]);
  },

  markSignedIn: async (id: string, at: Date) => {
    const db = connection();
    await db`
      UPDATE auth_user
         SET last_sign_in_at = ${at.toISOString()}, updated_at = now()
       WHERE id = ${id}::uuid
    `;
  },

  createSession: async (session: NewSession) => {
    const db = connection();
    const rows = (await db`
      INSERT INTO auth_session (user_id, token_hash, expires_at)
      VALUES (${session.userId}::uuid, ${session.tokenHash}, ${session.expiresAt.toISOString()})
      RETURNING *
    `) as Row[];
    return toSessionRecord(rows[0]);
  },

  findLiveSession: async (tokenHash: string, now: Date) => {
    const db = connection();
    /*
     * Liveness is decided in SQL, not in JavaScript: an expired or revoked row
     * must never reach the caller in a shape that could be mistaken for a
     * session. The user columns are aliased so one round trip answers both
     * "is this token good" and "what is this person allowed to do".
     */
    const rows = (await db`
      SELECT s.id, s.user_id, s.token_hash, s.expires_at, s.created_at, s.revoked_at,
             u.id   AS u_id,   u.email  AS u_email,  u.password_hash AS u_password_hash,
             u.role AS u_role, u.status AS u_status,
             u.created_at AS u_created_at, u.updated_at AS u_updated_at,
             u.last_sign_in_at AS u_last_sign_in_at
        FROM auth_session s
        JOIN auth_user u ON u.id = s.user_id
       WHERE s.token_hash = ${tokenHash}
         AND s.revoked_at IS NULL
         AND s.expires_at > ${now.toISOString()}
       LIMIT 1
    `) as Row[];

    const row = rows[0];
    if (!row) {
      return null;
    }

    return {
      session: toSessionRecord(row),
      user: toUser({
        id: row.u_id,
        email: row.u_email,
        password_hash: row.u_password_hash,
        role: row.u_role,
        status: row.u_status,
        created_at: row.u_created_at,
        updated_at: row.u_updated_at,
        last_sign_in_at: row.u_last_sign_in_at,
      }),
    };
  },

  touchSession: async (id: string, expiresAt: Date) => {
    const db = connection();
    await db`
      UPDATE auth_session
         SET expires_at = ${expiresAt.toISOString()}
       WHERE id = ${id}::uuid AND revoked_at IS NULL
    `;
  },

  revokeSession: async (tokenHash: string, at: Date) => {
    const db = connection();
    await db`
      UPDATE auth_session
         SET revoked_at = ${at.toISOString()}
       WHERE token_hash = ${tokenHash} AND revoked_at IS NULL
    `;
  },
};

/** What an app's `instrumentation.ts` calls, so the app never names the vendor twice. */
export const registerNeonAuthStore = () => registerAuthStore(neonAuthStore);
