# Stub: Two open PRs generated the same migration number

- lane: chore
- found-by: the `link-writes` Release production-readiness pass · 2026-09-17
- size: M

## Problem

Found in the `link-writes` Release production-readiness pass. **This is a live hazard for the
batch of PRs open right now**, not a future nicety.

Five feature PRs were cut from the same `main` (39236e0, journal at `0012`) and at least two of
them generate a migration numbered `0013`:

- #98 `link-writes` — `0013_gray_charles_xavier`, `when: 1789646871306`
- #102 `ciqual-import` — `0013_productive_kylun`, `when: 1789654036314`

plus migrations in #101 (`nutrition_rules`) and #95 (`recipes` self-reference).

`packages/services/scripts/migrate.mjs` documents the failure mode in its own header: drizzle
decides what to apply by comparing the journal's `when` against the newest applied `created_at`,
**never by hash**, so a migration whose `when` is older than one already applied is not retried —
it is silently skipped forever. A branch that merges second with an earlier-generated `when` ships
code that queries columns the database does not have.

Two entries at `idx: 13` normally collide in `_journal.json` and git raises a conflict, which is
the visible path. The dangerous path is resolving that conflict by renumbering the entry while
keeping its original `when`.

## Proposed change

Regenerate, never renumber, a migration after rebasing; add a check that fails a PR whose newest journal `when` is older than main's.

## Acceptance criteria (rough)

- [ ] Every migration-bearing PR still open after the first one merges is rebased on `main` and its
      migration **regenerated** (`pnpm db:generate`) rather than renumbered by hand, so `when` is
      later than everything already applied.
- [ ] A check — CI job or a line in `CONVENTIONS.md` § the factory — that fails a PR whose newest
      journal `when` is older than `main`'s newest, so this cannot be resolved wrongly by hand
      again.

## Prompt

Run `/pipeline chore parallel-migrations-journal-ordering` in the remi-ai repo. The lane pre-seeds from this stub and moves it to `triage/_done/` when it opens the PR. Scope is the Proposed change and nothing wider; a question left open above is raised, not answered in code.
