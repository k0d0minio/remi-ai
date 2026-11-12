> Done: Jamie, 2026-11-01

# Setup: GitHub deletes the head branch after a merge

- setup-slug: github-delete-head-branches
- needs: database neon
- where: GitHub → the repository → Settings → General → Pull Requests

## Why

`neon-preview-cleanup.yml` deletes a preview's Neon branch when its pull request closes, and
each day deletes each preview branch whose git branch is gone. A head branch that stays after
the merge keeps its Neon branch until the pull request closes, so GitHub must delete it.

## Steps

1. Open Settings → General.
2. Under Pull Requests, turn on "Automatically delete head branches".

## Done when

- [ ] After a merge, the head branch is gone from GitHub.
- [ ] Its Neon branch `preview/<git branch>` is gone from the Neon project. The run of
      `neon-preview-cleanup.yml` on the close deletes it.
