# REMI-009 · Decide how much of the six-app estate survives

|                |                                                                                           |
| -------------- | ----------------------------------------------------------------------------------------- |
| Status         | blocked — owner decision                                                                  |
| **Type**       | decision-support                                                                          |
| **Priority**   | P1 — Phase A; cheap to defer, expensive to keep paying for                                |
| **Size**       | Half a day of analysis, then whatever the decision costs                                  |
| **Depends on** | —                                                                                         |
| **Blocked by** | An owner decision — this ticket prepares it, it does not make it                          |
| **Sources**    | Status report Phase A bullet 3 and Part two · `.icm/docs/braindump/roadmap/priorities.md` |

## Problem statement

Six deployed apps — product, marketing, admin, docs, support, demo — is a heavy surface for a
self-funded project capped around €10k whose stated priority №1 is _simplifier radicalement_. Each
one is a Vercel project, a deployment to keep green, a set of environment variables, and a surface
that can drift from the others.

The report's recommendation is product + practitioner space + one marketing page for now, parking
the rest. That is a recommendation, not a decision, and it is the owner's to make.

## Required steps

1. Produce the honest inventory, one row per app: what it is for, whether it is deployed, whether
   anyone uses it, what it costs to keep, and what is lost by parking it.
2. Say plainly which apps carry content that must survive parking (the docs site's technical
   reference; the support centre's help content) and where that content would go instead.
3. Present three options with their real costs: keep all six; park docs/support/demo behind
   deployment protection; delete them.
4. **Stop there and put it to the owner.** Do not delete an app on your own initiative.
5. Once decided, execute in a separate PR per app so each is revertible.

## Open questions — flag these on pickup

- **Where does the practitioner space live?** The report describes "product + practitioner space"
  as two things, but the current estate has one signed-in app (`apps/web`). Whether the
  practitioner dashboard is a second app, a route group, or a role-switched surface is undecided
  and materially changes Phase D.
- **Is `apps/demo` still the Design stage's sandbox?** Parking it changes the pipeline's Design
  stage contract, which is not this ticket's to rewrite.
- **What happens to the admin console?** It is operator-only and small, but it is also where the
  confidential content lived. Parking it is not the same as deleting it.

## Acceptance criteria

- [ ] A one-page inventory exists with a row per app and a real cost/benefit for parking each.
- [ ] Three options are presented with consequences, and a recommendation is made.
- [ ] Nothing is deleted or undeployed in this ticket.
- [ ] The practitioner-space question is raised explicitly, because Phase D depends on it.

## Agent prompt

```text
Work in the remi-ai monorepo. Read CLAUDE.md, then .icm/docs/README.md, then
.icm/docs/braindump/roadmap/priorities.md and Part two of .icm/docs/remi-status-report.html.

Task: prepare — do not make — the decision about how much of the six-app estate survives.
1. Read each app under apps/ enough to describe honestly what it does and what would be lost by
   parking it. Do not guess at deployment or traffic state you cannot see from the repo; say it is
   unknown and name what would answer it.
2. Write the inventory and the three options (keep all six / park docs+support+demo behind
   deployment protection / delete) into this ticket as a "Recommendation" section, with costs.
3. Raise the practitioner-space question explicitly: second app, route group, or role-switched
   surface? Phase D cannot start without it.
Change no application code and delete nothing. Do not run build/lint/typecheck/format locally.
Push a branch, open a PR containing only the analysis, and leave this ticket in .icm/intake/ —
it retires when the owner's decision is executed, not when the analysis lands.
```
