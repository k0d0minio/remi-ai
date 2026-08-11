# REMI-016 · Write the rollback runbook

|                |                                                      |
| -------------- | ---------------------------------------------------- |
| **Type**       | chore (documentation)                                |
| **Priority**   | P2 — the signal it can't wait is the first real user |
| **Size**       | An hour                                              |
| **Depends on** | —                                                    |
| **Blocked by** | —                                                    |
| **Sources**    | audit F-24                                           |

## Problem statement

A bad deploy tonight would be handled by whoever notices, improvising between Vercel's
instant-rollback button and a git revert — with six apps to reason about and nothing written
down. Rollback is mentioned exactly once in the repo, in passing.

## Required steps

1. Write a half-page runbook: where Vercel's instant rollback is per project; when to roll back
   vs. when to `git revert` (and how the six-app split changes the calculus — a bad shared-package
   change fans out to all six); what to check after (the affected app's key pages, error tracker,
   analytics); who to tell.
2. Home it where operational docs live (`docs/` next to ENV.md, or the docs app's technical
   section — follow the repo's routing conventions, one home only) and link it from the routing
   layer (CLAUDE.md's "where the rules live" or the pipeline's ship-stage contract, wherever a
   deployer would look).
3. Keep it honest: document what exists today, not aspirations (no invented alerting steps —
   reference REMI-009's tracker only if it has landed).

## Acceptance criteria

- [ ] A person who has never deployed this repo can execute a rollback from the runbook alone.
- [ ] The runbook is reachable from the routing docs and stated in one place only.

## Agent prompt

```text
Work in the remi-ai monorepo. Read CLAUDE.md ("Where the rules live"), CONVENTIONS.md, then
.icm/docs/audit-report.md finding F-24, plus pipeline/lanes/chore/CONTEXT.md:58-64 and
pipeline/stages/06_ship/CONTEXT.md to see where deployment knowledge currently lives.

Task: write the rollback runbook.
1. Create docs/ROLLBACK.md (half a page, concrete): per-app Vercel instant-rollback steps; the
   revert-instead decision rule (bad change in a shared package → revert, because all six apps
   rebuilt; bad change in one app → the button); post-rollback checks (app's key routes, the
   error tracker if REMI-009 landed, otherwise Vercel logs); and the note that a rollback does
   not undo the commit — the fix still has to land through a PR.
2. Link it once from the routing layer (CLAUDE.md's routing list) and once from the Ship stage
   contract if that is where deployers look — pointers, not restatements, per the repo's
   single-home rule.
3. Verify every claim against reality (project names, where the button is) rather than writing
   generic Vercel docs; mark anything you cannot verify as "verify on first use".
Push a feature branch and open a PR.
```
