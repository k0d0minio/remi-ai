# Failures: check-in-and-progression

The run's retrospective — what cost a turn, and the rule that would have prevented it. Two
files share this job and split it cleanly: `error.log` (in the stage's `output/`) is the ledger
of errors a **tool** reported, written verbatim at the moment of the fix with its `- resolved:`
and `- rule:` lines, which `retrospective.sh` reads and counts across runs; **this file** is
what the run as a whole learned — a wrong assumption, a STOP, a skipped step, a gate that
blocked, a plan that had to be rewritten — which no tool ever logged. On close-out the
`## Learned rules` bullets below are copied into `_shared/project-rules.md` → Learned rules
(`run-pack.sh <slug> --sync-rules`, called by `close-out.sh`, the same shape as
`retrospective.sh --apply`), so the next run in this repo starts with them. Keep the rules
general; keep the retrospectives specific; never restate an `error.log` entry here.

## Retrospectives

### 2026-09-24 — Release reviews read a stale base

- what happened: `/code-review main...HEAD` reported a finding in `challenge-section.tsx`, a file
  this run never touched, and `/security-review` failed on `origin/HEAD...` (unknown revision).
- why: a cloud session's local `main` is the clone-time ref, far behind `origin/main`, and the
  clone sets no `origin/HEAD`.
- fixed by: triaging the stray finding as not this ticket's (already covered by
  `triage/challenge-writes-double-submit.md`) and `git remote set-head origin main` before the
  security review.

## Learned rules

- Run the Release reviews against `origin/main...HEAD` (and `git remote set-head origin main` first in a cloud session) — the local `main` ref is stale and widens the review to other runs' code.
