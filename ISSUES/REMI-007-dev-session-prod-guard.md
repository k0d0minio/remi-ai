# REMI-007 · Make the development session refuse to run in production

| | |
| --- | --- |
| **Type** | chore |
| **Priority** | P0 — the hard precondition before any real data can exist |
| **Size** | An hour |
| **Depends on** | — |
| **Blocked by** | — |
| **Sources** | audit F-32 ("the refuse-in-prod guard is an hour now"), D-3 |

## Problem statement

Anyone can "sign in" to the web app as either role by picking a radio button: the sign-in action
ignores its own email and password fields, a session is just the presence of a role cookie, and
the session seam **silently falls back** to this development provider when no real one is
registered. Harmless today because everything behind it is fixtures — but the day someone seeds
one real patient "just to test", the product is serving special-category health data to anyone
who clicks a radio button. The full auth replacement is REMI-023; this ticket is the cheap guard
that must exist *now*: the development session must refuse to run in a production build.

## Required steps

1. In `apps/web/lib/auth/session.ts`, replace the silent fallback: when no real provider is
   registered and the build is production, **throw** with an error naming the fix (matching the
   seam's loud-failure style in `packages/services`), instead of falling back.
2. Keep the development provider working in development and preview contexts where it is
   deliberate; be explicit about which env signal decides (and beware F-38: previews are
   production builds — decide and document whether previews keep the dev session).
3. Make the sign-in page render a clear "sign-in is not available yet" state instead of crashing,
   if the guard trips at request time.
4. Add a test for the guard logic if the harness (REMI-008) exists; otherwise structure it as a
   pure decision function so it is trivially testable later.

## Acceptance criteria

- [ ] A production build with no registered session provider cannot mint a session via the dev
      provider — verified by the guard's own logic, not by hoping.
- [ ] Development (`pnpm web:dev`) still signs in exactly as before.
- [ ] The chosen preview behaviour is written down in the code and PR.

## Agent prompt

```text
Work in the remi-ai monorepo. Read CLAUDE.md and CONVENTIONS.md, then docs/audit-report.md
finding F-32, then apps/web/lib/auth/session.ts, development-session.ts, and
apps/web/lib/actions/session.ts.

Task: make the development session provider refuse to serve in production.
1. In the session seam's resolution path (apps/web/lib/auth/session.ts, the silent fallback
   around lines 55-61), add a guard: if the build is a production build and no real provider is
   registered, throw an error naming the fix ("no session provider registered; the development
   session refuses to run in production") — mirror the loud-failure style of
   packages/services/src/db/client.ts.
2. Decide and document preview behaviour: previews are production builds; gate on an explicit
   signal (e.g. VERCEL_ENV) so previews can keep the dev session deliberately, and route any new
   env read through the services env module per the repo's env rules (three-list rule if you add
   a variable).
3. Ensure the sign-in page shows a clear "not available" state rather than an unhandled crash if
   the guard trips.
4. Extract the decision ("may the dev provider serve?") into a pure function and, if Vitest is
   set up in the repo, add tests covering production/development/preview cases.
Do not run build/lint/typecheck locally (factory-owned). Push a feature branch and open a PR.
```
