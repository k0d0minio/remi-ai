# REMI-001 · Gate the admin console behind Neon-backed operator sign-in

| | |
| --- | --- |
| **Type** | feature (infrastructure) |
| **Priority** | P0 — live exposure, close this week |
| **Size** | Days — this is code, not a hosting toggle |
| **Depends on** | — |
| **Blocked by** | A Neon account and project (EU region); `DATABASE_URL` + `AUTH_SECRET` set in Vercel for the admin project |
| **Sources** | audit F-30, F-31, F-32, checklist item 1, D-1, D-2; info-gathering REQ-08 |

## Problem statement

The admin console renders genuinely confidential business content (a live equity negotiation,
internal legal/strategy deliberations, unpublished pilot terms) statically to anyone with the
URL. The only in-repo protections (`apps/admin/app/robots.ts`, noindex metadata) stop search
engines, not people.

The decision log named **Vercel deployment protection** as the interim answer. That is no longer
the plan. A deployment wall is a shared password in front of a site, not an identity: it cannot
say which operator read the equity offer, cannot revoke one person without rotating everyone,
leaks the moment a protected preview URL is forwarded, and leaves the console's own access-control
story permanently outsourced to a hosting setting nobody can verify from the repo. The console
handles the founder's negotiating position — it needs to know *who* is looking.

So this ticket lands the real thing, at the smallest honest size: **operator sign-in with email
and password, checked against a users table in Neon Postgres**, enforced in
`apps/admin/app/(admin)/layout.tsx` — the file whose own comment already reserves the spot ("the
session check that will sit beside it"). Every admin route lives inside that group, so a route
that forgets to check cannot exist.

Two deliberate boundaries:

- **Passwords now, magic links later.** The decided long-term shape is magic links (REMI-023), but
  those need the email adapter from REMI-004. A live exposure should not wait on an email vendor.
  The provider goes behind a `SessionProvider`-shaped seam so REMI-023 swaps the mechanism without
  touching a single caller.
- **A thin Neon connection, not the database seam.** This ticket opens the Neon project and
  creates only what auth needs (two tables, one migration, one connection). REMI-022 still does the
  full `packages/services` adapter, migrations tooling and query-module migration. What this ticket
  *does* settle is **D-2: the database vendor is Neon** — record that in the decisions page.

Separately, the docs site has **no** robots rules, no noindex, and publishes the pilot's exact
pricing plus a sentence describing the admin console's missing access gate — the worst middle
state: crawlable with no guidance. The safe, reversible interim (robots + noindex) ships in this
ticket; whether docs is ultimately public or private stays open as **D-1b**.

## Required steps

1. **Neon project** in an EU region, consistent with the decided data posture. Take the *pooled*
   connection string. Put `DATABASE_URL` and a freshly generated `AUTH_SECRET` into Vercel for the
   admin project (all environments) and into local `.env`. Follow the three-list rule in the same
   PR: the rows in `docs/ENV.md` (both already reserved), the zod entries in
   `packages/services/src/server/env.ts`, and `globalEnv` in `turbo.json`.
2. **Schema**, as a checked-in SQL migration that replays from an empty database:
   - `operators` — id, email (unique, case-insensitive), `password_hash`, name, `disabled_at`,
     `created_at`, `last_sign_in_at`.
   - `operator_sessions` — id, `operator_id`, `token_hash`, `expires_at`, `created_at`,
     `revoked_at`.
   - `operator_sign_in_events` — operator (nullable, so failures are recorded too), outcome,
     timestamp, user agent, coarse IP. This is the audit trail F-30 asks for.
3. **The seam.** `apps/admin/lib/auth/session.ts` mirroring `apps/web/lib/auth/session.ts`: a
   `SessionProvider` interface plus a registration point, with the Neon-backed provider registered
   at process start. No silent fallback to a development provider — admin either has a provider or
   refuses to serve.
4. **Password verification** with a memory-hard hash — argon2id preferred, bcrypt at cost ≥ 12
   acceptable. Never a fast hash. Compare in constant time.
5. **Sessions.** An opaque random token in the cookie, stored *hashed* in Neon — not a JWT
   carrying claims. Cookie: `httpOnly`, `Secure`, `SameSite=Lax`, `__Host-` prefix, fixed expiry
   (8 hours is a reasonable operator default). Sign-out deletes the row server-side, so revocation
   is real.
6. **The gate.** One check in `apps/admin/app/(admin)/layout.tsx`; no session redirects to a
   `/sign-in` route that lives *outside* the group. Verify by requesting a deep URL
   (`/practitioners/<id>`, `/offer`) while signed out — it must not render.
7. **The sign-in page.** Email + password, design-system components only. One generic failure
   message for both wrong-email and wrong-password (no account enumeration). Rate-limit repeated
   failures per email and per IP, with a lockout window.
8. **Operator provisioning — no public sign-up.** A script (`pnpm --filter admin operator:create`)
   that hashes a password and inserts one row, plus a short runbook note on how the owner creates
   the first operator and adds the second. Never commit a password or a hash.
9. **Docs safe interim (F-31).** Give `apps/docs` a `robots.ts` modelled on
   `apps/admin/app/robots.ts` and noindex robots metadata in `apps/docs/app/layout.tsx`. Reversible
   if D-1b later lands on "public". Put D-1b to the owner as an open question in the PR.
10. **Do not treat Vercel deployment protection as the control.** Leaving it on as defence in depth
    is fine and free; the ticket is not done because of it, and the PR must state plainly that
    in-app auth is now the access control.
11. **Tests.** The test harness does not exist until REMI-008, so write the auth logic as pure,
    exported functions — password verify, token issue/verify, expiry, and the gate decision — ready
    for a runner, and say explicitly in the PR that they are untested pending REMI-008 rather than
    standing up a parallel harness here.

## Acceptance criteria

- [ ] Every route under `apps/admin/app/(admin)/` is unreachable signed out, verified against a
      deep URL, not just the index.
- [ ] Credentials are per-operator rows in Neon; passwords hashed with argon2id or bcrypt ≥ 12;
      no shared password exists anywhere in the system.
- [ ] The session cookie is `httpOnly` + `Secure` + `SameSite` + `__Host-`, carries an opaque
      token, and sign-out revokes it server-side.
- [ ] Sign-in reveals no account-existence signal and is rate-limited against repeated failure.
- [ ] Sign-in attempts — successes and failures — are recorded and readable.
- [ ] The migration replays cleanly from an empty database.
- [ ] `DATABASE_URL` and `AUTH_SECRET` appear in `docs/ENV.md`, `env.ts` and `turbo.json`; no
      secret is committed.
- [ ] `apps/docs` has `robots.ts` + noindex; D-1b is recorded as an open question.
- [ ] D-2 is recorded as **Neon** in `apps/docs/app/technical/decisions/`.
- [ ] F-30 is mitigated by access control rather than by a hosting toggle; F-31 is mitigated.

## Agent prompt

```text
Work in the remi-ai monorepo. Read CLAUDE.md and CONVENTIONS.md first, then read
docs/audit-report.md findings F-30, F-31 and F-32 and decisions D-1 and D-2 in full.

Context: apps/admin statically renders confidential content (a live equity negotiation, internal
legal deliberations, unpublished pilot terms) with no access control. The repo's decision log
names Vercel deployment protection as the interim answer — that has been overruled by the owner.
A shared deployment password has no identity, no per-person revocation and no audit trail, and
this console needs all three. The database vendor decision (D-2) is settled: Neon.

Your task: gate apps/admin behind real operator sign-in — email and password against a users
table in Neon Postgres — and leave the mechanism swappable, because REMI-023 will later replace
passwords with magic links behind the same seam.

Scope boundaries, respect them:
- apps/admin only. Do not touch apps/web's development session; REMI-023 owns that.
- A thin Neon connection for auth only. Do NOT build the packages/services database adapter,
  migrations tooling or query migration — REMI-022 owns those. Two tables and one migration here.
- Passwords, not magic links. Magic links need the email adapter (REMI-004) and this exposure
  cannot wait on an email vendor.

Steps:
1. Env: DATABASE_URL (Neon pooled, EU region) and AUTH_SECRET. Three edits in one PR — the rows
   in docs/ENV.md (both are already reserved there), the zod entries in
   packages/services/src/server/env.ts, and globalEnv in turbo.json. Never commit a value.
2. Schema, as a checked-in SQL migration that replays from empty: `operators` (id, unique
   case-insensitive email, password_hash, name, disabled_at, created_at, last_sign_in_at),
   `operator_sessions` (id, operator_id, token_hash, expires_at, created_at, revoked_at), and
   `operator_sign_in_events` (nullable operator, outcome, timestamp, user agent, coarse IP).
3. Seam: create apps/admin/lib/auth/session.ts modelled on apps/web/lib/auth/session.ts — a
   SessionProvider interface plus a registration point — and register the Neon-backed provider at
   process start. Unlike web, there is no development fallback: no provider means admin refuses to
   serve.
4. Credentials: argon2id (or bcrypt at cost >= 12), constant-time comparison. Sessions are opaque
   random tokens stored hashed in the database, never JWT claims in the cookie. Cookie is
   httpOnly + Secure + SameSite=Lax with the __Host- prefix and an 8-hour expiry; sign-out deletes
   the session row.
5. Gate: one check in apps/admin/app/(admin)/layout.tsx — its own comment already reserves the
   spot. No session redirects to a /sign-in route outside the group. Prove it by requesting
   /practitioners/<id> and /offer signed out.
6. Sign-in page: email + password using @remi/ui components only. One generic failure message for
   every failure mode (no account enumeration). Rate-limit repeated failures per email and per IP.
7. Provisioning: no public sign-up. Add a `pnpm --filter admin operator:create` script that hashes
   a password and inserts one operator, and document how the owner creates the first one.
8. Also close F-31: give apps/docs a robots.ts modelled on apps/admin/app/robots.ts and noindex
   robots metadata in apps/docs/app/layout.tsx. This is the reversible safe interim — record
   "docs public or private?" (D-1b) as an open question for the owner rather than deciding it.
9. Record D-2 as Neon in apps/docs/app/technical/decisions/, and update any text that still calls
   Vercel deployment protection the access control for admin.
10. There is no test runner until REMI-008. Keep password verification, token issue/verify/expiry
    and the gate decision as pure exported functions ready for one, and say in the PR that they
    are untested pending REMI-008. Do not stand up a parallel harness.

Do not run build/lint/typecheck locally — the factory owns them; push and read the PR's checks.
Never test with real personal data. Open a PR that states plainly that in-app authentication is
now the access control for admin, what you verified signed out, and what remains for the owner
(Neon project creation if you could not do it, the first operator's credentials, D-1b).
```
