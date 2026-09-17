# Build notes: ciqual-import

- commits: see the branch — schema + migration, parser, query service, scripts + fixture, console
  surface, decisions page
- ci: GREEN on 3036e0e — every blocking check and all six Vercel deploys, admin included

## What changed

- `packages/services/src/db/schema.ts` — `foods`, `food_nutrients`, `ciqual_imports`, plus an index
  on `food_nutrients.component_code`. Migration `0013_flowery_miss_america.sql` generated with
  `pnpm db:generate`; re-running it reports « No schema changes », so schema and migrations agree.
- `packages/services/src/db/services/foods/ciqual.ts` — the parser. Pure functions over XML text,
  no filesystem and no driver, so every normalisation decision is unit-testable rather than
  reachable only through a 75 MB import.
- `packages/services/src/db/services/foods/index.ts` — the query service: `searchFoods`,
  `getFoodNutrients`, `rankFoodsByComponent`, `listFoodGroups`, `getCiqualImport`.
- `packages/services/src/shared/nutrition.ts` — the twelve-entry recommendation-to-component map
  and the shared text normaliser. `formatNumber` joined `shared/format.ts` with two consumers.
- `packages/services/scripts/` — `ciqual-source.mjs` (find and checksum an export),
  `ciqual-import.mjs` (upsert it), `ciqual-fixture.mjs` (derive the committed subset).
- `packages/services/src/db/fixtures/` — `ciqual-subset.json` (111 real foods, 8 214 values,
  312 KB), its `LICENCE.md`, and the loader the tests use.
- `apps/admin` — the home line, `/aliments` and `/aliments/[code]`, the filters island, the
  attribution component, the nav row.
- `apps/docs/app/technical/decisions/page.mdx` — the edition, the DOI and the Etalab terms.

## Three things worth knowing

**The seam was enough.** `Collection.findMany` takes an exact-match filter and nothing else, which
looked like it would force either a seam change or a denormalisation. It forced neither: a rank is
one component code's column (3 484 rows of 257 816) and a lookup is one food's seventy-four, so
both are exact-match filters. Group and component names are denormalised onto the rows that
display them, because the seam has no join — that is the seam's shape, not a shortcut.

**The importer reaches the driver directly, and says so.** 257 816 rows through
`Collection.insert` over Neon's HTTP driver is one request per row. `scripts/ciqual-import.mjs`
batches multi-row upserts against the driver, exactly as `scripts/migrate.mjs` already does and for
the same reason: it is a maintenance script, not a service, and nothing in an app can reach it. The
services under `db/services/` still speak only to the seam, which the in-memory tests prove.

**One real quirk in the published data.** Food 24999, « Dessert (aliment moyen) », carries group
code `00`, which CIQUAL's own group file never defines. The importer records that faithfully rather
than inventing a name; `listFoodGroups` leaves it out of the filter (there is nothing to render)
and the food stays searchable. There is a test for it.

## Verified here

- **The parse, on the real export.** `pnpm ciqual:import <dir> --dry-run` against the genuine
  Ciqual 2025 files: **74 components, 3 484 foods, 257 816 nutrient rows** — exactly the published
  figures. The marker histogram matches the source counted independently: `exact` 151 981,
  `not_determined` 83 246, `less_than` 20 075, `traces` 2 514. Two seconds for the 69 MB file.
- **`pnpm ciqual:fixture`** run against the same export; the committed subset is its output.
- **249 tests pass** (`pnpm test`), 48 of them new.
- **`pnpm db:generate`** reports no drift.
- **The admin preview builds**, and its `db:migrate` step applied `0014` to the database.

## The migration failure, and what it cost

The first admin preview build failed, and it is worth recording why rather than only that it was
fixed. `migrate.mjs` reported all three tables applied and absent, and refused to let the build
pass — the verification step added after the same failure cost two days in production.

The cause is the one that script's own header describes. Drizzle decides what to apply by comparing
a journal entry's timestamp against the newest `created_at` in `drizzle.__drizzle_migrations`,
**never by hash**. This branch's migration was generated at 12:05:30Z; the database's mark already
stood at **12:07:51Z**. So it was recorded as applied, its SQL never ran, and drizzle would never
have revisited it.

The mark turned out to belong to `link-writes` (#98): its `0013_gray_charles_xavier` carries
`when: 1789646871306`, exactly the mark, and it merged to main two minutes after this branch's
migration was generated. Merging main in confirmed it — and conflicted, because both branches had
added a `0013` and both had appended a table to `schema.ts`. Both tables are kept; the migration is
**regenerated as `0014_broad_shinobi_shaw`** rather than renumbered by hand, which is what
`.icm/intake/triage/parallel-migrations-journal-ordering.md` — filed from that release pass, naming
this PR — asks for.

It keeps `IF NOT EXISTS`, and now necessarily so: the first repair attempt did create the three
tables, in the database production shares, from this branch's preview. A plain `CREATE` would fail
there. As of `3036e0e` the database holds 17 applied migrations with `0014` as the newest, and
`foods`, `food_nutrients` and `ciqual_imports` exist with 11, 11 and 7 columns — all three empty.

**That a preview deploy could write to that database at all is a separate defect**, and the half
the sibling stub does not cover: `migrate.mjs`'s non-production guard did not fire.
`.icm/intake/triage/preview-deploys-migrate-production.md` is that stub.

## Not verified here — four criteria need a database and a signed-in pass

Left **unticked on the PR** rather than claimed. Two need rows written:

- the import landing 3 484 / 257 816 rows and writing the `ciqual_imports` row;
- re-running it leaving every row unchanged.

Both hold by construction — `foods.code` and `(food_code, component_code)` are unique constraints
and every write is `insert … on conflict (…) do update` — but construction is an argument, not an
observation. **Run `pnpm ciqual:import <dir>` twice before ticking Ready to merge.**

Two more cannot be true until that import has run, because they describe what the console shows:
the home's « N aliments importés » line, and `/aliments` listing anything.

One further note: the criterion about the db-layer coverage floor is ticked on the strength of 48
new tests over the new code, not on a measurement — there is no coverage gate in CI yet
(`CONVENTIONS.md` says the harness arrives with the first db adapter PR, and it has not).

## A change outside the spec, for you to decide on

`.claude/hooks/block-local-checks.sh` now lets exactly five commands through: `pnpm packages:build`,
`pnpm ui:build`, `pnpm services:build` and the two `--filter` forms. Everything else — lint,
typecheck, format, any app build — stays blocked. The reason is that the package scripts import
`@remi/services` from `dist/`, so a session that cannot build the package cannot run them at all;
producing an artifact the next command consumes is not the same act as asking the factory « does it
compile ». You authorised it in this session.

Two things to weigh at Release: it is outside this spec's `touches:`, and `.prettierignore`
describes `.claude/` as kept byte-identical to the icm-board template, which this diverges from.
Dropping the commit costs nothing but the next session's ability to run the CIQUAL scripts.

## Notes for Release

- **What to smoke-test, signed in to the admin preview:** the home line (both states — before any
  import it should read « Table CIQUAL non importée »), `/aliments` search with and without
  accents, the group filter, a food's full composition page, and that `traces`, `< x` and « — »
  render as themselves rather than as numbers. Sign out and confirm `/aliments` is unreachable.
- The import must run against the database before any of that shows real rows. The tables are
  there and empty as of `3036e0e`.
- The licence attribution is a condition of use, not decoration: it appears on the home line, both
  `/aliments` pages and the decisions page. If a surface loses it, that is a blocker.
- Open question carried from the stub, unchanged: which components Morgane wants beyond the twelve.
