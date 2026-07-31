# apps/web — app rules (Layer 3 delta)

The global rules in [`/CONVENTIONS.md`](../../CONVENTIONS.md) still apply. This file holds only
what is specific to this app.

## What this app is

The product: the signed-in surface a customer uses. Real data, real side effects. If a change
would be visible to a customer, it lands here.

## Structure

```text
app/
  (app)/      signed-in routes — the route group carries the auth boundary
  api/        route handlers (webhooks, cron, uploads) — not a general-purpose API
components/   composition only, grouped by feature — never primitives
hooks/        client hooks specific to this app
lib/          queries, actions, types, app-local helpers
```

`components/` holds composition. The moment a component renders purely from props and a second app
could use it, it belongs in `packages/ui` — copying it into another app is forbidden.

## Imports

- Primitives from `@remi/ui`. Never `@radix-ui/*` directly, never a local `components/ui/` barrel.
  ESLint blocks both.
- `cn()` from `@remi/ui/utils` — the main barrel is `"use client"` and cannot be called from a
  server component.
- Data and side effects from `@remi/services/server`; shared types and formatters from
  `@remi/services/shared`. The bare `@remi/services` root is lint-blocked so the choice stays
  explicit.
- `@/*` for app-local imports.

## Server first

Server components are the default. `"use client"` earns its place with an event handler, a hook,
or a browser API — nothing else. Push the boundary as far down the tree as it will go: a client
island inside a server page, not a client page.

## Route handlers

Anything under `app/api/` is a trust boundary. Validate the input with a zod schema before it
reaches a service, and check the caller — a cron route needs its shared secret, a webhook needs its
signature verified. A handler that trusts its body is a finding, not a style preference.
