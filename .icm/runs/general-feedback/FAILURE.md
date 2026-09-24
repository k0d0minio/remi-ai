# Failures: general-feedback

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

### 2026-09-24 — CI never started on a pushed head

- what happened: `ci-status.sh` sat `PENDING` for 900 s with `Format, lint, typecheck` never registered; no workflow ran for the push at all.
- why: `patient-documents-and-links` (#122) had merged into `main` meanwhile and the PR conflicted with it — GitHub runs no `pull_request` workflow on a PR it cannot merge. D-33 had predicted the migration clash.
- fixed by: merging `main` (fef3101) and regenerating this branch's migration as `0022` on the merged tree.

### 2026-09-24 — the ready head built no preview

- what happened: the full gate settled `GREEN` on e8ed21f with every Vercel project `Canceled by Ignored Build Step` — no preview for the smoke; every earlier head was the same.
- why: `turbo-ignore --fallback=HEAD^1` compares a push's head with its parent when the branch has no successful deployment yet, and every pushed head after the code landed was an `.icm/`-only commit. `Ready to merge` was ticked before any preview of this code existed.
- fixed by: merging `main` (#123, lockfile + app manifests) and keeping that merge commit as the pushed head (f844131) — every project then built.

## Learned rules

- Before a push that should produce previews, make sure its head commit touches app or package code against its parent — fold `.icm/` run-file updates into the code commit rather than pushing them on top, or the Vercel ignore step skips every project.
- A PR that sits `PENDING` with its required check never registered is first a merge-conflict question: check `mergeable` before re-running anything.
