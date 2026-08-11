# REMI-001 · Gate admin and docs behind Neon-backed operator sign-in

|                |                                                                                          |
| -------------- | ---------------------------------------------------------------------------------------- |
| **Type**       | feature (infrastructure)                                                                 |
| **Priority**   | P0 — live exposure, close this week                                                      |
| **Size**       | A day or two — this is code, not a dashboard toggle                                      |
| **Depends on** | —                                                                                        |
| **Blocked by** | Neon account + project access; `DATABASE_URL` and `AUTH_SECRET` set in Vercel and locally |
| **Sources**    | audit F-30, F-31, F-32 (operator half), checklist item 1; supersedes decision D-1        |

## Problem statement

The admin console renders genuinely confidential business content (a live equity negotiation,
internal legal/strategy deliberations, unpublished pilot terms) statically to anyone with the URL.
The only in-repo protections (`apps/admin/app/robots.ts`, noindex metadata) stop search engines,
not people. Separately the docs site has **no** robots rules, no noindex, and publishes the pilot's
exact pricing plus a sentence describing the admin console's missing access gate — the worst middle
state: crawlable with no guidance.

The audit's interim answer was Vercel deployment protection. **That is no longer the plan.** It is
an unverifiable-from-the-repo dashboard setting on a paid plan, it makes preview deployments
awkward to share, and it postpones the real work rather than doing it. The owner's decision is to
build basic user authentication against Neon instead: an operator signs in with an email and a
password, the session lives in Postgres, and the gate is code in this repo that CI and a reviewer
can see.

This also settles two things that were floating. **D-1** (protect-or-publish, via Vercel) is
withdrawn — both apps get the in-app gate. **D-2** (database vendor) is answered *for the auth
store*: Neon, EU region, consistent with the decided data-residency posture. The general
`DatabaseClient` adapter and the query-layer migration stay in REMI-022; this ticket does not
pre-empt that work, it lands the connection and the migration chain that work will inherit.

## What this ticket is not

Scope discipline matters here — it is a P0 and it should ship in days.

- **No magic links, no patient/practitioner sign-in.** `apps/web`'s fake role picker stays fake;
  replacing it is REMI-023, which will build on the seam this ticket lands.
- **No general database adapter, no query migration.** `apps/web/lib/queries/*` still returns
  fixtures until REMI-022. Only the auth tables are real.
- **No self-service signup, no password reset, no MFA.** Operators are seeded by a script;
  a rotation is re-running it. Reset flows arrive with REMI-023.
- **No reliance on deployment protection.** If it happens to be on, it may stay as defence in
  depth or be turned off once the gate is live — either way it is no longer what carries the risk,
  and no acceptance criterion depends on it.

## Required steps

1. **Neon project.** Create it in an EU region (Frankfurt), take the *pooled* connection string,
   and set `DATABASE_URL` and a freshly generated `AUTH_SECRET` in Vercel for the **admin** and
   **docs** projects (all environments) and in local `.env`. Three edits in the same PR per the
   env rule: the zod entry in `packages/services/src/server/env.ts` (both already exist as
   optional — they now have readers), the `docs/ENV.md` rows, and `turbo.json` `globalEnv`. Delete
   the "no database vendor is committed yet" / "no auth vendor is committed yet" sentences in
   `docs/ENV.md` — they stop being true in this PR.

2. **The auth seam.** `apps/web/lib/auth/session.ts` says in its own comment that the session seam
   "moves to `packages/services` the moment `apps/admin` needs a session too". That moment is now.
   Add `packages/services/src/auth/`: the `SessionProvider` interface plus `registerAuthStore()`,
   exported as a new `@remi/services/auth` entrypoint (remember: `exports` in `package.json` **and**
   `entry` in `tsup.config.ts` must agree). It follows the same shape as storage/email/AI — an
   interface, a registration point, one adapter. Update the seam table in
   `packages/services/AGENTS.md`.

3. **The Neon adapter.** `packages/services/src/auth/adapters/neon.ts`, using
   `@neondatabase/serverless` as a dependency of **this package only**. Two tables, migration SQL
   under `packages/services/src/db/migrations/` so there is one chain for REMI-022's tooling to
   pick up, and it must replay cleanly from an empty database:
   - `auth_user` — id, email (unique, case-insensitive), password_hash, role, status, timestamps,
     last_sign_in_at.
   - `auth_session` — id, user_id, token_hash (unique), expires_at, created_at, revoked_at.

4. **Passwords and sessions, with no new crypto dependency.** `node:crypto` `scrypt` for hashing
   with a per-user salt and `timingSafeEqual` for comparison. A session token is 256 bits of
   `randomBytes`; what is stored is `HMAC-SHA256(token, AUTH_SECRET)` — the pepper is why a
   read-only leak of `auth_session` does not hand over live sessions, and it is what gives
   `AUTH_SECRET` a real reader rather than a dead config row. Cookie: `httpOnly`, `Secure`,
   `SameSite=Lax`, host-only (**not** parent-domain — preview deployments answer on
   `*.vercel.app` where a `.jamienisbet.com` cookie would never be sent; signing in twice across
   two internal apps is the right trade today. Revisit only if REMI-015 settles the domain and the
   double sign-in actually annoys someone). Eight-hour expiry, refreshed on use; sign-out revokes
   the row rather than only clearing the cookie.

5. **The gate in `apps/admin`.** Two layers, matching how `apps/web` already does it:
   - `middleware.ts` — cookie present or redirect to `/sign-in`. Cheap, no database, no
     authority. It exists so an unauthenticated request never reaches a page render.
   - `app/(admin)/layout.tsx` — the authoritative check: resolve the session through the seam,
     verify `role === "operator"` server-side, redirect if absent. One check in one layout; a
     route that forgets to check cannot exist because there is nowhere outside the group for it to
     live.

   Add `app/sign-in/page.tsx` (outside the group) with a real email + password form and a server
   action, built from `@remi/ui` primitives. One generic failure message for both wrong-email and
   wrong-password — no account-existence signal. Note and accept the consequence: reading cookies
   makes these pages dynamic, so the console stops being statically rendered HTML. That is the
   point.

6. **The gate in `apps/docs`.** The same middleware + sign-in page against the same `auth_user`
   table. This app has no design-system dependency by deliberate choice (`apps/docs/app/layout.tsx`
   explains why) — keep the sign-in page hand-styled and minimal rather than pulling `@remi/ui` in
   for one form. Add `apps/docs/app/robots.ts` modelled on admin's and noindex metadata in its root
   layout as well: the gate is the access control, robots is defence in depth, and the
   crawlable-with-no-guidance state closes either way.

7. **Seeding operators.** A script (`pnpm --filter @remi/services auth:create-operator`, or an
   equivalent documented one-liner) that takes an email and a password, hashes, and inserts. No
   passwords in the repo, in fixtures, or in the PR description. Document how to run it in
   `docs/ENV.md` or the admin app's `AGENTS.md`.

8. **Tests.** The services layer carries a definable contract, so tests land in the same PR:
   hashing round-trip, wrong-password rejection, token single-use/expiry/revocation, and the pure
   role-check logic. The harness proper is REMI-008 — if no runner exists yet, add the minimum
   Vitest setup needed for these and say so in the PR rather than shipping the auth layer untested.

9. **Tell the truth in the docs.** `apps/docs/app/technical/decisions/page.mdx` currently records
   "Vercel deployment protection now, real operator authentication in phase 3" and states the
   console has no access gate. Both sentences are false the moment this merges — rewrite that
   decision entry to record what was actually built and why the Vercel route was dropped.

## Acceptance criteria

- [ ] An unauthenticated request to any `apps/admin` route redirects to `/sign-in` and renders no
      confidential content — verified on the deployed preview, not only locally.
- [ ] The same is true for `apps/docs`.
- [ ] A seeded operator can sign in with email + password, reach the console, and sign out; the
      revoked session cookie no longer works.
- [ ] Roles are read from Neon server-side — never from a cookie value, a header, or any other
      client-writable input.
- [ ] Passwords are stored only as salted scrypt hashes; session tokens only as HMACs. Neither the
      raw token nor a password appears in any log.
- [ ] Migrations replay cleanly from an empty database.
- [ ] `DATABASE_URL` and `AUTH_SECRET` documented in `docs/ENV.md` with `turbo.json` and the zod
      schema in agreement; no secret committed.
- [ ] Tests cover hashing, token lifecycle, and the gate logic, and pass in CI.
- [ ] `apps/docs` carries robots + noindex regardless of the gate.
- [ ] The decisions page no longer claims the console is protected by Vercel or ungated.
- [ ] F-30 and F-31 can be marked mitigated; F-32's operator half is closed (the `apps/web` half
      remains open against REMI-023).

## Agent prompt

```text
Work in the remi-ai monorepo. Read CLAUDE.md and CONVENTIONS.md first, then
packages/services/AGENTS.md and apps/admin/AGENTS.md, then docs/audit-report.md findings F-30,
F-31 and F-32 in full.

Context and the one thing that changed: the audit and the decisions page both say the interim
answer for the admin console is Vercel deployment protection. The owner has rejected that. We are
building basic user authentication against Neon instead — email + password, sessions in Postgres,
the gate as code in this repo. Do not configure, verify, or depend on Vercel deployment
protection, and do not ask about decision D-1; it is withdrawn.

The exposure: apps/admin statically renders a live equity negotiation, internal legal and strategy
deliberations, and unpublished pilot terms to anyone with the URL. apps/docs publishes the pilot's
exact pricing and a sentence advertising that the console has no access gate, with no robots rules
and no noindex.

Scope — build exactly this, and stop:
1. Neon project in an EU region. Set DATABASE_URL (pooled string) and a generated AUTH_SECRET for
   the admin and docs Vercel projects. Both names already exist as optional entries in
   packages/services/src/server/env.ts; they now get real readers. Same-PR env rule: zod schema +
   docs/ENV.md row + turbo.json globalEnv. Remove the "no database vendor is committed yet" and
   "no auth vendor is committed yet" notes in docs/ENV.md.
2. New auth seam at packages/services/src/auth/ — the SessionProvider interface plus
   registerAuthStore(), exported as an @remi/services/auth entrypoint. Adding an entrypoint means
   editing package.json "exports" AND tsup.config.ts "entry"; they must agree. Model the shape on
   the existing seam in apps/web/lib/auth/session.ts, whose own comment says it moves into the
   package the moment apps/admin needs a session — that is now. Add the auth row to the seam table
   in packages/services/AGENTS.md.
3. Neon adapter at packages/services/src/auth/adapters/neon.ts using @neondatabase/serverless,
   a dependency of that package only. Tables: auth_user (id, email unique + case-insensitive,
   password_hash, role, status, timestamps, last_sign_in_at) and auth_session (id, user_id,
   token_hash unique, expires_at, created_at, revoked_at). Put the migration SQL under
   packages/services/src/db/migrations/ so REMI-022's tooling inherits one chain, and make sure it
   replays from an empty database.
4. Crypto with no new dependency: node:crypto scrypt + a per-user salt for passwords,
   timingSafeEqual for comparison; session tokens are 256 random bits, stored as
   HMAC-SHA256(token, AUTH_SECRET). Cookie httpOnly + Secure + SameSite=Lax + host-only (NOT
   parent-domain: previews answer on *.vercel.app). Eight-hour expiry refreshed on use; sign-out
   revokes the row, not just the cookie.
5. Gate apps/admin: middleware.ts does the cheap cookie-or-redirect, and app/(admin)/layout.tsx
   does the authoritative session + operator-role check, exactly as apps/web resolves its session
   once in app/[locale]/(app)/layout.tsx. Add app/sign-in/page.tsx outside the group with an
   email + password form and a server action, built from @remi/ui primitives. One generic failure
   message for every failure mode — never reveal whether an email exists. Expect these pages to
   become dynamic; that is intended.
6. Gate apps/docs the same way against the same table, but keep its sign-in page hand-styled —
   next.config.ts keeps that app off the design system on purpose. Also add apps/docs/app/robots.ts
   modelled on apps/admin/app/robots.ts and noindex metadata in its root layout.
7. A seed script that creates an operator from an email and a password. No password in the repo,
   in fixtures, or in the PR description; document how to run it.
8. Vitest tests in the same PR: hashing round-trip, wrong-password rejection, token single-use,
   expiry, revocation, and the pure role-check helper. If no runner exists yet (REMI-008), add the
   minimum setup and say so in the PR.
9. Rewrite the "Admin console: Vercel deployment protection now" entry in
   apps/docs/app/technical/decisions/page.mdx to record what was actually built. Leaving it saying
   the console is ungated would be a false statement on a now-gated site.

Out of scope — do not do these, they are other tickets: magic links or any change to apps/web's
sign-in (REMI-023); the general DatabaseClient adapter or migrating apps/web/lib/queries off
fixtures (REMI-022); password reset, MFA, self-service signup; removing the confidential content
itself (REMI-002 — this ticket makes it unreachable, that one deletes it).

Roles must be established server-side from the database on every request. A role in a cookie, a
header, or any other client-writable place is the exact defect v1 shipped (v1-report §8.2) and is
a review blocker here.

Do not run build/lint/typecheck locally — the factory owns them and a hook blocks them. Run tests,
then commit on a feature branch, push, and open a PR that states what is now gated, what remains
open (apps/web's session), and confirms no secret was committed.
```
