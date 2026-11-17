# Handoff rem-13

## Next action

The operator tests the preview and ticks Ready to merge. Then Release merges.

## How to test

Open the preview of the app and sign in: the app works as before. Open the pull request: each check is green, and the folder `.icm/_system/` is there. After the merge, open the test site: it has the same pages as before.

## What changed, and why no user sees it

- The repo has the BAXTER blueprint 1.0.0-rc12 in `.icm/_system/`. The pipeline of before left in the same change.
- No file of an app changed, but one line of `apps/admin/package.json`: the build calls the same script at its new path, `.icm/local/vercel-build.sh`.
- `ci.yml` and `promote.yml` are the workflows of the blueprint. `icm.yml` has the gate. `gate.yml` and the pull request template left.

## Blockers

- none

## Operator

1. `.icm/setup/` has five files, one for each act of a person. Tick the boxes of the acts that are done (Vercel uat, the promote secrets, the GitHub checks, Dependabot).
2. The four `apps/*/vercel.json` keep `ignoreCommand` (turbo-ignore). `.icm/setup/vercel-uat.md`, step 7, removes it after the Vercel setting is on.
3. The promote workflow of the blueprint does not migrate production, because the answer is `database: none`. Production moves to Postgres 18 at the next promotion (Jamie, 2026-11-17). Before that promotion, answer `database: postgres` and do `.icm/setup/databases.md`.
4. The 111 markdown stubs of the backlog stay in `.icm/intake/`. `.icm/local/ROUTES.md` says how one becomes a Linear ticket.

## Not verified

- `promote.sh` and `rollback.sh` of the blueprint did not run against the real Vercel.
- The hooks of the blueprint in a session of this repo (the router, the session start). This run was done from a session of a different folder.

## Do not touch

- none
