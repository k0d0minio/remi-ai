# REMI-023 · Real authentication: magic links through the session seam

|                |                                                                                                                                                                                                                          |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Type**       | feature (infrastructure)                                                                                                                                                                                                 |
| **Priority**   | P1 — the hard precondition for any real personal data                                                                                                                                                                    |
| **Size**       | A week or more; can overlap REMI-022                                                                                                                                                                                     |
| **Depends on** | REMI-001 (the auth seam, the Neon adapter and the operator gate this extends), REMI-007 (prod guard), REMI-018 (session entity), REMI-004 (email adapter, for link delivery), REMI-022 (persistence for sessions/tokens) |
| **Blocked by** | Nothing external — REMI-001 answered D-3 by building it: hand-rolled against Neon, no auth vendor. This ticket adds the magic-link flow to that seam                                                                     |
| **Sources**    | audit F-32, D-3, checklist item 9; v1-report §9.2 (anti-enumeration reset behaviour worth keeping)                                                                                                                       |

## Problem statement

REMI-001 gave the operator surfaces a real gate — email + password against Neon, through a seam in
`@remi/services/auth`. The product surface is still fake: `apps/web`'s sign-in ignores its own
email and password fields and a role radio button is the whole login. The gate itself is correctly
shaped (one check in one layout, a clean provider seam), and magic links are already decided in
principle for patients and practitioners. Until a real session provider replaces the development
one here too, no real personal data may enter the system in any form.

## Required steps

1. Extend REMI-001's `@remi/services/auth` seam and its Neon adapter rather than introducing a
   second auth mechanism; the `auth_user` / `auth_session` tables are the starting schema and
   v1's proven flows inform the shape.
2. Implement the magic-link flow: request → signed single-use token (REMI-018's session entity)
   → email via the seam (REMI-004's adapter) → verification → session establishment, with
   expiry and rotation.
3. Anti-enumeration behaviour throughout (always answer success on the request form — v1 got
   this right; keep it).
4. Register the real provider into `apps/web`'s session seam; the development provider remains
   dev-only (REMI-007's guard now has a real counterpart).
5. Fold REMI-001's operator sign-in into the unified provider so there is one session mechanism,
   not two — operators keep password sign-in, patients and practitioners get magic links. Role
   stays server-verified, never client-supplied metadata (v1 §8.2's spoofable fallback is the
   anti-pattern).
6. Session lifecycle: sign-out, expiry, and the audit-trail hook (sign-ins are auditable events).
7. Tests on token generation/verification and the gate logic.

## Acceptance criteria

- [ ] A user can sign in via an emailed magic link and reach the app; nobody can via the role
      radio button in production.
- [ ] Admin still requires an operator sign-in, now through the same provider as the web app.
- [ ] The request endpoint leaks no account-existence signal.
- [ ] Tokens are single-use and expiring, covered by tests.

## Agent prompt

```text
Work in the remi-ai monorepo. The implementation is settled: extend the hand-rolled auth REMI-001
built against Neon (packages/services/src/auth/ — the seam, the Neon adapter, the auth_user and
auth_session tables). Do not introduce an auth vendor. Read CLAUDE.md, CONVENTIONS.md, then
.icm/docs/audit-report.md finding F-32, .icm/docs/v1-report.md §9.2's auth note and §8.1, §8.2
(the IDOR and spoofable-admin defects that must not recur), and the existing seams:
packages/services/src/auth/, apps/web/lib/auth/session.ts, development-session.ts,
apps/web/lib/actions/session.ts, and the gate at apps/web/app/[locale]/(app)/layout.tsx.

Task: replace the development session with real magic-link authentication.
1. Implement the provider behind the existing session seam — the gate stays one check in one
   layout. Magic-link flow: request form (email only) → single-use expiring token persisted via
   the seam → email through the @remi/services email adapter → verify route → session. Always
   answer the request form with success (no account enumeration).
2. Establish roles server-side from the database (practitioner / person / operator per the
   CareRelationship model) — never from client-writable metadata.
3. Fold REMI-001's operator sign-in into this provider so one session mechanism serves all three
   roles; apps/admin keeps its operator-only layout check and must not regress while you do it.
4. Emit audit-trail entries (REMI-018's entity) for sign-in events.
5. Replace the sign-in form's fake role picker with the real email form (both languages, design
   system components); keep the dev provider available in development only.
6. Vitest tests: token single-use, expiry, verification, and the pure gate logic.
Run tests; push feature branches and open PRs. Never test with real personal data.
```
