# Failures: patient-documents-and-links

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

### 2026-09-24 — the post-flip verdict was first read on the previous head

- what happened: `ci-status.sh` ran straight after the ready push and reported "head d5e6599 —
  settling the full gate", one commit behind the pushed `a511db7`; its GREEN was about the wrong
  commit.
- why: GitHub had not registered the push when the script read the PR's head.
- fixed by: comparing the reported head with `git rev-parse HEAD` and re-running the call, which
  settled GREEN on `a511db7`.

## Learned rules

- After a push, check that the head `ci-status.sh` names is `git rev-parse HEAD` before trusting its verdict; re-run it when it names an older commit.
