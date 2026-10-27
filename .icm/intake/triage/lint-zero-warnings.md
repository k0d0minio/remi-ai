# Stub: lint fails on a warning, as it did in quality.yaml

- lane: chore
- found-by: legible-consulting/.github pull request 10, question 5 (Jamie took the default) · 2026-10-27
- complexity: low
- priority: P2

## Problem

`quality.yaml` ran lint with `--max-warnings=0`. Pull request 141 removed it. `check-client.yml` runs `pnpm lint` as the repo defines it, and the repo's `lint` script has no warning limit. The count of warnings on `main` is not known.

## Proposed change

Count the lint warnings on `main` in CI. Fix them, then add the zero-warning limit to the `lint` script of each package.

## Acceptance criteria

- [ ] A pull request that adds one lint warning makes `check / code` red.
- [ ] The `check / code` run on the pull request that adds the limit is green.
