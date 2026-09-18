# Stub: One dropped Neon connection fails the whole admin deploy

- lane: chore
- found-by: PR #95's failed preview deploy · 2026-09-17
- size: S

## Problem

`pnpm db:migrate` runs at the front of the admin app's build, and a single dropped connection to
Neon fails the whole deploy with no retry. It did exactly that on PR #95, deployment
`dpl_56dDaKVdVu4nv1jFuQLNRe9623bR`:

```
Using '@neondatabase/serverless' driver for database querying
[⣷] applying migrations...
Error: Connection terminated unexpectedly
    at Sn.<anonymous> (@neondatabase/serverless/index.mjs:1010:76)
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @remi/services@1.0.0 db:migrate
```

`next build` never ran. The same commit's other five previews passed, and the identical migration
set had applied cleanly on the previous commit of the same branch against the same database an
hour earlier — so nothing was wrong with the migration or the schema. The websocket simply went
away, most likely a Neon compute waking from auto-suspend.

The cost is disproportionate: a red required check on a PR whose code is fine, and a human
round-trip to work out that the failure was never about the diff. It will recur, because nothing
about it was specific to this PR.

## Proposed change

Retry connection-level failures of the migrate step and its verification query with a short backoff; never retry a migration that genuinely failed to apply.

## Acceptance criteria (rough)

- [ ] A connection-level failure of `drizzle-kit migrate` is retried (a small number of attempts,
      with backoff) instead of failing the build on the first drop.
- [ ] The verification query in `scripts/migrate.mjs` is guarded the same way.
- [ ] A non-connection failure — a migration that genuinely fails to apply — still fails the build
      on the first attempt, loudly, and is never retried into an out-of-order apply.
- [ ] The retry says what it is doing in the build log, so a slow deploy is explainable.
- [ ] The `turbo.json` / Vercel environment-variable mismatch above is either fixed or recorded in
      `.icm/docs/ENV.md` as deliberate.

## Notes

- Two separate connections are made, and **both** are unguarded: `drizzle-kit migrate` (websocket
  driver, via `drizzle.config.ts`) and then the verification query in `scripts/migrate.mjs`, which
  opens its own `neon()` HTTP connection to check the snapshot's tables are present.
- The retry has to be careful, not blanket. `migrate.mjs`'s own header explains why: drizzle
  decides what to apply by comparing the journal's `when` against the newest applied `created_at`,
  never by hash, so a migration that lands out of order is lost rather than retried. A retry is
  safe for a **connection-level** failure (nothing was applied) and unsafe as a general
  "run it again if it exited non-zero". Match on the connection error, not on the exit code.
- A backoff of a few seconds is likely enough if the cause is a compute wake; Neon's docs describe
  cold starts in the low seconds.
- Worth checking at the same time: the build log warns that a long list of Neon integration
  variables (`PGHOST`, `POSTGRES_URL`, `DATABASE_URL_UNPOOLED`, …) are set on the Vercel projects
  but absent from `turbo.json` `globalEnv`, so they are not passed through. `DATABASE_URL` **is**
  listed and is the one the scripts read, so this is noise today — but it is the kind of noise
  that hides a real missing variable later. Either add them or confirm in `.icm/docs/ENV.md` that
  they are deliberately unused.

## Prompt

Run `/pipeline chore db-migrate-connection-retry` in the remi-ai repo. The lane pre-seeds from this stub and moves it to `triage/_done/` when it opens the PR. Scope is the Proposed change and nothing wider; a question left open above is raised, not answered in code.
