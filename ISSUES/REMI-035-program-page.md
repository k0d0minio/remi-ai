# REMI-035 · Program page: meals, skip/regenerate, shopping list

| | |
| --- | --- |
| **Type** | feature |
| **Priority** | P1 |
| **Size** | A week+ (v1's version was 2,168 lines — decompose properly) |
| **Depends on** | REMI-034 (validated weeks to display), REMI-033 (calendar for supplement slots), REMI-023 (auth) |
| **Blocked by** | D-v1-2 (which audience sees which view) |
| **Sources** | v1-report §3 (`/app`, `/app/program`), §5.2 step 6, §6.5 |

## Problem statement

The patient's daily surface: today's meals on the dashboard (four timed sections — breakfast,
lunch, snacks, dinner — each with pre/on/post-meal drink and supplement slots, plus between-meals
supplements) and the full week in the program page (week navigation with adherence medals, 7
day-tabs defaulting to today, standalone drinks with name-normalised dedupe, shopping-list
dialog). The skip flow is a product differentiator: reason + optional feedback → a single-meal
AI regeneration with the exclusion remembered, the replacement swapped in, the shopping list
recomputed, and the meal excluded from future weeks.

## Required steps

1. Dashboard TodayMeals: today's meals from the current validated week in the four timed
   sections with drink/supplement slots (calendar-fed), plus the no-plan onboarding-checklist
   state and the weekly-advice sidebar (REMI-036's content).
2. Program page, decomposed into components (not a monolith): week navigation across available
   validated weeks with medals (Or ≥80% / Argent ≥70% / Bronze ≥50%), day tabs defaulting to
   today, per-day meal sections, standalone drinks (dedupe eau/thé/café/tisane by normalised
   name), between-meals supplements, unvalidated-week banner.
3. Shopping list dialog from the week's stored list.
4. Skip flow: reason radio (taste/complexity/time/budget/other) + optional feedback → the
   REMI-034 single-meal regeneration path with the exclusion list → swap in the replacement,
   record the SkippedMeal, recompute the shopping list (v1 used an LLM "Kitchen Logistics
   Manager" consolidation with an LLM-free dedupe fallback — port the intent through the AI
   seam, keep the deterministic fallback), exclude from future generations (last-20 memory).
5. Timezone correctness: "today" is Europe/Brussels product time, not UTC (v1 §8.8's drift is
   the anti-pattern; use the REMI-018 calendar-day type).
6. FR/EN parity, design system, accessible tabs/dialogs.

## Acceptance criteria

- [ ] Today's view and the week view render a validated week correctly incl. drinks dedupe and
      supplement slots; unvalidated weeks are bannered.
- [ ] Skipping a meal produces a replacement, a recorded skip, an updated shopping list, and a
      remembered exclusion — atomically from the user's perspective.
- [ ] Medals match the adherence thresholds; day selection is Brussels-correct at midnight edges.
- [ ] No component approaches v1's 2,168-line monolith.

## Agent prompt

```text
Work in the remi-ai monorepo. Enter through the delivery pipeline per CLAUDE.md. Read
CONVENTIONS.md, then docs/v1-report.md §3's rows for /app (Dashboard/TodayMeals) and
/app/program, §5.2 step 6 (the skip/regenerate mechanics incl. shopping-list recomputation), and
§6.5 (medal thresholds and constants). §8.8 warns about UTC/Paris drift — this product's "today"
is Europe/Brussels.

Build the patient program surface in apps/web:
1. Dashboard: TodayMeals from the person's current validated WeekPlan — four timed sections
   (breakfast, lunch, snacks, dinner), each with pre/on/post-meal drink and supplement slots
   sourced from the plan's drinks and the SupplementCalendar, plus between-meals supplements; a
   no-plan state with the 4-step onboarding checklist; the weekly-advice sidebar slot.
2. Program page as small composed components: week navigator over validated weeks with adherence
   medals (gold >=80%, silver >=70%, bronze >=50% of adherence score x10), 7 day-tabs defaulting
   to today (Brussels time via the shared calendar-day type), per-day sections mirroring
   TodayMeals, standalone drinks deduped by normalised name (eau/thé/café/tisane), between-meals
   supplements, and an amber banner on any unvalidated week.
3. Shopping-list dialog rendering the week's shopping_list.
4. Skip flow: dialog with reason radios (taste/complexity/time/budget/other) + optional
   free-text; submit calls the single-meal regeneration server action (REMI-034's path) with the
   person's exclusion list; on success swap the meal in place, persist the SkippedMeal record,
   and recompute the shopping list — LLM consolidation through the AI seam with the
   deterministic dedupe fallback when the seam call fails. Handle in-flight state honestly
   (pending UI from the job/run state, no fake completion).
5. All server actions authorization-checked; FR/EN parity; design-system components; keyboard-
   accessible tabs and dialogs.
Tests: drink-dedupe normalisation, medal thresholds, Brussels-day selection around midnight,
shopping-list fallback consolidation. Run tests only; push and open PRs through the pipeline
gates.
```
