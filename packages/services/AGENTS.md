# @remi/services — package rules (Layer 3 delta)

The global rules in [`/CONVENTIONS.md`](../../CONVENTIONS.md) still apply. This file holds only
what is specific to this package.

## No vendor is committed yet — and that is the design

Storage, email and AI are **seams**, not integrations. Each one defines an interface and a
`register*()` call; the concrete adapter is registered once at process start by the app that owns
the process. Nothing above the seam names a vendor, so choosing one later is a new file plus one
registration line — never a rewrite of the callers.

| Seam    | Interface        | Register with            | Default if unregistered             |
| ------- | ---------------- | ------------------------ | ----------------------------------- |
| Storage | `DatabaseClient` | `registerDatabase()`     | throws — a missing DB must be loud  |
| Email   | `Mailer`         | `registerMailer()`       | `consoleMailer` — logs, never sends |
| AI      | `TextProvider`   | `registerTextProvider()` | throws                              |

When you add the first adapter, it goes in this package (`src/db/adapters/<vendor>.ts`), the vendor
SDK becomes a dependency of **this** package only, and `docs/ENV.md` gains its variables in the same
PR.

## Entrypoints — pick the one that matches where the code runs

| Import                  | Contains                                                    | Runs on          |
| ----------------------- | ----------------------------------------------------------- | ---------------- |
| `@remi/services/shared` | types, the domain vocabulary, formatters, `Result`, locales | browser + server |
| `@remi/services/server` | storage, email, AI, env — the whole Node surface            | server only      |
| `@remi/services/db`     | the storage seam alone                                      | server only      |
| `@remi/services/ai`     | model roles + the provider seam                             | server only      |
| `@remi/services/email`  | the mailer seam                                             | server only      |
| `@remi/services`        | types only — apps are lint-blocked from it                  | —                |

Adding an entrypoint means editing **two** places that must agree: `exports` in `package.json` and
`entry` in `tsup.config.ts`.

## Environment

Every server-side `process.env` read goes through `env()` / `requireEnv()` in `src/server/env.ts`.
A read anywhere else is a review blocker — the point is that a missing variable fails at boot
naming itself, and that [`docs/ENV.md`](../../docs/ENV.md) has one file to track. New variable →
schema entry, `docs/ENV.md` row, and `turbo.json` `globalEnv` entry, all in the same PR.

## Errors

Anything a UI has to render — not found, not permitted, invalid input — comes back as a `Result`,
never a thrown error. Throw only for conditions no caller can handle: unregistered adapter,
malformed environment. That split is what lets a route handler stay free of `try`/`catch` noise.

## Layout as this grows

```text
src/
  types/       the storage-agnostic vocabulary everything else is written against
  shared/      isomorphic — no fs, no driver, no secret
  server/      the Node barrel + env
  db/          client.ts (the seam) · models/ · services/ · migrations/
  email/       the mailer seam + templates
  ai/          model roles + the provider seam
```

`db/models/` files are **types only**. That is what lets `shared/` re-export the domain vocabulary
to browser code while the rest of `db/` stays server-only — a runtime value there would quietly
become part of every client bundle. A model needing a constant means the constant belongs in
`shared/`, not in the model.

One folder per entity under `db/services/`, one file per entity under `db/models/`. That is the
shape a service layer converges on once it passes roughly fifty entities — adopted here from the
start, so the first ten don't have to be moved later.
