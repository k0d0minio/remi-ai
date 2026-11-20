# apps/web — app rules (Layer 3 delta)

The global rules in [`/CONVENTIONS.md`](../../CONVENTIONS.md) still apply. This file holds only
what is specific to this app.

## What this app is

The product: the signed-in surface a customer uses. Real data, real side effects. If a change
would be visible to a customer, it lands here.

## Screens and text follow the charter

Read [`packages/ui/brand/charte-graphique.md`](../../packages/ui/brand/charte-graphique.md)
before you build or change a screen or its text. Its section 2 is the tone of voice: the patient
is addressed as « tu », the practitioner in a neutral and professional tone, and REMI never
diagnoses. The dictionaries in `lib/content/` do not follow it in all places yet: change a text
only in the ticket that asks for it.

## Structure

```text
app/[locale]/       `fr` only (Jamie, 2026-11-20); `[locale]/layout.tsx` IS the
                    root layout — there is no app/layout.tsx
  page.tsx          the entry screen — the only route outside the auth boundary
  (app)/            signed-in routes on the development session only — the route
                    group carries that session's boundary
    (practitioner)/ the console: clients, practice, therapeutic frame
    (patient)/      the prototype's daily surface: today, steps, plan
  (patient)/        the patient's shell after activation: the greeting, the tab
                    bar, and the tabs accueil/, recettes/, profil/. Its layout
                    is the patient session's boundary
  inscription/      the patient's sign-up from the practitioner's link
  connexion/        the patient's sign-in, the reset pages, the magic link's landing
  questionnaire/    behind the patient session: the page before activation
  attente/          behind the patient session: the waiting screen, from a
                    complete questionnaire to the activation
app/api/            route handlers (webhooks, cron, uploads) — outside the locale
                    segment, because a machine surface has no language
components/         composition only, grouped by feature — never primitives
hooks/              client hooks specific to this app
lib/auth/           the session seam + the development stand-in, and the auth
                    seam's registration (`provider.ts`)
lib/patient-auth/   the patient's routes, session guard and sign-in actions.
                    A patient page calls `requirePatient()` and reads the
                    patient's id from the account it returns, never from the URL.
                    A page of `(patient)/` calls `requireActivePatient()`: no
                    page of the space opens before the activation
lib/content/        `fr.ts`, the one dictionary, typed by `types.ts` so a missing
                    text is a type error. A new text is one line in each
lib/fixtures/       stand-in data — deleted by the PR that registers a real
                    DatabaseClient
lib/                queries, actions, types, app-local helpers
proxy.ts            redirects bare paths and /en to /fr
```

The route groups add no URL segment, so the paths stay `/fr/clients`, `/fr/today` and
`/fr/accueil`. No group may hold a root `page.tsx` — it would collide with the entry screen at `/[locale]`, which
owns that path and redirects a visitor who already has a session to their role's landing route.

`(app)/layout.tsx` redirects a null session to `/[locale]`. That target has to stay outside the
group: anything inside it comes back through the same layout and loops.

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
