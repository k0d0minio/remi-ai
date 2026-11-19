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

Since 2026-11-19 each open stub has its Linear ticket. `.icm/intake/LINEAR.md` has the map and the
limits of work in parallel. Thus step 1 is done for these stubs. Steps 2 to 4 stay.

`.icm/intake/README.md` has the order of the epics and each decision (D-1 to D-37).

## The database

`.icm/local/database.md` has the rule for the databases of today: one Neon branch for each
preview, and a migration at the build of `admin`. `.icm/local/vercel-build.sh` is that build
step. The two files leave when the repo answers `database: postgres` to the blueprint.
