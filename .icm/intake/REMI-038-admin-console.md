# REMI-038 · Admin console: user list and per-patient operations

|                |                                                                                                                                                  |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Type**       | feature                                                                                                                                          |
| **Priority**   | P1 (assembles the operator workflow around everything else)                                                                                      |
| **Size**       | A week                                                                                                                                           |
| **Depends on** | REMI-023 (operator auth), REMI-021 (shared models), REMI-032 (workbench), REMI-033/034 (calendar + plan controls), REMI-036/037 (read-only tabs) |
| **Blocked by** | —                                                                                                                                                |
| **Sources**    | v1-report §4; audit F-15; info-gathering REQ-11                                                                                                  |

## Problem statement

The operator's working surface: a user list over all patients (name, contact, signup date, the
7-day habits countdown badge, a derived status string, search) and a per-patient view composing
the tabs built by earlier tickets — profile (read-only), questionnaire (editable with rescoring),
documents (REMI-032), plans (REMI-034's controls), feedback (REMI-036), diary (REMI-037), and the
supplement calendar (REMI-033). This replaces the current fixture-driven admin screens with real
data, and is also where pilot applications get tracked (the quarter's stated objective).

## Required steps

1. User list: all persons via a properly-authorized server query (no v1 `admin-get-users`
   service-role shortcut); columns per v1 §4 including the habits countdown (done / red after
   7 days / countdown) and the derived status ("Nutrition plan week N" → "Insights week" →
   "Profil créé" → "Onboarding"); server-side search/pagination via the seam's capabilities.
2. Per-patient layout (`/patients/[id]/[tab]` equivalent): compose the existing tab features;
   this ticket builds the shell, the Profil read-only tab, and the Questionnaire tab (view every
   response with question text + dimension; edit dialog 1–5 per question; save merges and
   **recomputes** scores/levels/profile via REMI-027's engine, writing a new versioned outcome
   and an audit entry).
3. Wire the pilot-application tracking view against REMI-021's `PilotApplication` model (the
   real list from REQ-11 as seed if it exists).
4. Everything operator-authorized server-side; every mutation audited; admin's working-language
   conventions per `apps/admin/AGENTS.md`.

## Acceptance criteria

- [ ] The user list renders real persons with correct countdowns and status derivation, searchable.
- [ ] An operator can edit a questionnaire and see the profile recompute, with the change audited
      and version-attributed.
- [ ] All patient tabs are reachable from one coherent per-patient shell.
- [ ] No service-role-style bypass: access flows through authorized seam queries.

## Agent prompt

```text
Work in the remi-ai monorepo. Enter through the delivery pipeline per CLAUDE.md. Read
CONVENTIONS.md and apps/admin/AGENTS.md, then .icm/docs/v1-report.md §4 in full (the proven console),
and audit F-15.

Build the real admin console in apps/admin, replacing the fixture-driven screens:
1. User list: server-rendered table of all persons — name, email, phone, signup date, days since
   signup, the nutrition-habits badge (done / red "7 days elapsed" / countdown from the
   registration date), and the derived status string (has validated week N -> "Nutrition plan
   week N"; document uploaded -> "Insights week"; profile exists -> "Profil créé"; else
   "Onboarding") — implement the derivation as one tested pure function. Search and pagination
   through the db seam's sorted/paginated queries, operator-authorized.
2. Per-patient shell with tabs, composing what other features built (documents workbench, plans,
   calendar, feedback, diary) and adding here: Profil (read-only: identity, weight/height with
   BMI/age derived, allergens/intolerances incl. free-text details, goal, preferences) and
   Questionnaire (each response with its question text and dimension, the computed profile card,
   and an edit dialog constrained 1-5 per item; saving merges changed answers, recomputes
   scores/levels/profile through the psych engine, stores a new versioned outcome, and writes an
   AuditEntry).
3. Pilot applications: a list view over the shared PilotApplication model so real applications
   can be tracked (seed from the real list if the owner supplied one — REQ-11).
4. No client-side-only protection and no service-role bypasses: every query and mutation is a
   server action checking the operator role.
Tests: status derivation, countdown edges, rescoring round-trip. Run tests only; push and open
PRs through the pipeline gates.
```
