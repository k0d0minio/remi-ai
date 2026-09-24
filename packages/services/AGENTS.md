# @remi/services — package rules (Layer 3 delta)

The global rules in [`/CONVENTIONS.md`](../../CONVENTIONS.md) still apply. This file holds only
what is specific to this package.

## Seams, not integrations — AI still has no vendor, and that is the design

Storage, email, files and AI are **seams**: each defines an interface and a `register*()` call; the
concrete adapter is registered by the app that owns the process — **lazily, at first use**, from
an idempotent `ensure*()` helper beside the code that reads (`apps/marketing/lib/mailer.ts`,
`apps/admin/lib/database.ts`, `apps/web/lib/database.ts`). Never from `instrumentation.ts`:
Next.js gives every route its own copy of this package's modules, so a boot hook's registration
never reaches them — that mistake shipped once and threw "no database adapter registered" in
production with the variable set. Nothing above a seam names a vendor, so changing one is a new
file plus one registration line — never a rewrite of the callers.

| Seam    | Interface        | Register with            | Adapter                                     | Default if unregistered                                           |
| ------- | ---------------- | ------------------------ | ------------------------------------------- | ----------------------------------------------------------------- |
| Storage | `DatabaseClient` | `registerDatabase()`     | Neon (`createNeonDatabase()`)               | throws — a missing DB must be loud                                |
| Email   | `Mailer`         | `registerMailer()`       | Resend (`createResendMailer()`)             | `consoleMailer` — logs, never sends                               |
| Files   | `FileStore`      | `registerFileStore()`    | Vercel Blob (`createVercelBlobFileStore()`) | stores nothing — uploads refused, `isFileStoreConfigured()` false |
| AI      | `TextProvider`   | `registerTextProvider()` | none yet                                    | throws                                                            |

Storage's vendor is **Neon Postgres** (owner decision, 27 Aug 2026 — supersedes the earlier
Supabase leaning), queried with Drizzle against `src/db/schema.ts`. The schema is the single
definition the checked-in migrations under `src/db/migrations/` are generated from
(`pnpm db:generate`); `pnpm db:migrate` applies them, and the admin app's build runs it first.
Never change the live schema any other way. Services under `src/db/services/` still speak only to
the seam — the tests run them against an in-memory client (`src/db/test-helpers.ts`), which is the
proof.

An adapter goes in this package under `src/<seam>/adapters/<vendor>.ts`, the seam's own module is
the only thing that re-exports it, and `.icm/docs/ENV.md` gains its variables in the same PR. A vendor
SDK, if one is needed, becomes a dependency of **this** package only. The Resend adapter needs none:
it is one POST to one endpoint, so it uses `fetch` and the package stays at a single dependency.

## Entrypoints — pick the one that matches where the code runs

| Import                        | Contains                                                                                | Runs on          |
| ----------------------------- | --------------------------------------------------------------------------------------- | ---------------- |
| `@remi/services/shared`       | types, domain vocabulary, formatters, `Result`, locales, app URLs, the AI context block | browser + server |
| `@remi/services/server`       | storage, email, AI, env — the whole Node surface                                        | server only      |
| `@remi/services/db`           | the storage seam alone                                                                  | server only      |
| `@remi/services/ai`           | model roles, the provider seam, the context block                                       | server only      |
| `@remi/services/email`        | the mailer seam                                                                         | server only      |
| `@remi/services/files`        | the files seam and its rules (types, cap, read-link lifetime)                           | server only      |
| `@remi/services/files/client` | the browser uploader — bytes go to the store under a grant the server issued            | browser          |
| `@remi/services`              | types only — apps are lint-blocked from it                                              | —                |

Adding an entrypoint means editing **two** places that must agree: `exports` in `package.json` and
`entry` in `tsup.config.ts`.

**One export sits on both `/shared` and `/ai`, and only one ever should.**
`ai/context.ts` — `patientContextText()`, the pseudonymous French block every prompt opens with —
imports nothing, touches no I/O and reads no clock, so it is genuinely isomorphic even though it
belongs conceptually under `ai/`. The console assembles that text **in the browser** as the
operator edits the preamble and toggles blocks, and reaching it through `/ai` from a client
component would inline the provider seam — and, once an adapter exists, a vendor SDK — into that
bundle. So `shared/index.ts` re-exports it from `../ai/context` directly, never from `../ai`.
Anything under `ai/` that touches the seam stays off `/shared`, and the test of whether a new
export may join it is the same one: does it import anything at all?

**A seam's registry belongs to the entrypoint you reached it through.** tsup bundles each entry
independently, so `@remi/services/email` and `@remi/services/server` carry their own copy of the
module-level `mailer` — register through one and send through the other and the send silently uses
the fallback. Pick one entrypoint per seam per app and stay on it; `apps/marketing` uses `/server`
for both. The files seam is the same: the apps register and call it through `/server` only, which is
also the copy `deletePatient` reads — a store registered through `/files` would leave a deleted
patient's files behind.

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
  auth/        password hashing + session tokens — vendor-free, `node:crypto` only
  db/          client.ts (the seam) · schema.ts (Drizzle) · adapters/ · models/ · services/ · migrations/
  email/       the mailer seam + templates
  files/       the files seam · adapters/ (the server adapter and its browser half) · client.ts
  ai/          model roles · the provider seam · context.ts (the prompt's context block)
```

`db/models/` files are **types only**. That is what lets `shared/` re-export the domain vocabulary
to browser code while the rest of `db/` stays server-only — a runtime value there would quietly
become part of every client bundle. A model needing a constant means the constant belongs in
`shared/`, not in the model.

One folder per entity under `db/services/`, one file per entity under `db/models/`. That is the
shape a service layer converges on once it passes roughly fifty entities — adopted here from the
start, so the first ten don't have to be moved later.
