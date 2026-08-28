# Environment variables & secrets

The single catalogue of every environment variable this repo reads, so the setup is never trapped
in one person's head.

> **Names and purposes only — never values.** Real values live in **Vercel → Project → Settings →
> Environment Variables** (runtime) and **GitHub → Settings → Secrets and variables → Actions**
> (CI). Secrets are never committed. Adding a variable is the three-edit rule in
> [`/CONVENTIONS.md`](../CONVENTIONS.md) § "Environment variables" — a row here is one of the three.

## How to read the columns

- **Where set** — `Vercel` (app runtime), `Actions` (CI secret), or `both`.
- **Public?** — a `NEXT_PUBLIC_*` variable is in the browser bundle. Treat everything else as secret.

## Getting the values onto a machine

`pnpm env:pull` fans out to every app's own `env:pull` script, each of which runs
`vercel env pull .env.local` in its app folder. That is the only sanctioned way values reach a
developer's machine: they come from Vercel, they land in a gitignored `.env.local` per app, and
nothing is typed out by hand or passed around. It needs the Vercel CLI, authenticated and linked to
that app's project.

---

## App configuration

| Variable                    | Purpose                                        | Where set | Public? |
| --------------------------- | ---------------------------------------------- | --------- | ------- |
| `NODE_ENV`                  | `development` \| `test` \| `production`        | toolchain | no      |
| `APP_URL`                   | Absolute base URL of the app doing the reading | Vercel    | no      |
| `NEXT_PUBLIC_APP_URL`       | Overrides where `apps/web` answers             | Vercel    | yes     |
| `NEXT_PUBLIC_MARKETING_URL` | Overrides where `apps/marketing` answers       | Vercel    | yes     |
| `NEXT_PUBLIC_ADMIN_URL`     | Overrides where `apps/admin` answers           | Vercel    | yes     |
| `NEXT_PUBLIC_DOCS_URL`      | Overrides where `apps/docs` answers            | Vercel    | yes     |
| `NEXT_PUBLIC_SUPPORT_URL`   | Overrides where `apps/support` answers         | Vercel    | yes     |
| `NEXT_PUBLIC_DEMO_URL`      | Overrides where `apps/demo` answers            | Vercel    | yes     |

`NODE_ENV` is the one row nobody sets: Next.js, Turborepo and the test runner set it themselves, and
it is listed here because it is in the zod schema and in `turbo.json` like every other variable, and
because `packages/services/src/shared/links.ts` reads it literally to decide between the dev ports
and the live domain. Never set it by hand.

The six `NEXT_PUBLIC_*_URL` variables are **overrides, and normally unset**. Where each app lives
is catalogued in `packages/services/src/shared/links.ts` — one table of subdomains under one root
domain, plus the dev ports — and that file is what every cross-app link, canonical URL and sitemap
is built from. Moving the whole ecosystem to a new domain is one edit there, not six rows here.

Set one of these only when a deployment has to answer somewhere the catalogue does not describe: a
staging domain, a preview URL a stakeholder is reviewing against, or a rename that has not landed
in the catalogue yet.

## Storage

**Neon Postgres**, by owner decision on 27 August 2026 — it supersedes the repo's earlier
Supabase leaning (REMI-007/013 ticket texts predate it). The adapter is
`packages/services/src/db/adapters/neon.ts`, Drizzle over the serverless HTTP driver; checked-in
migrations live in `packages/services/src/db/migrations/` and are applied by
`pnpm --filter @remi/services db:migrate`, which runs at the front of the **admin** app's build so
a deploy migrates before it serves.

| Variable       | Purpose                                                     | Where set | Public? |
| -------------- | ----------------------------------------------------------- | --------- | ------- |
| `DATABASE_URL` | Neon connection string — the **admin** and **web** projects | Vercel    | no      |

With it unset nothing is registered and any screen that needs the database fails loudly with "no
database adapter registered" — a deploy without a database never quietly renders nothing.

**Preview caveat:** the admin build migrates whatever `DATABASE_URL` it is given. Either scope the
variable to production (previews then show the loud unregistered error), or point preview
environments at a Neon branch of the database — never previews and production at the same value
with unmerged schema changes in flight.

## Auth

Operator auth for `apps/admin` is vendor-free: an scrypt password hash in the `operators` table
and an HMAC-signed session cookie, both in `packages/services/src/auth/`. Phase-1 patients hold no
accounts — the patient link's unguessable token is the whole credential (REMI-035); the fuller
auth question stays with REMI-013.

The console now has more than one account. `OPERATOR_EMAIL` creates the **first** one and stops
working the moment it exists; every account after that arrives by invitation from an owner, through
a hashed single-use token in the `operator_invitations` table. There is no second environment
variable behind that — the invitation is data, not configuration.

| Variable         | Purpose                                                                                         | Where set | Public? |
| ---------------- | ----------------------------------------------------------------------------------------------- | --------- | ------- |
| `AUTH_SECRET`    | Signs the admin session cookie (**admin** project). Rotating it signs every operator out        | Vercel    | no      |
| `OPERATOR_EMAIL` | The one email allowed to create the first operator account (**admin** project) — see `/sign-in` | Vercel    | no      |

## Email

| Variable         | Purpose                                                   | Where set | Public? |
| ---------------- | --------------------------------------------------------- | --------- | ------- |
| `EMAIL_FROM`     | Default from-address for outbound email                   | Vercel    | no      |
| `RESEND_API_KEY` | Resend API key — read by the Resend adapter on every send | Vercel    | no      |

Resend is the registered mail vendor: `packages/services/src/email/adapters/resend.ts` implements
the `Mailer` seam. Two apps register it: `apps/marketing` for the public contact form, and
`apps/admin` for operator invitations and the patient link sent to a patient.

**Both variables are required on the marketing project and on the admin project**, and `EMAIL_FROM`
has to be an address on a domain verified in Resend — an unverified sender is refused at the API.
They are the same two variables in both places; nothing new was added for the admin console.

With `RESEND_API_KEY` unset, nothing is registered and `@remi/services/email` keeps its
`consoleMailer` fallback: it logs and sends nothing. That is deliberate — a preview deploy without
credentials is loud, not silently dropping mail — and every caller treats it as a delivery failure
rather than acknowledging a message that went nowhere. The contact form tells the sender to write
to the founders directly; the admin console falls back to a copyable invitation link and says on
screen that no email will go out, and refuses to claim it emailed a patient their link.

## AI

| Variable             | Purpose                                               | Where set | Public? |
| -------------------- | ----------------------------------------------------- | --------- | ------- |
| `ANTHROPIC_API_KEY`  | Direct Anthropic API access                           | both      | no      |
| `AI_GATEWAY_API_KEY` | Vercel AI Gateway key, if routing through the gateway | Vercel    | no      |

Model ids are **not** environment variables — they live in `packages/services/src/ai/index.ts`
behind three role names (`fast` / `balanced` / `deep`), so an upgrade is one edit rather than a
config change in five places.

## Analytics

**No variable.** `@vercel/analytics` is mounted in `web`, `admin`, `marketing` and `support`, and it
is keyless — Vercel identifies the project from the deployment. There was a
`NEXT_PUBLIC_ANALYTICS_KEY` row here that nothing ever read; it is gone. Don't reintroduce one
unless a second analytics vendor arrives with a reader to go with it.

## Pipeline & CI (GitHub Actions)

| Variable               | Purpose                                                                                                                    | Where set | Public? |
| ---------------------- | -------------------------------------------------------------------------------------------------------------------------- | --------- | ------- |
| `GITHUB_TOKEN`         | Injected automatically by Actions — do **not** add it                                                                      | Actions   | no      |
| `GH_TOKEN`             | Local alternative for the pipeline scripts (`resolve-run.sh`, `new-run.sh`, `project-labels.sh`)                           | local     | no      |
| `GITHUB_REPO`          | Optional `owner/repo` override for the pipeline scripts. Default: `k0d0minio/remi-ai`                                      | local     | no      |
| `GITHUB_API_URL`       | API base for the same scripts — Actions injects it; set it locally only for an override. Default: `https://api.github.com` | both      | no      |
| `TURBO_TOKEN`          | Turborepo remote cache token — shares the cache between CI and Vercel                                                      | Actions   | no      |
| `TURBO_TEAM`           | Turborepo team slug (a repo **variable**, not a secret)                                                                    | Actions   | no      |
| `SHIP_NOTE_FROM`       | From-address for the Ship stage's note (`send-ship-note.sh`)                                                               | local     | no      |
| `SHIP_NOTE_RECIPIENTS` | Where the ship note goes — normally one channel inbox address                                                              | local     | no      |

## Not wired yet

Nothing reads these today. Document the real value here the moment each is integrated:

- **Error tracking** — `SENTRY_DSN` (+ `NEXT_PUBLIC_SENTRY_DSN`). Until it exists, a production
  exception is invisible. This is the top unstarted ops item.
- **Payments** — the Verify stage's smoke checklist has a payments line that stays "not touched"
  until this exists.
