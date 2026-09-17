# Stub: a preview deploy migrated the production database, and the guard that exists to stop it did not fire

- feature-slug: preview-deploys-migrate-production
- lane: bug
- priority: P1
- sibling: [`parallel-migrations-journal-ordering`](parallel-migrations-journal-ordering.md) covers
  the **ordering** hazard between parallel PRs. This stub is the other half: how a preview deploy
  got write access to the production schema at all. Neither fixes the other.
- found-by: the `ciqual-import` run, 2026-09-17
- sources: `packages/services/scripts/migrate.mjs` § the non-production guard · `.icm/docs/ENV.md`
  § Preview caveat · `turbo.json` § globalEnv · the admin build logs for `59ff78a` and `c77ef7f`

## What this is

`migrate.mjs` refuses to migrate when `VERCEL_ENV` is set to anything but `production`, unless
`ALLOW_NON_PRODUCTION_MIGRATIONS=true`. The guard was added after the 2026-09-02 incident.

**On this branch's admin preview builds it did not fire.** The log goes straight from
`> node scripts/migrate.mjs` to drizzle-kit reading `drizzle.config.ts` — no refusal warning — and
drizzle then ran against the database production uses. On the `c77ef7f` build it created three
tables there, from an unmerged branch. They are in production now:

```sql
select table_name from information_schema.tables
 where table_schema = 'public'
   and table_name in ('foods', 'food_nutrients', 'ciqual_imports');
```

Both variables are in `turbo.json`'s `globalEnv`, and Vercel's own "missing from turbo.json"
warning in that build lists the `POSTGRES_*` / `PG*` / `NEON_*` names but **not** `VERCEL_ENV`. So
either `VERCEL_ENV` is not set in the environment the turbo task spawns, or
`ALLOW_NON_PRODUCTION_MIGRATIONS=true` has been set on the admin Vercel project — `.icm/docs/ENV.md`
says it is « Unset everywhere », which would then be stale. Neither was confirmed: that session had
no access to the `remi21` Vercel scope.

## Why it matters more than the ordering hazard

The sibling stub's failure mode is loud — a conflict in `_journal.json`, or a build that fails on
`migrate.mjs`'s verification step, which is what caught `ciqual-import`. This one is silent. A
preview of any open branch can reshape the production schema, and the only reason anyone noticed
is that the tables were created by a branch that had not merged.

It also makes the ordering hazard worse: every preview that migrates advances the high-water mark
the sibling stub is about, so the race it describes is run far more often than merges alone would.

## Proposed change

1. **Establish which of the two causes it is.** Read the admin project's environment in Vercel: is
   `ALLOW_NON_PRODUCTION_MIGRATIONS` set, and is `VERCEL_ENV` visible to the turbo task? One
   screen, and everything else depends on the answer.
2. **Make the guard fail closed.** It currently reads an absent `VERCEL_ENV` as "not on Vercel, so
   this is a developer's own database — go ahead". On Vercel that reasoning inverts: absent means
   the variable did not arrive, and migrating is the dangerous branch. Prefer refusing when
   `VERCEL` is set and `VERCEL_ENV` is not `production`, or require a positive signal to migrate.
3. **Give previews their own database.** `.icm/docs/ENV.md` already names this as the real answer and
   the other two as interim. A Neon branch per preview ends both this and the shared-mark problem,
   and would let a branch's new tables be exercised on its own preview — which `ciqual-import`
   could not do.
4. **Decide what to do about the three tables already there.** They are empty and their migration
   is `0014_broad_shinobi_shaw`, written `IF NOT EXISTS` so it no-ops when that PR merges. Leaving
   them is harmless; the point is that nobody chose it.

## Acceptance criteria (rough)

- [ ] It is written down which of the two causes let the preview migrate, with the evidence
- [ ] A preview deploy provably cannot migrate the production database — demonstrated, not argued
- [ ] The guard fails closed when `VERCEL_ENV` is absent on a Vercel build
- [ ] `.icm/docs/ENV.md` § Preview caveat matches what is actually configured
- [ ] The three tables created ahead of their merge are either kept deliberately or dropped
