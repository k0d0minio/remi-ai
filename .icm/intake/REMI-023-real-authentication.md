# REMI-023 · Real authentication: magic links through the session seam

|                |                                                                                                                                           |
| -------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| **Type**       | feature (infrastructure)                                                                                                                  |
| **Priority**   | P1 — the hard precondition for any real personal data                                                                                     |
| **Size**       | A week or more; can overlap REMI-022                                                                                                      |
| **Depends on** | REMI-007 (prod guard), REMI-018 (session entity), REMI-004 (email adapter, for link delivery), REMI-022 (persistence for sessions/tokens) |
| **Blocked by** | Owner decision D-3 (implementation: Auth.js vs hosted vs the DB vendor's auth — decide together with D-2)                                 |
| **Sources**    | audit F-32, D-3, checklist item 9; v1-report §9.2 (anti-enumeration reset behaviour worth keeping)                                        |

## Problem statement

No real authentication exists anywhere. The web app's sign-in ignores its own email and password
fields — a role radio button is the whole login — and the admin app has nothing at all. The gate
itself is correctly shaped (one check in one layout, a clean provider seam waiting), and magic
links are already decided in principle. Until a real session provider replaces the development
one, no real personal data may enter the system in any form.

## Required steps

1. Get D-3 decided (with D-2 — if the database landed on Supabase, its auth is the natural
   answer; v1's proven flows inform the shape).
2. Implement the magic-link flow: request → signed single-use token (REMI-018's session entity)
   → email via the seam (REMI-004's adapter) → verification → session establishment, with
   expiry and rotation.
3. Anti-enumeration behaviour throughout (always answer success on the request form — v1 got
   this right; keep it).
4. Register the real provider into `apps/web`'s session seam; the development provider remains
   dev-only (REMI-007's guard now has a real counterpart).
5. Operator access for `apps/admin` — the same provider with an operator role check, replacing
   reliance on deployment protection alone. Role must be server-verified, never client-supplied
   metadata (v1 §8.2's spoofable fallback is the anti-pattern).
6. Session lifecycle: sign-out, expiry, and the audit-trail hook (sign-ins are auditable events).
7. Tests on token generation/verification and the gate logic.

## Acceptance criteria

- [ ] A user can sign in via an emailed magic link and reach the app; nobody can via the role
      radio button in production.
- [ ] Admin requires an operator sign-in inside the app, not just Vercel's wall.
- [ ] The request endpoint leaks no account-existence signal.
- [ ] Tokens are single-use and expiring, covered by tests.

## Agent prompt

```text
Work in the remi-ai monorepo. Do not start unless decision D-3 (auth implementation) is
confirmed — if unconfirmed, stop and ask. Read CLAUDE.md, CONVENTIONS.md, then
docs/audit-report.md finding F-32 and decision D-3, docs/v1-report.md §9.2's auth note and §8.1,
§8.2 (the IDOR and spoofable-admin defects that must not recur), and the existing seam:
apps/web/lib/auth/session.ts, development-session.ts, apps/web/lib/actions/session.ts, and the
gate at apps/web/app/[locale]/(app)/layout.tsx.

Task: replace the development session with real magic-link authentication.
1. Implement the decided provider behind the existing session seam — the gate stays one check in
   one layout. Magic-link flow: request form (email only) → single-use expiring token persisted
   via the db seam → email through the @remi/services email adapter → verify route → session.
   Always answer the request form with success (no account enumeration).
2. Establish roles server-side from the database (practitioner / person / operator per the
   CareRelationship model) — never from client-writable metadata.
3. Wire apps/admin to the same provider with an operator-only check in its root layout; admin
   keeps deployment protection as defence in depth, but in-app auth is now the access control.
4. Emit audit-trail entries (REMI-018's entity) for sign-in events.
5. Replace the sign-in form's fake role picker with the real email form (both languages, design
   system components); keep the dev provider available in development only.
6. Vitest tests: token single-use, expiry, verification, and the pure gate logic.
Run tests; push feature branches and open PRs. Never test with real personal data.
```
