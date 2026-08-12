# REMI-033 · Supplement calendar generation

|                |                                                                                                                       |
| -------------- | --------------------------------------------------------------------------------------------------------------------- |
| Status         | ready                                                                                                                 |
| **Type**       | feature                                                                                                               |
| **Priority**   | P2 (needed before plan week 1 in v1's flow; sequence with REMI-034)                                                   |
| **Size**       | Days to a week                                                                                                        |
| **Depends on** | REMI-032 (validated supplements are the input), REMI-020 (AI seam), REMI-022 (db)                                     |
| **Blocked by** | **D-v1-1** — in v1 the Python API computed the calendar; keep-as-vendor vs rebuild changes the adapter, not the shape |
| **Sources**    | v1-report §5.1 (`patient_supplement_calendars`), §5.2 step 3, §6.5, §8.7                                              |

## Problem statement

From the validated supplements and the doctor's recommendations text, the product derives a
per-patient supplement calendar: entries with dose schedules (per-dose timing, meal association,
specific times), days-of-week/month patterns, date ranges, and monthly repetition. v1 extracted
the treatment duration from the recommendations **by regex** (FR/ES/EN patterns, default 3
months, 1–24 accepted) and delegated computation to the Python API, with a DB trigger firing the
pipeline and staleness heuristics re-kicking stuck runs. The port keeps the output shape and the
regeneration-only editing model, and replaces inference-based state with the job table.

## Required steps

1. Model per REMI-018: one calendar per person; entries {name, dosage, frequency, date_range,
   doses[] {quantity, timing, meal_type, specific_time}, days_of_week (1=Mon), days_of_month,
   repeat_monthly}; a processing state carried by the job table, not a magic `{status}` blob.
2. Duration derivation: keep the regex extraction as the documented v1 behaviour but make it
   inspectable (store the derived duration and its source snippet; default 3 months; accept
   1–24) — an operator can correct it before generation.
3. Computation behind the AI seam / vendor adapter per the D-v1-1 decision (Python API as vendor,
   or in-house from the validated rows + duration).
4. Trigger on full validation (REMI-032's gate) and on operator-requested regeneration
   (regeneration-only editing, as v1); re-validate downstream when inputs change.
5. Patient-facing rendering: the calendar surfaces in the dashboard/program meal slots
   (REMI-035 consumes it) — this ticket delivers the data + an admin Calendrier tab equivalent.
6. Stuck-run recovery from the job table (v1's 30-minute re-kick becomes an explicit retry
   policy).

## Acceptance criteria

- [ ] A fully-validated document yields a calendar with correct dose scheduling shapes.
- [ ] The derived treatment duration is visible and operator-correctable before generation.
- [ ] Regeneration is the only edit path; each run is attributed and journaled.
- [ ] Stuck runs surface as failures with retry, not silent staleness.

## Agent prompt

```text
Work in the remi-ai monorepo. Enter through the delivery pipeline per CLAUDE.md. Read
CONVENTIONS.md, then .icm/docs/v1-report.md §5.1's patient_supplement_calendars row, §5.2 step 3, and
§6.5's constants (duration default 3 months, range 1-24, re-kick policy). Confirm the D-v1-1
decision (Python API as vendor vs in-house computation) before implementing the compute step; if
undecided, build everything up to the compute call and stop — say so in the PR.

Build supplement-calendar generation:
1. Use the SupplementCalendar model (one per person; entries with doses[] {quantity, timing,
   meal_type, specific_time}, date ranges, days_of_week with Monday=1, days_of_month,
   repeat_monthly). Processing state lives in the shared job/run table, never in the calendar
   row itself.
2. Duration derivation service: extract treatment duration in months from the validated
   recommendations text (port v1's FR/ES/EN regex patterns; default 3; clamp 1-24), storing both
   the value and the matched snippet; expose it for operator correction in the admin UI before
   generation.
3. Compute step behind a seam: given validated supplement rows + duration + start date, produce
   the calendar. Wire the decided vendor (Python API adapter with callback handling, or in-house
   logic) — either way the call and result are journaled (AiGeneration record if an LLM/external
   generator is involved).
4. Triggers: fire on the document's fully-validated gate flipping, and from an admin
   "Régénérer" control gated on a plan existing (v1's rule). Regeneration-only — no manual entry
   editing. Retry policy for failed/stuck runs from the job table.
5. Admin: a read-only calendar tab per patient with the regeneration control.
Tests: duration regex table-driven cases, schedule-shape validation, trigger/gate logic. Run
tests only; push and open a PR through the pipeline gates.
```
