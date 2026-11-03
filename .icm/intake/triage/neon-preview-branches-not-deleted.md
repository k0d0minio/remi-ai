# Stub: Neon deletes the preview branch of a merged pull request

- lane: chore
- found-by: patient-file-creation/appointment-date, the failed `admin` and `app` previews · 2026-11-03
- complexity: low
- priority: P0

## Problem

The Neon project `uat-remi-ai` holds 10 branches, the plan's cap. Six are `preview/<git branch>` of merged pull requests whose git branch is deleted: #166, #167, #168, #169, #170 and #172. The integration did not delete them. Each new pull request gets no preview database, and its `admin` and `app` previews fail.

## Proposed change

Investigate why the Neon integration keeps the branch after the git branch deletion. Delete the stale branches. Make the deletion automatic, or raise the cap.

## Acceptance criteria

- [ ] `uat-remi-ai` holds no preview branch of a deleted git branch
- [ ] A new pull request gets its `preview/<git branch>` and a green `admin` preview
