# REMI-036 · Weekly feedback, adherence medals, and the advice bank

|                |                                                                                                                                    |
| -------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| **Type**       | feature                                                                                                                            |
| **Priority**   | P2                                                                                                                                 |
| **Size**       | Days                                                                                                                               |
| **Depends on** | REMI-034 (weeks to give feedback on), REMI-035 (the surfaces it renders in), REMI-027 (profiles key the advice bank)               |
| **Blocked by** | The v1 weekly-advice content bank (~21 messages × 7 profiles) — recover from the v1 Supabase project (REQ-04) or have it rewritten |
| **Sources**    | v1-report §3 (feedback flow), §5.1 (`weekly_feedback`, `weekly_advice`), §6.5, §8.6, §8.10                                         |

## Problem statement

The feedback loop closes the product's core cycle: from day 4 of each week the patient reports
satisfaction (yes/no/unsure) and adherence (1–10, comment mandatory if unhappy or ≤3 — enforced
server-side), earning medal badges and feeding the next week's generation. A per-profile weekly
advice message (a static bank of ~21 French messages per psychological profile) renders in the
dashboard sidebar. v1's defects here: feedback matched weeks by a 4-strategy heuristic cascade
(no FK), and dismissal cooldowns lived in localStorage.

## Required steps

1. WeeklyFeedback with a real FK to WeekPlan (REMI-018 fixed the model; this ticket uses it).
2. The prompt flow: auto-opens from day 4 of the current week, once per week, with a dismissal
   cooldown — persisted server-side per person/week, not in localStorage.
3. Validation both sides: satisfaction enum, adherence 1–10, comment required if unhappy or ≤3.
4. Medals/badges derived from adherence (thresholds per §6.5) shown in the program navigator and
   the profile's badges card.
5. Feedback feeds generation: REMI-034's context assembly already lists it — verify the join
   works by FK.
6. Advice bank: `(profile_key, week_number) → message` content, seeded from the recovered v1
   bank (or newly written FR content, then EN parity); rendered in the dashboard sidebar; plus
   the general feedback/contact form the sidebar carried (delivering via the email seam — with
   escaping; v1's injection bug must not return).
7. Read-only admin view of feedback per patient (Retours tab equivalent).

## Acceptance criteria

- [ ] Feedback rows join to weeks by FK only; no heuristic matching anywhere.
- [ ] The prompt opens per policy and never twice for one week; cooldown survives device changes.
- [ ] Server rejects a missing comment when unhappy or ≤3.
- [ ] The advice message matches the person's profile and current week; content sourced or
      rewritten, not invented silently.

## Agent prompt

```text
Work in the remi-ai monorepo. Enter through the delivery pipeline per CLAUDE.md. Read
CONVENTIONS.md, then .icm/docs/v1-report.md §3's weekly-feedback paragraph (timing rules), §5.1's
weekly_feedback and weekly_advice rows, §6.5's thresholds, and §8 items 6, 9, 10.

Build the feedback loop:
1. Feedback capture: a dialog on the program page auto-opening from day 4 of the current week
   (Brussels time), once per person-week, with a server-persisted dismissal cooldown (no
   localStorage state). Fields: satisfaction yes/no/unsure, adherence slider 1-10, comment —
   mandatory when unhappy or score <=3, enforced in the server action as well as the form.
   Rows reference the WeekPlan by FK.
2. Medals: derive gold/silver/bronze (>=80/70/50% of score x10) where the program navigator and
   the profile badges card need them — one shared derivation function with tests.
3. Advice: model WeeklyAdvice as (profileKey, weekNumber) -> message content. If the v1 bank's
   content has been recovered into the repo, seed from it; otherwise create the content
   structure with a small clearly-marked starter set and flag the gap in the PR — do not
   silently invent 147 coaching messages. Render in the dashboard sidebar for the person's
   profile and current week.
4. Sidebar contact form: sends through the email seam with proper escaping of user content
   (v1 §8.9's HTML-injection bug is the anti-pattern) and basic rate limiting.
5. Admin: read-only per-patient feedback view (adherence n/10 + comment per week).
Authorization checks throughout; FR/EN parity. Tests: timing/cooldown logic, validation rules,
medal derivation, escaping. Run tests only; push and open a PR through the pipeline gates.
```
