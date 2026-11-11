# Stub: new-run.sh says why it stops when the pre-commit hook fails

- lane: chore
- found-by: `preparatory-questionnaire/genotype-section` start, in a Claude Code worktree · 2026-11-11
- complexity: low
- priority: P2

## Problem

A worktree under `.claude/worktrees/` has no `node_modules`. The Husky pre-commit hook runs `pnpm -s lint-staged`, which fails there. `new-run.sh` runs `git commit -q` under `set -e`, so it stops after the stub's move with no message. The stub stays moved and not committed.

## Proposed change

Investigate. Two options: `new-run.sh` prints the commit's error and the remedy, or the hook skips when `node_modules` is absent.

## Acceptance criteria

- [ ] In a worktree with no `node_modules`, `new-run.sh` either commits the move or prints why it stopped and what to do.
- [ ] A failed run leaves the stub at its open path.
