# Environment variables & secrets

The single catalogue of every environment variable this repo reads, so the setup is never trapped
in one person's head.

> **Names and purposes only — never values.** Real values live in **Vercel → Project → Settings →
> Environment Variables** (runtime) and **GitHub → Settings → Secrets and variables → Actions**
> (CI). Secrets are never committed. Adding a variable is the three-edit rule in
> [`/CONVENTIONS.md`](../CONVENTIONS.md) § "Environment variables" — a row here is one of the three.

## How to read the columns

- **Where set** — `Vercel` (app runtime), `Actions` (CI secret), `both`, `local` (a developer's
  own shell), or `repo` (checked in, so every clone and every agent session already has it).
- **Public?** — a `NEXT_PUBLIC_*` variable is in the browser bundle. Treat everything else as secret.

## Getting the values onto a machine

`pnpm env:pull` fans out to every app's own `env:pull` script, each of which runs
`vercel env pull .env.local` in its app folder. That is the only sanctioned way values reach a
developer's machine: they come from Vercel, they land in a gitignored `.env.local` per app, and
nothing is typed out by hand or passed around. It needs the Vercel CLI, authenticated and linked to
that app's project.

---

## App configuration

| Variable                    | Purpose                                                               | Where set | Public? |
| --------------------------- | --------------------------------------------------------------------- | --------- | ------- |
| `NODE_ENV`                  | `development` \| `test` \| `production`                               | toolchain | no      |
| `APP_URL`                   | Absolute base URL of the app doing the reading                        | Vercel    | no      |
| `NEXT_PUBLIC_APP_URL`       | Where `apps/web` answers                                              | Vercel    | yes     |
| `NEXT_PUBLIC_MARKETING_URL` | Where `apps/marketing` answers                                        | Vercel    | yes     |
| `NEXT_PUBLIC_ADMIN_URL`     | Where `apps/admin` answers                                            | Vercel    | yes     |
| `NEXT_PUBLIC_DOCS_URL`      | Where `apps/docs` answers                                             | Vercel    | yes     |
| `UNDER_CONSTRUCTION`        | `1`: `apps/marketing` shows its under-construction page on every page | Vercel    | no      |

Value per target: production takes the production address of each app, uat the uat address
(`https://uat-app.remiai.be`, `https://uat-admin.remiai.be`, `https://uat.remiai.be`; docs has no
uat, so uat takes its production address), preview is unset today. The addresses live in
`.icm/environments.md`.

`UNDER_CONSTRUCTION` is `1` on the production target of the **marketing** project only, until the
site opens. uat and preview leave it unset, so they show the full site. To open the site, delete
the variable and redeploy production.

`NODE_ENV` is the one row nobody sets: Next.js, Turborepo and the test runner set it themselves, and
it is listed here because it is in the zod schema and in `turbo.json` like every other variable, and
because `packages/services/src/shared/links.ts` reads it literally to decide between the dev ports
and the live domain. Never set it by hand.

### The four origin variables

`packages/services/src/shared/links.ts` is the one file that knows where each app answers, and every
cross-app link, canonical URL, sitemap entry, operator invitation and patient share link is built
from it. It answers in two ways: the `NEXT_PUBLIC_*_URL` variable for that app if it is set,
otherwise a built-in table of subdomains under one root domain (dev ports when `NODE_ENV` is
`development`).

**In production the variables are the answer, and the table is not.** Its `rootDomain` is
`remiai.be` since 2026-11-17, so the table names the production addresses. Before that date it was
a placeholder on a personal account, and an operator invitation went out pointing at that
placeholder. A project missing a variable does not fail: on uat it silently advertises the
production address. Treat an unset variable in a production or uat project as a defect, not a
default.

Two things to know before setting them:

- **They are inlined at build time.** `NEXT_PUBLIC_*` is substituted into the bundle when the app
  compiles, so saving a value in Vercel changes nothing until that project is **redeployed**.
- **A project needs a variable for every app it links to, not just for itself.** The console builds
  patient share links into the product, so the admin project needs `NEXT_PUBLIC_APP_URL` as well as
  its own.

### Which project needs which

The minimum each Vercel project needs, from the `appHref` / `appOrigin` calls in its own source.
Setting all four in all four projects is also fine and is the safer habit — these are public URLs,
there is nothing to leak, and it survives someone adding a cross-app link later.

| Vercel project | Needs               | Why                                                |
| -------------- | ------------------- | -------------------------------------------------- |
| `web`          | `MARKETING`, `DOCS` | the product links out to both                      |
| `marketing`    | `MARKETING`, `APP`  | own `metadataBase` — canonicals, hreflang, sitemap |
| `admin`        | `ADMIN`, `APP`      | operator invitation links; patient share links     |
| `docs`         | `APP`, `MARKETING`  | the nav leaves for both                            |

Local development needs none of them: `NODE_ENV=development` makes the catalogue answer with the dev
ports, so every app runs from a clean checkout. Each app's `.env.example` lists the ones it uses.

The built-in table stays as the last resort and as the dev-port source. Retiring the placeholder
domain in it is a separate decision — REMI-037 (`remi.be` DNS) and decision D-6 in the audit.

## Storage

**Neon Postgres**, by owner decision on 27 August 2026 — it supersedes the repo's earlier
Supabase leaning (REMI-007/013 ticket texts predate it). The adapter is
`packages/services/src/db/adapters/neon.ts`, Drizzle over the serverless **WebSocket** driver
(`@neondatabase/serverless`'s `Pool` with `drizzle-orm/neon-serverless`), so the storage seam's
`transaction()` is a real `BEGIN` / `COMMIT` / `ROLLBACK`; checked-in migrations live in
`packages/services/src/db/migrations/`. `db:migrate` applies them and `db:verify` checks the
result. Where they run is `.icm/local/database.md` § The migration rule, and D-36 in
`.icm/intake/README.md`.

**The pooled driver needs no variable of its own.** Pool size and idle timeout are constants in
the adapter, sized for one pool per Next.js route bundle rather than one per process. The socket
needs no wiring either: `@neondatabase/serverless` v1 pulls in no `ws` package and uses the
`WebSocket` Node 22 provides, so there is no `neonConfig` to set and nothing to carry per
environment. `DATABASE_URL` remains the whole of the storage configuration.

| Variable                | Purpose                                                                                                                                                          | Where set | Public? |
| ----------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------- | ------- |
| `DATABASE_URL`          | Neon connection string (pooled) — the **admin**, **web** and **marketing** projects. Production: production's project. Preview and `uat`: the UAT project's base | Vercel    | no      |
| `DATABASE_URL_UNPOOLED` | Direct connection string of the same database. `vercel-build.sh` gives it to `db:migrate` and `db:verify`. The app does not read it                              | Vercel    | no      |
| `MIGRATE_AT_BUILD`      | `1` forces a migration on a Vercel target other than `uat` and `preview`. Nothing sets it since the Neon integration makes the preview branches. Never by hand   | Vercel    | no      |
| `VERCEL_TARGET_ENV`     | The deployment's environment: `production`, `uat` or `preview`. Set by Vercel. The `uat` build migrates                                                          | Vercel    | no      |

With `DATABASE_URL` unset nothing is registered and any screen that needs the database fails loudly
with "no database adapter registered" — a deploy without a database never quietly renders nothing.

**Who migrates.** Only three runs write the schema, and each one owns its database:

1. The admin `uat` build migrates the UAT base, at every merge to `main`.
2. The admin preview build migrates its own Neon branch (`preview/<git branch>` in
   `uat-remi-ai`). The Neon integration makes the branch before the build, from the UAT base.
3. `promote.yml` migrates production, on `promote.sh run`, before the promotion.

Every other build only builds: production at the merge to `main`, and `apps/web`, whose build
line does not call `vercel-build.sh` (the triage stub `web-build-does-not-call-vercel-build`).
`packages/services/scripts/migrate.mjs` refuses again on Vercel when the target is `production`
or unset. `migrate.mjs` prints the database host before it migrates, so a build log shows which
branch the migration reached.

Why the guard is not optional: drizzle decides what to apply by comparing each migration's journal
`when` against the newest `created_at` already recorded — never by hash. A migration applied out of
order raises that high-water mark, and every older migration still unapplied is then skipped
**silently, forever**. That is not hypothetical: on 2026-09-02 a preview applied a branch's
migration to the live database, and the next migration to merge — 70 seconds older by timestamp —
never ran. Nothing reported it.

## Auth

Operator auth for `apps/admin` is vendor-free: an scrypt password hash in the `operators` table
and an HMAC-signed session cookie, both in `packages/services/src/auth/`. Patients get accounts
through the auth seam below (D-26). The patient link's token stays until the patient space
replaces it.

The console now has more than one account. `OPERATOR_EMAIL` creates the **first** one and stops
working the moment it exists; every account after that arrives by invitation from an admin, through
a hashed single-use token in the `operator_invitations` table. There is no second environment
variable behind that — the invitation is data, not configuration.

| Variable         | Purpose                                                                                         | Where set | Public? |
| ---------------- | ----------------------------------------------------------------------------------------------- | --------- | ------- |
| `AUTH_SECRET`    | Signs the admin session cookie (**admin** project). Rotating it signs every operator out        | Vercel    | no      |
| `OPERATOR_EMAIL` | The one email allowed to create the first operator account (**admin** project) — see `/sign-in` | Vercel    | no      |

Value per target: `AUTH_SECRET` is one value per target, made with `openssl rand -base64 32`; uat
never reuses production's. `OPERATOR_EMAIL` on uat may take its own test address.

### Patient auth (`apps/web`)

Patients sign in through the auth seam in `packages/services/src/auth/` (D-28). Its one adapter
is Neon Auth, managed Better Auth, at `packages/services/src/auth/adapters/neon-auth.ts`. The users
live in the `neon_auth` schema of the same Neon branch, so each preview branch has its own users.
`apps/web` registers the adapter at first use (`apps/web/lib/auth/provider.ts`) and mounts the
auth API at `/api/auth/[...path]`. Neon Auth's own settings (sign-in methods, the magic link, the
SMTP sender, the trusted origins) live in the Neon console, per project, not in a variable.

`require_email_verification` is `false` in `remi-ai` and in `uat-remi-ai` (Jamie, 2026-11-05).
The app has no page for the e-mail code. With the setting on, a new patient cannot sign in.

The magic link lands on the Neon Auth host first. That host redirects to `/[locale]/connexion/lien`
with the query parameter `neon_auth_session_verifier`. The landing route exchanges it for the
session cookies through the seam (`completeRedirectSignIn`): the mounted auth handler sends the
verifier to `get-session`, as the browser SDK does. The verifier alone is the proof, so the link
signs in from any browser.

| Variable                  | Purpose                                                                                                                          | Where set | Public? |
| ------------------------- | -------------------------------------------------------------------------------------------------------------------------------- | --------- | ------- |
| `NEON_AUTH_BASE_URL`      | The Neon Auth server of the deployment's branch (**app** project). Set by the Neon integration, never by hand                    | Vercel    | no      |
| `NEON_AUTH_COOKIE_SECRET` | Signs the patient session-data cookie (**app** project). At least 32 characters. Rotating it makes every patient read the server | Vercel    | no      |

Value per target: `NEON_AUTH_BASE_URL` comes from the integration: production from `remi-ai`, uat
from the main branch of `uat-remi-ai`, preview from the branch `preview/<git branch>` of
`uat-remi-ai`. `NEON_AUTH_COOKIE_SECRET` is one value per target, made with
`openssl rand -base64 32`. uat never reuses production's. With either unset, `/api/auth` answers
503 and the log names the variable.

## Email

| Variable         | Purpose                                                   | Where set | Public? |
| ---------------- | --------------------------------------------------------- | --------- | ------- |
| `EMAIL_FROM`     | Default from-address for outbound email                   | Vercel    | no      |
| `RESEND_API_KEY` | Resend API key — read by the Resend adapter on every send | Vercel    | no      |

Value per target: production takes the live key. uat and preview take a key of a separate Resend
account or sandbox, never the live key. `EMAIL_FROM` is `REMI <no-reply@mail.jamienisbet.com>` on
every target until remiai.be is verified in Resend. Unset: the console mailer logs and sends nothing.

Resend is the registered mail vendor: `packages/services/src/email/adapters/resend.ts` implements
the `Mailer` seam. Three apps register it: `apps/marketing` for the waiting-list notification,
`apps/admin` for operator invitations and the patient link sent to a patient, and `apps/web` (the
**app** project) for the notice of deletion of the inactivity sweep.

**Both variables are required on the marketing, admin and app projects**, and `EMAIL_FROM`
has to be an address on a domain verified in Resend — an unverified sender is refused at the API.
They are the same two variables in each place. On the app project, without them the inactivity
sweep answers 503 and sends and deletes nothing.

With `RESEND_API_KEY` unset, nothing is registered and `@remi/services/email` keeps its
`consoleMailer` fallback: it logs and sends nothing. That is deliberate — a preview deploy without
credentials is loud, not silently dropping mail — and every caller treats it as a delivery failure
rather than acknowledging a message that went nowhere. The contact form tells the sender to write
to the founders directly; the admin console falls back to a copyable invitation link and says on
screen that no email will go out, and refuses to claim it emailed a patient their link.

## Scheduled jobs

| Variable      | Purpose                                                                                                     | Where set | Public? |
| ------------- | ----------------------------------------------------------------------------------------------------------- | --------- | ------- |
| `CRON_SECRET` | Shared secret of the cron routes (**app** project). Vercel Cron sends it as `Authorization: Bearer <value>` | Vercel    | no      |

Value per target: one value per target, made with `openssl rand -base64 32`.
uat and preview never reuse production's. Unset: `/api/cron/inactive-accounts` answers 503 and does
nothing. Vercel Cron calls the route on the production deployment only, so preview and uat need the
value only for a call by hand.

## Files

| Variable                | Purpose                                                                                                    | Where set | Public? |
| ----------------------- | ---------------------------------------------------------------------------------------------------------- | --------- | ------- |
| `BLOB_READ_WRITE_TOKEN` | Read-write token of the private Vercel Blob store — read by the Blob adapter on every upload, read, delete | Vercel    | no      |

Value per target: production takes the token of the store `document-storage`; preview and uat take
the token of the store `uat-document-storage`, added by hand, since the store connection exposes
only `BLOB_STORE_ID` and `BLOB_WEBHOOK_PUBLIC_KEY`. Unset: no file store is registered.

Vercel Blob is the registered file vendor (decision D-18): `packages/services/src/files/adapters/vercel-blob.ts`
implements the `FileStore` seam. **The store must be created private and in an EU region** — both are
fixed at creation and cannot be changed afterwards; a public or non-EU store means a new store. Two
apps register it: `apps/admin` (uploads, removals, a patient's deletion) and `apps/web` (the patient
opening a file through a five-minute signed URL). **The same token is required on both projects**,
per environment — production and preview each point at their own store.

With the variable unset, nothing is registered and `@remi/services/files` keeps its unconfigured
fallback: uploads are refused, the console says so where it offers one, links still work, and a
file cannot be opened. Nothing is ever reported as stored when it was not.

## AI

| Variable             | Purpose                                               | Where set | Public? |
| -------------------- | ----------------------------------------------------- | --------- | ------- |
| `ANTHROPIC_API_KEY`  | Direct Anthropic API access                           | both      | no      |
| `AI_GATEWAY_API_KEY` | Vercel AI Gateway key, if routing through the gateway | Vercel    | no      |

Value per target: AI has no vendor adapter yet. Set neither key on any target until an adapter reads it.

Model ids are **not** environment variables — they live in `packages/services/src/ai/index.ts`
behind three role names (`fast` / `balanced` / `deep`), so an upgrade is one edit rather than a
config change in five places.

## Analytics

**No variable.** `@vercel/analytics` is mounted in `web`, `admin` and `marketing`, and it is
keyless — Vercel identifies the project from the deployment. There was a
`NEXT_PUBLIC_ANALYTICS_KEY` row here that nothing ever read; it is gone. Don't reintroduce one
unless a second analytics vendor arrives with a reader to go with it.

## CI and the two scripts (GitHub Actions, `gh`)

| Variable                    | Purpose                                                                                                                                                               | Where set | Public? |
| --------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------- | ------- |
| `GITHUB_TOKEN`              | Injected automatically by Actions. Do **not** add it                                                                                                                  | Actions   | no      |
| `GH_TOKEN`                  | What `gh` reads when no `gh auth login` exists. `.icm/scripts/new-run.sh` and `close-out.sh` call `gh`; a logged-in `gh` needs no variable                            | local     | no      |
| `TURBO_TOKEN`               | Turborepo remote cache token, shares the cache between CI and Vercel                                                                                                  | Actions   | no      |
| `TURBO_TEAM`                | Turborepo team slug (a repo **variable**, not a secret)                                                                                                               | Actions   | no      |
| `SLACK_BOT_TOKEN`           | Bot token (`xoxb-…`, scope `chat:write`, the app invited to the channel) of the REMI Slack workspace. Nothing reads it today                                          | Actions   | no      |
| `SLACK_ANNOUNCE_CHANNEL_ID` | Channel id (`C…`) of the release post. Nothing reads it today. An Actions **variable**, not a secret                                                                  | Actions   | no      |
| `SLACK_ALERTS_CHANNEL_ID`   | Channel id (`C…`) kept for an alert post. Nothing reads it today                                                                                                      | Actions   | no      |
| `VERCEL_TOKEN_REMI21`       | Vercel API token for the **remi21** team. Nothing reads it today                                                                                                      | local     | no      |
| `VERCEL_TOKEN`              | Vercel token for the **remi21** team. `promote.yml` and `promote.sh` read it. No other workflow exists                                                                | both      | no      |
| `VERCEL_TEAM`               | The Vercel team's slug, `remi21`. An Actions **variable**, not a secret                                                                                               | both      | no      |
| `NEON_API_KEY`              | Neon API key of the organisation `Remi AI`. `neon-preview-cleanup.yml` reads it to delete the preview branch of a gone git branch. Do not delete it | Actions   | no      |
| `DATABASE_URL`              | Production's **direct** connection string. Read by the migration in `promote.yml` only                                                                                | Actions   | no      |

The Slack app itself is described by [`slack-app-manifest.yaml`](slack-app-manifest.yaml) beside this
file: import it at api.slack.com/apps (Create New App → From a manifest), install it, and the Bot User
OAuth Token it shows is the `SLACK_BOT_TOKEN` row. The Slack rows live in **this repository's Actions
secrets and variables**. Since 2026-10-27 no workflow posts to Slack: `release.yaml` was removed.
No check is required on `main`, and the merge is Jamie's.

## Not wired yet

Nothing reads these today. Document the real value here the moment each is integrated:

- **Error tracking** — `SENTRY_DSN` (+ `NEXT_PUBLIC_SENTRY_DSN`). Until it exists, a production
  exception is invisible. This is the top unstarted ops item.
- **Payments** — nothing reads a Stripe key yet; billing arrives with the parked
  `beyond-december/practitioner-space` stub, and its variables land here then.
