# REMI-009 · Execute the estate decision: retire demo and support, keep the rest

> **Decision made (Jamie, 2026-08-27):** keep the product (`apps/web`), the
> practitioner-facing surfaces when their phase comes, `apps/marketing`,
> `apps/docs`, and `apps/admin` (REMI-035 builds on it). **Retire `apps/demo` and
> `apps/support` for the time being** — parked, reversible, not deleted.

|                |                                                                                           |
| -------------- | ----------------------------------------------------------------------------------------- |
| Status         | ready                                                                                     |
| **Type**       | chore — executing a made decision                                                         |
| **Priority**   | P1                                                                                        |
| **Size**       | Half a day                                                                                |
| **Depends on** | —                                                                                         |
| **Blocked by** | —                                                                                         |
| **Sources**    | Status report Phase A bullet 3 and Part two · `.icm/docs/braindump/roadmap/priorities.md` |

## Problem statement

Six deployed apps — product, marketing, admin, docs, support, demo — is a heavy surface for a
self-funded project capped around €10k whose stated priority №1 is _simplifier radicalement_. Each
one is a Vercel project, a deployment to keep green, a set of environment variables, and a surface
that can drift from the others.

The decision is now made (header note, 2026-08-27): keep `web`, `marketing`, `docs` and `admin`;
park `demo` and `support` — reversible, not deleted. What remains is the execution.

## Required steps

1. Park `apps/support`, then `apps/demo` — one PR per app so each is independently revertible:
   pause the Vercel deployment or enable deployment protection (list the exact dashboard actions
   for the owner where a token cannot perform them), and mark the app's README/AGENTS.md as
   parked with the way back.
2. Delete nothing. Both apps stay in the repo and keep compiling in CI — parked, not gone.
3. Record in each PR what parking costs — the support centre's public help content, and
   `apps/demo`'s role as the Design stage's sandbox — and flag the pipeline Design-stage
   contract question to the owner rather than rewriting `pipeline/` here.
4. Update `.icm/docs/ENV.md` if any variable or deployment note changes.

## Open questions — flag these on pickup

- **Is `apps/demo` still the Design stage's sandbox?** Parking it changes the pipeline's Design
  stage contract, which is not this ticket's to rewrite — flag it, with a proposed one-line
  amendment, in the parking PR.
- _(Resolved 2026-08-27: the admin console is kept — REMI-035 builds on it. The
  practitioner-space question moved to the parked practitioner phase.)_

## Acceptance criteria

- [ ] `apps/demo` and `apps/support` are parked (undeployed or protected), one revertible PR each.
- [ ] Nothing is deleted; both apps still compile in CI.
- [ ] Each PR records what parking costs and how it is reversed; the Design-stage sandbox
      question is flagged to the owner, not settled here.
- [ ] `.icm/docs/ENV.md` reflects any deployment or variable change.

## Agent prompt

```text
Work in the remi-ai monorepo. Read CLAUDE.md, then this ticket's header note — the estate
decision is made (2026-08-27): keep web, marketing, docs, admin; park demo and support.

Task: execute the parking, one PR per app so each is independently revertible.
1. Park apps/support, then apps/demo: pause or protect the Vercel deployment (list the exact
   dashboard actions for the owner where a token cannot perform them), and mark the app's
   README/AGENTS.md as parked with the way back.
2. Delete nothing; both apps stay in the repo and keep compiling in CI.
3. In each PR body, record what parking costs (support's public help content; demo's role as
   the Design stage's sandbox) and flag the pipeline Design-stage contract question to the
   owner — do not rewrite pipeline/ contracts in these PRs.
Do not run build/lint/typecheck/format locally. Push a branch per app, open the PRs, and git mv
this ticket into .icm/intake/_done/ in the second PR.
```
