# REMI-020 · The daily hub and "je mange autre chose"

|                |                                                                     |
| -------------- | --------------------------------------------------------------------- |
| Status         | ready once REMI-019 lands                                           |
| **Type**       | feature                                                             |
| **Priority**   | P1 — Phase C; it is what makes REMI a daily reflex rather than a tool |
| **Size**       | A week                                                              |
| **Depends on** | REMI-019                                                            |
| **Blocked by** | —                                                                   |
| **Sources**    | Status report Phase C bullet 3 · `.icm/docs/braindump/roadmap/features.md` |

## Problem statement

The rigid meal plan is gone. What replaces it is a **daily hub**: today's accompaniment — the
micro-action in play, what has been done, a tailored recipe — rather than a twelve-week programme
nobody follows past week two.

Alongside it, **"je mange autre chose"**: the flexibility mode for when real life does not match
the plan. The user says what is actually in the fridge, and REMI generates a realistic alternative
compatible with their recommendations, in the moment. Braindump priority №5 is finding the daily
"moment de valeur" — this pair is where that happens or does not.

## Required steps

1. Build the daily hub: today's micro-action with its *why*, what has already been done, and a
   recipe that fits the patient's actual constraints.
2. Build "je mange autre chose": input what is genuinely available, receive a compatible
   alternative immediately.
3. Keep both fast. Every interaction should be quick and deliver immediate value — that is the
   braindump's stated test, and slowness here is the failure mode that killed v1.
4. Feed both into the same interaction record the practitioner view reads.
5. Reuse REMI-019's analysis path rather than building a second one that can drift from it.

## Open questions — flag these on pickup

- **Does the hub need notifications to work?** A daily reflex usually implies a daily prompt.
  Push notifications bring platform work, permissions and a consent question that nobody has scoped.
- **How many micro-actions are live at once?** One per day, one per week, or a small set? Adherence
  research points one way and product ambition the other; the braindump says "adherence over
  ambition" but not a number.
- **Where do the recipes come from?** Generated per patient, drawn from a bank, or both. Generation
  cost matters here (REMI-022) and this is the most-used surface in the product.
- **Is this a web app or does it need to be installable?** Daily use on a phone raises the PWA
  question, which the estate decision (REMI-009) may also touch.

## Acceptance criteria

- [ ] A patient opening REMI sees today's micro-action, their progress, and something useful to cook.
- [ ] "Je mange autre chose" returns a compatible alternative from what is actually available.
- [ ] Both paths reuse the analysis from REMI-019 — no second, divergent implementation.
- [ ] Both record interactions the practitioner view can read.

## Agent prompt

```text
Work in the remi-ai monorepo. Read CLAUDE.md and CONVENTIONS.md, then .icm/docs/braindump/
roadmap/features.md ("Hub du jour", "Mode je mange autre chose") and roadmap/priorities.md
(priority 5, the daily "moment de valeur").

Task: build the daily hub and the "je mange autre chose" mode.
1. The hub shows today's micro-action with its why, what is done, and a recipe that fits the
   patient's real constraints. It replaces the rigid plan — do not rebuild a plan.
2. "Je mange autre chose" takes what is actually available and returns a compatible alternative
   immediately.
3. Reuse REMI-019's analysis path. Do not create a second implementation that can drift.
4. Record interactions into the same store the practitioner adherence view reads.
Speed is a feature here, not a nice-to-have. Do not run build/lint/typecheck/format locally. Push a
branch, open a PR, git mv this ticket into .icm/intake/_done/, and raise the notification and
micro-action-cadence questions in the PR body rather than settling them by implementation.
```
