# Handoff rem-14

## Next action

The operator ticks Ready to merge. Then Release merges.

## How to test

Open the pull request. Three files changed, all in the folder of the blueprint: the version, the manifest and the release script. Each check is green.

## What changed, and why no user sees it

- `.icm/_system/` has the BAXTER blueprint 1.0.0-rc13. `blueprint/bin/update-repo.sh` made the change.
- `release.sh` waits until GitHub shows the close-out commit on the pull request, then reads the checks. Before, it read the checks of the commit before, and the merge stopped (pull request 206).
- No file of an app and no workflow changed.

## Blockers

- none

## Do not touch

- none
