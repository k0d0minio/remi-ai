> Dropped: parked practitioner phase — the 2026-08-27 direction of record says the practitioner space will be specified from Morgane's terrain experience, so this braindump-era spec would be re-cut rather than picked up as written. 2026-08-27 estate ticket audit.

# REMI-023 · Practitioner cohort view — adherence at a glance

> **Deferred (2026-08-27):** practitioner-phase / later-phase work. Per `.icm/docs/new-development-direction.docx`, the patient experience is built and validated first (FunMedDev test 1 Dec, open day 19 Dec); the practitioner space, parser, subscriptions and practitioner beta come after, informed by Morgane's own terrain experience with 10-15 patients. Was higher priority under the retired Phase A-F plan.

|                |                                                                                   |
| -------------- | --------------------------------------------------------------------------------- |
| Status         | ready once Phase C produces adherence data                                        |
| **Type**       | feature                                                                           |
| **Priority**   | P2 — parked until the patient experience is validated (new development direction) |
| **Size**       | A week                                                                            |
| **Depends on** | REMI-013, REMI-021 (the adherence signal), REMI-009 (where it lives)              |
| **Blocked by** | The practitioner-space decision in REMI-009                                       |
| **Sources**    | Status report Phase D bullet 1 · `.icm/docs/braindump/roadmap/features.md`        |

## Problem statement

This is what practitioners pay for. Not the patient app — the visibility. The braindump is explicit
that the practitioner dashboard is _le chantier le plus stratégique de REMI_, and priority №2 is
making REMI indispensable between two consultations: _gain de temps, visibilité sur l'adhérence,
amélioration du suivi, fidélisation patient_.

The cohort view is the front door: every patient, adherence at a glance, and — the part that
actually saves time — **who is struggling**, surfaced without the practitioner having to go
looking.

## Required steps

1. List every patient with a care relationship to the signed-in practitioner. Nobody else's, ever.
2. Show adherence per patient at a glance, computed the way REMI-021 defines it, and make the
   definition visible rather than a mystery number.
3. Surface who is struggling. A sorted list that requires reading is not "at a glance".
4. Make it fast with real data. The audit found an N+1 query pattern baked into the existing roster
   screens (F-37) — do not inherit it.
5. Design for the largest practice in the beta, not the smallest.

## Open questions — flag these on pickup

- **Where does the practitioner space live?** REMI-009 decides: a second app, a route group in
  `apps/web`, or a role-switched surface. This ticket cannot start without the answer.
- **What does "struggling" mean?** A threshold, a trend, or something the practitioner sets. It is
  a clinical judgement rendered as a rule, and it should not be invented by an engineer.
- **How much patient detail belongs on the cohort screen?** Health data on a screen a practitioner
  may open in front of someone else is a privacy consideration, not just layout.
- **Are patients grouped?** Clinics with several practitioners, or protocol-based cohorts, both
  appear in the braindump's longer-term picture but not in V2's scope.

## Acceptance criteria

- [ ] A practitioner sees exactly their own patients and no others — enforced server-side.
- [ ] Adherence is visible per patient, with its computation documented.
- [ ] Patients who are struggling are surfaced, not merely sortable.
- [ ] The list loads in constant queries, not one per patient.

## Agent prompt

```text
Work in the remi-ai monorepo. Read CLAUDE.md and CONVENTIONS.md, then .icm/docs/braindump/
roadmap/features.md ("Features — Espace Praticien") and roadmap/priorities.md (priority 2), then
.icm/docs/history/audit-report.md findings F-37 (the N+1 pattern) and F-10/F-14 (the access model).

Task: build the practitioner cohort view.
1. Enforce the care relationship server-side: a practitioner sees only their own patients. Read
   .icm/docs/history/v1-report.md section 8 first — v1's IDOR model let any signed-in user act on
   any patient, and that is the specific failure not to repeat.
2. Show adherence per patient using REMI-021's definition, and make the definition visible.
3. Surface who is struggling without the practitioner having to hunt.
4. Constant queries, not one per patient. Design for the largest beta practice.
Confirm where the practitioner space lives (REMI-009) before writing routes. Do not run
build/lint/typecheck/format locally. Push a branch, open a PR, git mv this ticket into
.icm/intake/_done/, and put the definition of "struggling" to the owner — it is a clinical
judgement, not an engineering one.
```
