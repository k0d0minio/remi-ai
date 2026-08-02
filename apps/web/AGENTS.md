# apps/web — app rules (Layer 3 delta)

The global rules in [`/CONVENTIONS.md`](../../CONVENTIONS.md) still apply. This file holds only
what is specific to this app.

## What this app is

The product: the signed-in surface a customer uses. Real data, real side effects. If a change
would be visible to a customer, it lands here.

## Structure

```text
app/[locale]/       every page ships in en and fr; `[locale]/layout.tsx` IS the
                    root layout — there is no app/layout.tsx
  (app)/            signed-in routes — the route group carries the auth boundary
    (practitioner)/ the console: clients, practice, therapeutic frame
    (person)/       the daily surface: today, meals, steps, plan
app/api/            route handlers (webhooks, cron, uploads) — outside the locale
                    segment, because a machine surface has no language
components/         composition only, grouped by feature — never primitives
hooks/              client hooks specific to this app
lib/auth/           the session seam + the development stand-in
lib/content/        one dictionary per locale, typed by `types.ts` so a missing
                    translation is a type error
lib/fixtures/       stand-in data — deleted by the PR that registers a real
                    DatabaseClient
lib/                queries, actions, types, app-local helpers
proxy.ts            redirects bare paths to the visitor's language
```

The two route groups add no URL segment, so the paths stay `/en/clients` and `/en/today`. Neither
group may hold a root `page.tsx` — they would collide on `/[locale]`; `(app)/page.tsx` redirects by
role instead.

`components/` holds composition. The moment a component renders purely from props and a second app
could use it, it belongs in `packages/ui` — copying it into another app is forbidden.

## Imports

- Primitives from `@remi/ui`. Never `@radix-ui/*` directly, never a local `components/ui/` barrel.
  ESLint blocks both.
- `cn()` from `@remi/ui/utils` — the main barrel is `"use client"` and cannot be called from a
  server component.
- Data and side effects from `@remi/services/server`; the domain vocabulary, formatters and the
  locale helpers from `@remi/services/shared`. The bare `@remi/services` root is lint-blocked so
  the choice stays explicit.
- `@/*` for app-local imports.

## Reads go through `lib/queries/`

No storage vendor is committed, so every query function returns fixture data from `lib/fixtures/`
today. They are already `async` and already return the domain shape, which is the whole point:
registering a `DatabaseClient` replaces the body of each function and moves no caller. A page that
imports a fixture directly defeats that — go through the query.

## Server first

Server components are the default. `"use client"` earns its place with an event handler, a hook,
or a browser API — nothing else. Push the boundary as far down the tree as it will go: a client
island inside a server page, not a client page.

## Route handlers

Anything under `app/api/` is a trust boundary. Validate the input with a zod schema before it
reaches a service, and check the caller — a cron route needs its shared secret, a webhook needs its
signature verified. A handler that trusts its body is a finding, not a style preference.
