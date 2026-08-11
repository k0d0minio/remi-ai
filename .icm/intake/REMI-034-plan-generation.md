# REMI-034 · Weekly plan generation and the Guardian validation loop

|                |                                                                                                                                                                                                                                      |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Type**       | feature — the product's core                                                                                                                                                                                                         |
| **Priority**   | P1 (the biggest single port)                                                                                                                                                                                                         |
| **Size**       | Weeks                                                                                                                                                                                                                                |
| **Depends on** | REMI-020 (AI seam), REMI-022 (db), REMI-027/028 (profiles feed context), REMI-032 (validated gate), REMI-033 (calendar), REMI-026 (D-5 pseudonymisation if real data)                                                                |
| **Blocked by** | **D-v1-1 — the Python meal-plan API decision (REQ-12/13/14)**: keep as vendor behind the AI seam, or rebuild generation + Guardian in-house. The contract is preserved in v1 §5.2; the logic exists only if the Python code survives |
| **Sources**    | v1-report §2 steps 6, §5.1 (`week_recipes`), §5.2 steps 4–7, §6.5, §8.6, §8.7; audit F-12, F-16                                                                                                                                      |

## Problem statement

The heart of the product: generate one week of the nutrition plan at a time (recipes per
day/meal-slot, drinks, weekly goals, shopping list) from the entire patient context, validate it
against the seven-dimension Guardian safety check, and keep the sequence flowing (auto-generate
the next week as the current one ends; regenerate what fails validation; cap at 13 weeks). v1
proved the shape; its mechanics must be rebuilt: uniqueness held by retry logic instead of a
constraint, empty rows as generation locks, 202-fire-and-forget with staleness heuristics, and
no FK from feedback to weeks. The Guardian result schema is the safety spec either way the
D-v1-1 decision goes.

## Required steps

1. **Settle D-v1-1 first.** Vendor path: an adapter speaking v1's contract
   (`POST /api/meal-plan/week/{n}/recipes?language=fr`, Bearer auth, async callback). In-house
   path: generation + Guardian rebuilt behind the AI seam per the Anthropic decision.
2. WeekPlan model per REMI-018: unique (person, week_number); stable plan identity; days_data
   (7 × meal slots), drinks, weekly goals, shopping list; `guardian_validated` +
   the seven-dimension `guardian_validation_result`; generation runs in the job table (no
   empty-row locks; in-flight and stale states are explicit).
3. Context assembly (v1 §5.2 step 4's full list): profile + biology, allergens/intolerances incl.
   free-text, diet type, cooking/budget/goal, genotypes (document over profile precedence),
   validated supplements, recommendations text, psychological profile + coaching brief, diary
   entries, feedback history, last 20 skipped meals, supplement calendar, previous week + its
   feedback. Respect D-5: pseudonymised context if decided.
4. Gates and sequencing: week 1 requires the fully-validated document; week N requires week N−1
   guardian-validated; cap 13 weeks; empty drinks forces validation-failure (v1's local rule).
5. Scheduled loops as real jobs (Vercel cron or the vendor's scheduler): auto-generate when the
   current validated week ends within 2 days; regenerate weeks unvalidated >40 min; explicit
   retry policy — all from the job table.
6. Re-validation path: `validate-two-weeks` on consecutive pairs, fired by allergy changes
   (REMI-030's hook connects here).
7. Every generation/validation persisted as AiGeneration records (the audit-trail requirement
   the whole architecture exists for).
8. Admin plan controls per v1 §4: generate week 1 (start date), sequential generation buttons,
   read-only viewer with unvalidated-week banner, regeneration; deletion stays disabled.

## Acceptance criteria

- [ ] Week 1 is generatable only after full document validation; week N only after N−1 validates.
- [ ] (person, week) uniqueness is a database constraint; concurrent generation attempts are
      serialised by the job table.
- [ ] Every generated week carries a seven-dimension Guardian result; unvalidated weeks are
      visibly flagged and auto-regenerated per policy.
- [ ] An allergy change re-validates current + future weeks.
- [ ] The full input context of every generation is reconstructable from AiGeneration records.

## Agent prompt

```text
Work in the remi-ai monorepo. Enter through the delivery pipeline per CLAUDE.md; this is the
core feature and should be split into multiple pipeline runs (model+jobs, generation path,
scheduling, admin controls). Read CONVENTIONS.md, then docs/v1-report.md §5.2 steps 4-7 IN FULL
(the preserved generation contract), §5.1's week_recipes row, §6.5's constants, and §8 items 6-7.
Also read audit F-12's requirements: validated-before-render, persisted-with-context.

HARD PRECONDITION: decision D-v1-1 (the Python meal-plan API's fate) must be answered. If it is
not, stop and ask — do not guess the generation backend.

Build weekly plan generation:
1. WeekPlan + GenerationRun models: unique (personId, weekNumber) constraint; runs as a real
   state machine (requested -> generating -> validating -> validated|failed) with timestamps —
   never an empty row as a lock. Feedback links by FK (weekPlanId), fixing v1 §8.6.
2. Context assembly as a pure, tested function producing the typed GenerationContext from: the
   structured profile (biology, allergens incl. free-text others, intolerances, diet,
   cooking/budget/goal), genotypes (document-derived preferred over profile), validated
   supplement rows, recommendations text, psychological profile + coaching brief (REMI-027
   data), diary entries, all weekly feedback, last 20 skipped meals, the supplement calendar,
   and the previous week + its feedback. If D-5 decided pseudonymisation, no direct identifiers
   may enter the context — enforce by type.
3. Generation + Guardian through the AI seam per the D-v1-1 decision (vendor adapter speaking
   v1's async contract with an authenticated callback route, or in-house generation with the
   Guardian seven-dimension validation implemented as its own seam call). Persist every call as
   an AiGeneration record. Local rule from v1: a week with empty drinks cannot be marked
   validated.
4. Gates: week 1 requires the document fully-validated gate; week N requires week N-1
   guardian_validated; cap at 13 weeks.
5. Scheduling: platform-appropriate cron jobs — auto-generate the next week when the current
   validated week ends within 2 days (and fill sequence gaps); retry unvalidated weeks per an
   explicit policy replacing v1's 40-minute heuristic. All driven from GenerationRun rows.
6. Re-validation: a validate-consecutive-weeks path callable when allergies change (wire
   REMI-030's revalidatePlansFrom hook to it).
7. Admin controls per v1 §4's Plans tab: generate week 1 with start date, sequential week
   buttons, read-only day/slot viewer with an unvalidated banner, regenerate; no deletion.
Authorization on every path (operator or CareRelationship). Tests on context assembly, gates,
state transitions, and the callback route's auth. Run tests only; push and open PRs through the
pipeline gates.
```
