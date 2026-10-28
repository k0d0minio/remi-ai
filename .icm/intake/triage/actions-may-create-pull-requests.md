# Stub: GitHub Actions may create the release pull request

- lane: chore
- found-by: the readiness check of 2026-10-28 · 2026-10-28
- complexity: low
- priority: P0

## Problem

The `release` job of `ci.yml` fails on every push to `main` with « GitHub Actions is not permitted to create or approve pull requests ». The repository setting `can_approve_pull_request_reviews` is `false`. release-please cannot open the release pull request, so no batch exists and `ci` on `main` is red since 2026-10-27.

## Proposed change

Jamie ticks « Allow GitHub Actions to create and approve pull requests » under Settings → Actions → General → Workflow permissions. No file changes.

## Acceptance criteria

- [ ] `gh api repos/k0d0minio/remi-ai/actions/permissions/workflow` returns `"can_approve_pull_request_reviews": true`.
- [ ] The next push to `main` runs `release / release-please` green and the release pull request exists.
