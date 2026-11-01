# Stub: The web build does not follow the migration rule's monorepo shape

- lane: chore
- found-by: the setup verification of 2026-10-31 · 2026-10-31
- complexity: medium
- priority: P1

## Problem

`.icm/database/CONTEXT.md` § The migration rule says that each app that reads the database
calls `vercel-build.sh` from its `vercel.json` `buildCommand`, and that `db:migrate` holds a
Postgres advisory lock. In this repository `apps/admin/package.json` calls the script from its
`build` line, `apps/web/package.json` has `next build` and calls nothing, no app has a
`vercel.json`, and `migrate.mjs` holds no lock. So no `app` build log ever shows the
`[vercel-build]` line, and the `uat` and preview builds of `app` never migrate. Today the admin
build migrates the shared branch for both, and the two builds run at the same time.

## Proposed change

Decide whether one migrator per base is the rule (then write it in
`.icm/database/CONTEXT.md` and the setup stubs, and keep `apps/web` on `next build`), or follow
the contract: a `vercel.json` per app with the `buildCommand`, and the advisory lock in
`migrate.mjs`.

## Acceptance criteria

- [ ] `.icm/database/CONTEXT.md` and `apps/web/package.json` agree on whether the `app` build migrates.
- [ ] If both apps migrate, `db:migrate` holds an advisory lock for the whole run.
