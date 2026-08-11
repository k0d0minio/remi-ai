# apps/admin — app rules (Layer 3 delta)

The global rules in [`/CONVENTIONS.md`](../../CONVENTIONS.md) still apply. This file holds only
what is specific to this app.

## What this app is

Internal operations: configuration, support tooling, data inspection, anything an operator needs
and a customer must never reach. It is a **separate deployment** from `apps/web` on purpose — its
own URL, its own environment variables, its own access control. A `/admin` route group inside the
product app would put every operator capability one routing mistake away from a customer.

## The boundary is the whole point

- Every route is operator-only. There is no public page in this app, no "just this one" exception,
  and no unauthenticated preview of admin data.
- **The gate is two layers, and only one of them has authority.** `middleware.ts` checks that the
  session cookie exists and redirects to `/sign-in` if it does not — cheap, no database, no
  authority, because a cookie's presence proves nothing about who holds it. `app/(admin)/layout.tsx`
  is the real check: it exchanges the token for a row in Neon and reads the role off that row.
  **A role must never come from a cookie, a header, or anything else the client can write.** Adding
  a route outside the `(admin)` group is how that guarantee gets lost; `/sign-in` is the single
  exemption and it renders no console data.
- Destructive operations — delete, impersonate, override, bulk-edit — confirm before acting and
  record who did what. An admin action with no trace is how an incident becomes unexplainable.
- Admin never reaches around `@remi/services/server` to a driver directly. If an operator needs a
  query the service layer does not expose, add it to the service with the permission check on it,
  where the product app benefits from the same guard.

## Structure

```text
app/
  (admin)/    every route — the group carries the operator boundary
  sign-in/    the one route outside it, and the only thing the gate can redirect to
components/   composition only, grouped by capability
lib/          queries, actions, types — lib/auth/ resolves the session per request
middleware.ts        the cheap cookie-or-redirect
instrumentation.ts   registers the Neon auth store at process start
```

## Getting in

The console has no signup and no password reset — an operator is seeded, and re-running the seed is
how a password is rotated. `DATABASE_URL`, `AUTH_SECRET`, the migration command and the
`auth:create-operator` command are all documented in one place: [`docs/ENV.md`](../../docs/ENV.md).
Never put an operator password in this repo, in a fixture, or in a PR description.

## Imports

Same rules as `apps/web`: primitives from `@remi/ui`, `cn()` from `@remi/ui/utils`, data through
`@remi/services/server`, types through `@remi/services/shared`, `@/*` for app-local paths.

## Interface

Admin is a tool, not a showcase. Density over polish: tables that show everything, filters that
narrow fast, states that say what is actually happening. It uses the same design system as the
product — so the two never drift — but it is allowed to be plainer.
