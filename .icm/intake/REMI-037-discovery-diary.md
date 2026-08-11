# REMI-037 · The 7-day discovery diary

|                |                                                                                                                                      |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| **Type**       | feature                                                                                                                              |
| **Priority**   | P2                                                                                                                                   |
| **Size**       | Days                                                                                                                                 |
| **Depends on** | REMI-022/023 (db, auth), REMI-031 (the document-exists gate), REMI-034 (finalisation feeds generation)                               |
| **Blocked by** | A product decision the v1 report explicitly raises: does the discovery week survive at all? Confirm before building (v1 §9.2 step 7) |
| **Sources**    | v1-report §2 step 4, §3 (`/app/diary`), §6.5                                                                                         |

## Problem statement

v1's onboarding required a one-off 7-day food diary (window starting at registration) plus a
mandatory medical-document upload before the plan could be generated; finalising was irreversible
and flagged the patient ready. The diary's entries feed every subsequent generation as context.
The v1 report flags a real product question first: the diary exists only pre-plan — decide
whether the discovery week survives the port before spending the effort.

## Required steps

1. Get the product decision (keep / drop / redesign the discovery week). If dropped, close this
   ticket with the decision recorded and remove diary context from REMI-034's assembly.
2. If kept: diary entries per REMI-018's model (client-generated entry ids made unique
   server-side); day navigator over the 7-day window from registration; entry form (meal type
   including out-of-meal drinks, foods, drinks, notes); edit/delete per entry; week summary
   tiles.
3. Finalisation: blocked until a medical document exists (REMI-031); explicit irreversible
   confirm; sets the readiness flag REMI-034's week-1 gate reads; all mutation UI locks after
   finalisation or once a plan exists; nav hides the diary once a plan exists.
4. The habits countdown (done / red "7 jours écoulés" / countdown) surfaces in the admin user
   list (REMI-038).
5. Brussels-timezone day boundaries throughout.

## Acceptance criteria

- [ ] The product decision is recorded before any code.
- [ ] If built: entries CRUD within the window; finalisation gate + irreversibility behave as
      specified; diary data reaches generation context.
- [ ] Post-plan, the diary is read-only and hidden from nav.

## Agent prompt

```text
Work in the remi-ai monorepo. Enter through the delivery pipeline per CLAUDE.md. FIRST: confirm
the product decision that the discovery week survives (docs/v1-report.md §9.2 step 7 raises it).
If undecided, stop and ask rather than building. Read CONVENTIONS.md, then docs/v1-report.md §2
step 4, §3's /app/diary row, and §6.5's diary constants.

If confirmed, build the discovery diary in apps/web:
1. NutritionDiaryEntry per the shared model (unique entryId per person server-side). A day
   navigator over a 7-day window starting at the person's registration date (Brussels-time day
   boundaries via the shared calendar-day type).
2. Entry form: meal type (breakfast/lunch/dinner/snack plus "drinks outside meals"), foods,
   drinks, notes, time; edit and delete per entry; a 7-tile week summary showing per-day
   completion.
3. Finalisation ("validate and generate my program"): disabled until a MedicalDocument exists
   for the person; on click, an explicit confirm stating irreversibility; sets
   nutritionHabitsCompleted (the flag REMI-034's week-1 gate and the admin countdown read).
   After finalisation, or once any WeekPlan exists, all mutation UI locks and the diary leaves
   the nav (read-only via admin remains).
4. Authorization on every action; FR/EN parity; design-system components.
Tests: window computation, finalisation gating, lock states. Run tests only; push and open a PR
through the pipeline gates.
```
