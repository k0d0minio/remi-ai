# Stub: § Order names the epic genotype-macro-split

- lane: chore
- found-by: the `gate / contract` check on the blueprint v1.0.2 conformance pull request · 2026-10-28
- complexity: low
- priority: P1

## Problem

`.icm/intake/README.md` § Order has no line for the open epic `genotype-macro-split`. The `gate / contract` check fails on every pull request until it has one.

## Proposed change

Put `genotype-macro-split` after the recipe and analysis epics, as number 30, before `triage` (Jamie, 2026-10-28).

## Acceptance criteria

- [ ] § Order names `genotype-macro-split` as 30, and `triage` as 31.
- [ ] The `gate / contract` check is green.
