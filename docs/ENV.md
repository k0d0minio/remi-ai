# Environment variables & secrets

The single catalogue of every environment variable this repo reads, so the setup is never trapped
in one person's head.

> **Names and purposes only — never values.** Real values live in **Vercel → Project → Settings →
> Environment Variables** (runtime) and **GitHub → Settings → Secrets and variables → Actions**
> (CI). Secrets are never committed. When you add a `process.env.*` read, add a row here **in the
> same PR** — plus the zod entry in `packages/services/src/server/env.ts` and the `globalEnv` entry
> in `turbo.json`. Three edits, one PR.

## How to read the columns

- **Where set** — `Vercel` (app runtime), `Actions` (CI secret), or `both`.
- **Public?** — a `NEXT_PUBLIC_*` variable is in the browser bundle. Treat everything else as secret.

---

## App configuration

| Variable                    | Purpose                                        | Where set | Public? |
| --------------------------- | ---------------------------------------------- | --------- | ------- |
| `APP_URL`                   | Absolute base URL of the app doing the reading | Vercel    | no      |
| `NEXT_PUBLIC_APP_URL`       | Overrides where `apps/web` answers             | Vercel    | yes     |
| `NEXT_PUBLIC_MARKETING_URL` | Overrides where `apps/marketing` answers       | Vercel    | yes     |
| `NEXT_PUBLIC_ADMIN_URL`     | Overrides where `apps/admin` answers           | Vercel    | yes     |
| `NEXT_PUBLIC_DOCS_URL`      | Overrides where `apps/docs` answers            | Vercel    | yes     |
| `NEXT_PUBLIC_SUPPORT_URL`   | Overrides where `apps/support` answers         | Vercel    | yes     |
| `NEXT_PUBLIC_DEMO_URL`      | Overrides where `apps/demo` answers            | Vercel    | yes     |

The six `NEXT_PUBLIC_*_URL` variables are **overrides, and normally unset**. Where each app lives
is catalogued in `packages/services/src/shared/links.ts` — one table of subdomains under one root
domain, plus the dev ports — and that file is what every cross-app link, canonical URL and sitemap
is built from. Moving the whole ecosystem to a new domain is one edit there, not six rows here.

Set one of these only when a deployment has to answer somewhere the catalogue does not describe: a
staging domain, a preview URL a stakeholder is reviewing against, or a rename that has not landed
in the catalogue yet.

## Storage

**Neon** — serverless Postgres, EU region (Frankfurt). Read by the auth store in
`@remi/services/auth` and by the migration runner. `apps/web`'s query layer still returns fixtures
until REMI-022 lands the general `DatabaseClient`; only the auth tables are real today.

| Variable       | Purpose                                                | Where set | Public? |
| -------------- | ------------------------------------------------------ | --------- | ------- |
| `DATABASE_URL` | Neon **pooled** connection string — the `-pooler` host | both      | no      |

Use the pooled string, not the direct one. The adapter talks to Neon over HTTP, which is what the
pooled endpoint fronts, and a serverless function has nowhere to keep a long-lived connection.

Set it on the **admin** and **docs** Vercel projects (all environments — production, preview and
development), and locally in each app's `.env.local` via `pnpm env:pull`.

## Auth

Email + password against the `auth_user` table, sessions in `auth_session`. Both apps that read
these are internal: `apps/admin` and `apps/docs`. There is no auth vendor — the gate is code in
this repo (`packages/services/src/auth/`).

| Variable      | Purpose                                                            | Where set | Public? |
| ------------- | ------------------------------------------------------------------ | --------- | ------- |
| `AUTH_SECRET` | Peppers the session-token HMAC stored in `auth_session.token_hash` | Vercel    | no      |

`AUTH_SECRET` is why a read-only leak of the session table hands over nothing usable: the column
holds `HMAC-SHA256(token, AUTH_SECRET)`, and the secret is not in the database. Generate it with
`openssl rand -base64 32`. **Rotating it signs every operator out** — every stored hash stops
matching — which is the intended emergency lever, not a routine one.

### Running the migrations

The chain lives in `packages/services/src/db/migrations/` and is forward-only. Against a fresh Neon
project, or after pulling a change that adds a migration:

```bash
pnpm --filter @remi/services db:migrate    # needs DATABASE_URL in the environment
```

### Creating an operator

There is no self-service signup. An operator is seeded, and re-running the same command with a new
password is how one is rotated:

```bash
pnpm --filter @remi/services build                 # the script runs the built package
pnpm --filter @remi/services auth:create-operator -- --email=you@example.com
```

It prompts for the password with the echo off, so the value never reaches shell history or a
process list. For a non-interactive run, pass it through `OPERATOR_PASSWORD` in the environment
instead. **Never** put an operator password in this repository, in a fixture, or in a PR
description.

## Email

| Variable         | Purpose                                                    | Where set | Public? |
| ---------------- | ---------------------------------------------------------- | --------- | ------- |
| `EMAIL_FROM`     | Default from-address for outbound email                    | Vercel    | no      |
| `RESEND_API_KEY` | Resend API key — needed once a real `Mailer` is registered | Vercel    | no      |

Until a `Mailer` is registered, `@remi/services/email` falls back to `consoleMailer`: it logs and
sends nothing. That is deliberate — a preview deploy without credentials is loud, not silently
dropping mail.

## AI

| Variable             | Purpose                                               | Where set | Public? |
| -------------------- | ----------------------------------------------------- | --------- | ------- |
| `ANTHROPIC_API_KEY`  | Direct Anthropic API access                           | both      | no      |
| `AI_GATEWAY_API_KEY` | Vercel AI Gateway key, if routing through the gateway | Vercel    | no      |

Model ids are **not** environment variables — they live in `packages/services/src/ai/index.ts`
behind three role names (`fast` / `balanced` / `deep`), so an upgrade is one edit rather than a
config change in five places.

## Analytics

| Variable                    | Purpose               | Where set | Public? |
| --------------------------- | --------------------- | --------- | ------- |
| `NEXT_PUBLIC_ANALYTICS_KEY` | Product analytics key | Vercel    | yes     |

## Pipeline & CI (GitHub Actions)

| Variable               | Purpose                                                                               | Where set | Public? |
| ---------------------- | ------------------------------------------------------------------------------------- | --------- | ------- |
| `GITHUB_TOKEN`         | Injected automatically by Actions — do **not** add it                                 | Actions   | no      |
| `GH_TOKEN`             | Local alternative for the pipeline scripts (`resolve-run.sh`, `new-run.sh`)           | local     | no      |
| `GITHUB_REPO`          | Optional `owner/repo` override for the pipeline scripts. Default: `k0d0minio/remi-ai` | local     | no      |
| `TURBO_TOKEN`          | Turborepo remote cache token — shares the cache between CI and Vercel                 | Actions   | no      |
| `TURBO_TEAM`           | Turborepo team slug (a repo **variable**, not a secret)                               | Actions   | no      |
| `SHIP_NOTE_FROM`       | From-address for the Ship stage's note (`send-ship-note.sh`)                          | local     | no      |
| `SHIP_NOTE_RECIPIENTS` | Where the ship note goes — normally one channel inbox address                         | local     | no      |

## Not wired yet

Nothing reads these today. Document the real value here the moment each is integrated:

- **Error tracking** — `SENTRY_DSN` (+ `NEXT_PUBLIC_SENTRY_DSN`). Until it exists, a production
  exception is invisible. This is the top unstarted ops item.
- **Payments** — the Verify stage's smoke checklist has a payments line that stays "not touched"
  until this exists.
