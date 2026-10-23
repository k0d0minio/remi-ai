# Stub: The practitioner is asked to re-evaluate a temporary eviction before and at its end date

- feature-slug: eviction-expiry-review
- epic: eviction-safety
- story: 14
- sequence: 2 of 3
- depends-on: compatibility-gate
- complexity: medium
- priority: P0

## Problem

A temporary eviction has an end date. Nothing today reminds the practitioner, and nothing records the decision. An eviction must never end by itself.

## Proposed change

On the console: from 7 days before `exclusion_until` (Morgane's answer may change the number), the patient file and the patient list show « Éviction à réévaluer » with the term and the date. The practitioner answers with one of three buttons: « Prolonger » (a new date), « Terminer » (the directive is archived, the reason kept), « Passer en durable » (`exclusion_durable` set, the date cleared). Each answer writes an audit event. Until an answer, the eviction stays applied by the gate.

## Acceptance criteria

- [ ] From 7 days before the end date, the file and the list show « Éviction à réévaluer » with the term and the date.
- [ ] « Prolonger » asks a new date and keeps the eviction applied.
- [ ] « Terminer » archives the directive and records the date and the practitioner.
- [ ] « Passer en durable » clears the date and sets the durable status.
- [ ] No answer leaves the eviction applied.
- [ ] Every answer writes an audit event (D-32).

## Out of scope

- E-mail or in-app notification.
- The suspension past the date (suggestion-suspension).

## Notes

- D-31: the list signal uses the same signal row the file statuses use. D-32: audit.
- Files: the console patient page, the patient list signal, `patient-food-directives/`.
- cross-epic: patient-list-and-status (the list column that carries signals), food-directives/directive-fields (the columns).
