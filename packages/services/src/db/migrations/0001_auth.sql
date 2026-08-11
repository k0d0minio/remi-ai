-- 0001_auth — the operator auth store (REMI-001).
--
-- The first migration in the repo's one chain. REMI-022's tooling inherits this
-- directory rather than starting a second one, so every statement here is
-- written to replay from an empty database: no dependency on an earlier table,
-- no extension that Neon does not have on by default (gen_random_uuid() is
-- core Postgres from 13 onwards), and IF NOT EXISTS nowhere — a migration that
-- silently no-ops is a migration that cannot be trusted to have run.

CREATE TABLE auth_user (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  email           text        NOT NULL,
  password_hash   text        NOT NULL,
  role            text        NOT NULL,
  status          text        NOT NULL DEFAULT 'active',
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),
  last_sign_in_at timestamptz,

  CONSTRAINT auth_user_role_check   CHECK (role IN ('operator')),
  CONSTRAINT auth_user_status_check CHECK (status IN ('active', 'suspended')),
  CONSTRAINT auth_user_email_check  CHECK (position('@' IN email) > 1)
);

-- Uniqueness on the folded value, not the column: addresses are compared
-- case-insensitively everywhere, so "Dana@…" and "dana@…" must not be two
-- operators. The adapter's ON CONFLICT names this same expression.
CREATE UNIQUE INDEX auth_user_email_key ON auth_user (lower(email));

CREATE TABLE auth_session (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid        NOT NULL REFERENCES auth_user (id) ON DELETE CASCADE,
  -- The HMAC of the token, never the token. A read-only leak of this table
  -- hands over nothing usable without AUTH_SECRET, which lives in Vercel.
  token_hash text        NOT NULL UNIQUE,
  expires_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  revoked_at timestamptz
);

-- Deleting an operator's sessions, and counting them, both go through the user.
CREATE INDEX auth_session_user_id_idx ON auth_session (user_id);

-- Every resolve reads by token_hash and filters on liveness; the partial index
-- keeps that lookup off the revoked rows, which only accumulate.
CREATE INDEX auth_session_live_idx
  ON auth_session (expires_at)
  WHERE revoked_at IS NULL;
