# Routes of this repo

Language: en

These routes are in addition to `.icm/_system/ROUTER.md`. They belong to this repo.

## The markdown backlog of before 2026-11-17

Before the BAXTER blueprint, a ticket of this repo was a markdown stub: `.icm/intake/<epic>/<slug>.md`
with a `breakdown.md` for each epic, and `.icm/intake/triage/<slug>.md`. A finished stub is in a
`_done/` folder. On 2026-11-17 the repo had 68 open stubs in 27 epics and 43 open triage stubs.

A ticket is now a Linear key of the team `REM`. A stub is not a ticket.

1. To work on a stub, the operator asks BAXTER for its Linear ticket. BAXTER makes it from the
   stub: the title, the four sections, and the path of the stub.
2. Start the work with the Linear key, as the router says.
3. In the pull request of that ticket, move the stub into its `_done/` folder.
4. Do not start a run from a stub path: the blueprint of this repo refuses it.

`.icm/intake/README.md` has the order of the epics and each decision (D-1 to D-37).

## The database

The repo answers `database: postgres` to the blueprint since REM-154 (2026-11-27). The rule
is `.icm/_system/features/database.md`, and the setup is `.icm/setup/databases.md`. The
admin app migrates: its `vercel.json` builds the packages with turbo, then its script
`vercel-build` runs `db.sh build` (the migration, then `next build`). The other apps only
build.
