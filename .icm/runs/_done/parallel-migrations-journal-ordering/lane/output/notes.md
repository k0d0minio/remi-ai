# Chore: parallel-migrations-journal-ordering

- invariant: no runtime behaviour changes for any persona — no schema change, no migration, no
  app code touched. What differs is that CI now fails a PR whose new migrations were generated
  before something `main` already carries, and the rule that prevents it is written down.
- change: `.github/workflows/quality.yaml`: a `Migration order` step in the required
  `Format, lint, typecheck` job, on pull requests only. It runs
  `packages/services/scripts/check-migration-order.mjs` (new) against a shallow-fetched base ref.
  The step sits before `Install dependencies` because it needs neither pnpm nor `node_modules` —
  plain node and git — so it is the cheapest thing on the branch to fail.
- change: `CONVENTIONS.md` § the factory: a `Migration order` row in the checks table and the
  rule the check enforces — **regenerate, never renumber** — with why drizzle makes renumbering
  fatal.
- change: `.icm/_shared/project-rules.md` § The factory: the description of what the required
  job runs now names the new step, so the record of the factory stays true.
- rollback: revert the commit. Nothing is stateful — no migration, no env var, no schema. The
  check is a CI step and a script file; deleting both restores the previous behaviour exactly.

## Why a step in the required job, not a job of its own

`main`'s ruleset requires one check, `Format, lint, typecheck`. A second job would produce a
second check run that branch protection does not require, so it could go red without stopping a
merge — which is the one thing this check exists to do. A step inside the required job blocks,
needs no `required_checks` edit and no ruleset change.

## What the check does

Compares the branch's `_journal.json` against the base branch's, matching entries **by tag rather
than by idx** — renumbering an entry is exactly the move being caught, so an entry whose number
changed reads as new and is judged on its `when` like any other. Every entry the branch adds must
carry a `when` later than the newest on the base. Anything else exits 1 naming the offenders and
the remedy.

Six paths were exercised by hand against the real journal and synthetic ones before the push:
no new migrations (pass) · a new migration generated after the base's newest (pass) · a new
migration generated before it (fail) · an entry renumbered by hand with its original `when` kept
(fail) · an unresolvable base ref (fail loudly rather than pass silently) · `--base` with no
value (fail). The working-tree journal was restored unmodified afterwards.

## Raised, not answered

- **The stub's first acceptance criterion is moot, and was not acted on.** It asked that every
  migration-bearing PR still open after the first one merged be rebased and its migration
  regenerated. There are no open PRs in the repository now: #98, #101, #102 and #95 all merged,
  and `main`'s journal carries `0013`–`0016` with strictly increasing `when`
  (1789646871306 → 1789661806329 → 1789663220584 → 1789721916683). The ordering hazard the stub
  described did not land. Nothing to rebase, so nothing was pushed for it — and a lane PR could
  not have touched other branches anyway.
- **This check cannot see the case where the branch has not merged `main` in yet.** On a
  `pull_request` event GitHub checks out the merge commit, so the journal read is the merged
  result. Two branches appending to `entries` conflict textually, the merge commit does not
  exist, and the PR is visibly unmergeable — the "visible path" the stub describes, which needs
  no check. What this step adds is the path after the conflict is resolved: a renumbered entry
  with its original `when` merges cleanly and is caught here.
- **No unit test.** `packages/services/scripts/` carries four scripts and no tests; adding a
  vitest file for an `.mjs` script would be a new pattern for this repo, so the verification
  above was done by hand instead. Worth settling as a convention rather than deciding inside a
  chore.
