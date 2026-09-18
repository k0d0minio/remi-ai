# Stub: ENV.md says preview migrations are off — they are on, and that hid a broken build

- lane: chore
- found-by: the `reuse-and-duplicate` Build, from a red admin preview · 2026-09-18
- size: S

## Problem

[`.icm/docs/ENV.md`](../../docs/ENV.md) describes `ALLOW_NON_PRODUCTION_MIGRATIONS` as
"`true` lets a preview deploy migrate. **Unset everywhere**; an escape hatch only".

It is not unset. It was set preview-only on Vercel at the owner's request during the
`at-a-glance-page` run, and that run's own release record says so
([`runs/_done/at-a-glance-page/04_release/output/release.md`](../../runs/_done/at-a-glance-page/04_release/output/release.md)).
So **every admin preview build migrates the shared production database** — the opposite of what the
catalogue says, and the catalogue is the file a stage is told to trust.

That gap cost a build in this run, and the failure mode is worth writing down because it will recur:

1. The `reuse-and-duplicate` branch's preview applied its `0017`, creating `protocol_templates` in
   the live database.
2. `main` then landed its own `0017`, so the branch regenerated its migration as `0018` —
   correctly, per CONVENTIONS.md § "Regenerate a migration, never renumber it".
3. `0018` carries the same `CREATE TABLE`, which now collided with the table its own withdrawn
   predecessor had already created. The admin build failed at `applying migrations…`, before
   `next build` ran.

Nothing about step 2 was wrong. The trap is that a **withdrawn** migration can still have been
applied, and only to the shared database — nothing in the repo records that it ran.

## Proposed change

Correct the ENV.md row to say the variable is set on the admin project's preview environment, and
what follows from it: a preview build migrates the live database, so a branch's schema lands there
before it merges, and a migration that is later regenerated leaves the table behind.

Then say what to do about it — the repair `migrate.mjs` already prescribes in its own error text
(an idempotent follow-up migration), or dropping the orphaned object, whichever the case wants.

Whether the variable should stay set at all is the **owner's** call and is not decided here: it is
what makes a preview usable for a schema-bearing branch, and it is also what let a branch write to
the live database. This stub only makes the catalogue true.

## Acceptance criteria (rough)

- [ ] The `ALLOW_NON_PRODUCTION_MIGRATIONS` row in `.icm/docs/ENV.md` states where it is actually
      set, rather than "unset everywhere"
- [ ] The preview caveat below it says a regenerated migration can leave an already-created object
      behind in the shared database, and names the two repairs
- [ ] No change to the variable itself, to `migrate.mjs`, or to any Vercel setting — a docs fix only

## Prompt

Run `/pipeline chore env-preview-migrations-row-is-stale` in the remi-ai repo. The lane pre-seeds
from this stub and moves it to `triage/_done/` when it opens the PR. Scope is the Proposed change
and nothing wider — in particular, whether the variable stays set is the owner's decision and is
raised, not answered in code.
