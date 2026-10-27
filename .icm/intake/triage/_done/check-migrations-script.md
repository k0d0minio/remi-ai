# Stub: CI runs the migration-order check again on a migrations change

- lane: chore
- found-by: legible-consulting/.github pull request 10 (house stub `check-client-migration-order`) · 2026-10-27
- complexity: low
- priority: P2

## Problem

Pull request 141 removed `.github/workflows/quality.yaml`. Since then, no CI job runs `packages/services/scripts/check-migration-order.mjs`. A migration out of order can merge with no red check. Drizzle then records it as applied, and it never runs.

## Proposed change

The root `package.json` gets the script `check:migrations`. `check-client.yml` runs it when a pull request changes `packages/services/src/db/migrations/`.

## Acceptance criteria

- [ ] The root `package.json` has `"check:migrations": "node packages/services/scripts/check-migration-order.mjs"`.
- [ ] A pull request with a migration out of order makes `check / code` red.
- [ ] A pull request that does not change the migrations folder does not run the check.
