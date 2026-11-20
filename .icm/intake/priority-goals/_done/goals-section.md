# Stub: The practitioner adds, orders and deactivates the patient's goals as free text

- feature-slug: goals-section
- epic: priority-goals
- story: 16
- sequence: 1 of 2
- depends-on: none
- complexity: low
- priority: P0

## Problem

The goals on `main` carry a baseline, a cap of two or three, and a weekly score. Story 16
wants a plain ordered list of free texts, with no cap, that the practitioner deactivates
rather than deletes.

## Proposed change

In the patient file, a section « Objectifs »: a list of goals in `position` order, a field
« + Ajouter un objectif » (free text, required), inline edit, « Monter » and « Descendre »
to reorder, and « Désactiver ». A deactivated goal sets `archived_at` and shows under
« Objectifs désactivés » with its date. Remove the active-goal cap from the service. Hide
the `baseline` field and stop writing it. Record each change as an audit event. Keep the
table and its rows as they are.

## Acceptance criteria

- [ ] A goal saves with its text alone. An empty text does not save.
- [ ] Five goals coexist on one patient. No cap blocks the sixth.
- [ ] « Monter » and « Descendre » change the order. The order survives a reload.
- [ ] The practitioner edits a goal in place. The edit keeps the goal's rank and its history.
- [ ] « Désactiver » moves the goal under « Objectifs désactivés » with its date. The row is not deleted.
- [ ] The section shows no « point de départ » field and no score.
- [ ] Each add, edit, reorder and deactivation creates an audit event.

## Out of scope

- The validated state of a goal (`protocol-versions`).
- The patient's view (`patient-recommendations`).
- Dropping `patient_goal_check_ins` (Question 1 for Jamie).

## Notes

- Decisions kept: D-32. Supersedes D-9 (the weekly score and the check-ins leave).
- Files: the goals service, the patient file page in `apps/admin`. No migration.
- cross-epic: `patient-file-view` owns the file layout. This stub reworks one section.
