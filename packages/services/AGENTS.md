# @remi/services — package rules (Layer 3 delta)

The global rules in [`/CONVENTIONS.md`](../../CONVENTIONS.md) still apply. This file holds only
what is specific to this package.

## Storage and AI have no vendor yet — and that is the design

Storage, email and AI are **seams**, not integrations. Each one defines an interface and a
`register*()` call; the concrete adapter is registered once at process start by the app that owns
the process. Nothing above the seam names a vendor, so choosing one later is a new file plus one
registration line — never a rewrite of the callers.

| Seam    | Interface        | Register with            | Adapter                         | Default if unregistered             |
| ------- | ---------------- | ------------------------ | ------------------------------- | ----------------------------------- |
| Storage | `DatabaseClient` | `registerDatabase()`     | none yet                        | throws — a missing DB must be loud  |
| Email   | `Mailer`         | `registerMailer()`       | Resend (`createResendMailer()`) | `consoleMailer` — logs, never sends |
| AI      | `TextProvider`   | `registerTextProvider()` | none yet                        | throws                              |

An adapter goes in this package under `src/<seam>/adapters/<vendor>.ts`, the seam's own module is
the only thing that re-exports it, and `.icm/docs/ENV.md` gains its variables in the same PR. A vendor
SDK, if one is needed, becomes a dependency of **this** package only. The Resend adapter needs none:
it is one POST to one endpoint, so it uses `fetch` and the package stays at a single dependency.

## Entrypoints — pick the one that matches where the code runs

| Import                  | Contains                                                          | Runs on          |
| ----------------------- | ----------------------------------------------------------------- | ---------------- |
| `@remi/services/shared` | types, domain vocabulary, formatters, `Result`, locales, app URLs | browser + server |
| `@remi/services/server` | storage, email, AI, env — the whole Node surface                  | server only      |
| `@remi/services/db`     | the storage seam alone                                            | server only      |
| `@remi/services/ai`     | model roles + the provider seam                                   | server only      |
| `@remi/services/email`  | the mailer seam                                                   | server only      |
| `@remi/services`        | types only — apps are lint-blocked from it                        | —                |

Adding an entrypoint means editing **two** places that must agree: `exports` in `package.json` and
`entry` in `tsup.config.ts`.

**A seam's registry belongs to the entrypoint you reached it through.** tsup bundles each entry
independently, so `@remi/services/email` and `@remi/services/server` carry their own copy of the
module-level `mailer` — register through one and send through the other and the send silently uses
the fallback. Pick one entrypoint per seam per app and stay on it; `apps/marketing` uses `/server`
for both.

## Environment

Every server-side `process.env` read goes through `env()` / `requireEnv()` in `src/server/env.ts`.
A read anywhere else is a review blocker — the point is that a missing variable fails at boot
naming itself, and that [`.icm/docs/ENV.md`](../../.icm/docs/ENV.md) has one file to track. Adding a variable
is the three-edit rule in [`/CONVENTIONS.md`](../../CONVENTIONS.md) § "Environment variables".

`shared/links.ts` is the one carve-out, and it is not a loophole: a `NEXT_PUBLIC_*` variable is
inlined into the browser bundle only for a literal `process.env.NAME`, so routing it through
`env()` would leave the browser reading `undefined`. Its **seven** reads are literal and spelled out
one per line: the six `NEXT_PUBLIC_*_URL` overrides — the file answers from its own table when they
are unset — plus `NODE_ENV`, which selects the dev ports and which Next.js inlines on the same
terms.

## Where the apps live

`shared/links.ts` is the single catalogue of the six origins: one root domain, one subdomain per
app, the dev ports, and which apps carry a locale prefix. Every cross-app link, `metadataBase` and
sitemap in the repo is built from it, so moving the ecosystem to a new domain is one edit. Never
write an origin anywhere else — a second copy is a link that silently keeps pointing at the old
domain.

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
