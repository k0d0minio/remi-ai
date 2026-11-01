# Stub: A regenerated migration does not break the branch's preview database

- lane: chore
- found-by: `preparatory-questionnaire/questionnaire-fields` pull request · 2026-11-01
- complexity: low
- priority: P1

## Problem

A branch pushes a migration, and the admin preview applies it on `preview/<git branch>`. Then `main` gains a migration with the same number. CONVENTIONS.md says: merge `main`, delete the branch's migration, run `db:generate` again. The preview branch still records the first migration, with the later `when`. Drizzle then skips the migration from `main` on that branch. It runs the regenerated one again, and the build fails on an object that exists. Seen on 2026-11-01: `0026_questionnaire_fields` was applied, then regenerated as `0027`, and the `admin` preview failed.

## Proposed change

Add one step to CONVENTIONS.md § Regenerate a migration: after the regenerate, reset `preview/<git branch>` from its parent in Neon, then push. Name who does the reset.

## Acceptance criteria

- [ ] CONVENTIONS.md names the reset of the preview branch as a step after a regenerated migration
- [ ] The step says who resets the branch and where
