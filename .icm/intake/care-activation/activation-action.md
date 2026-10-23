# Stub: The practitioner activates the accompaniment and the file becomes « Accompagnement actif »

- feature-slug: activation-action
- epic: care-activation
- story: 19
- sequence: 2 of 3
- depends-on: activation-recap
- complexity: medium
- priority: P0

## Problem

The patient space must open only on the practitioner's decision, after the recap, and the file status must say so.

## Proposed change

The button « Activer l'accompagnement » on the patient file opens the recap. A confirmation runs one transaction:

- the working copy becomes validated version 1 (cross-epic: `protocol-versions/working-copy-and-validate`),
- the file status becomes « Accompagnement actif » (D-31),
- an audit event records who activated, and when (D-32),
- the activation e-mail is queued (`activation-email`).

## Acceptance criteria

- [ ] Only a practitioner of the patient's file can activate it.
- [ ] The confirmation is refused while the recap shows a blocker.
- [ ] After confirmation the file status reads « Accompagnement actif » in the file and in the list.
- [ ] An audit event names the practitioner, the patient and the time.
- [ ] A second click on an active file does nothing and says the space is already active.

## Out of scope

- The e-mail: `activation-email`.
- Undo or suspension (question 3 of the breakdown).

## Notes

D-31, D-32. The status enum has one home (cross-epic: `patient-list-and-status`). Files: `apps/admin/app/(admin)/patients/[id]/`, a server action in `packages/services/src/services/`, `audit_events`.
