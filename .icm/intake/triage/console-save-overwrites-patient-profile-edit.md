# Stub: A stale console save silently overwrites the patient's profile edit — allergies included

- lane: bug
- priority: P1 — allergies are a safety-critical input to recipe generation (D-6)
- found-by: `patient-profile-edit` Release code review (PR #131) · 2026-09-25
- size: M

## Problem

The admin patient form posts every field on each save. `updatePatient`
(`packages/services/src/db/services/patients/index.ts`) treats any posted value that differs from
the stored one as Morgane's change: it writes it and drops that field's « modifié par la patiente »
marker. If Morgane opened the form before the patient saved « Mon profil » — say the patient added
« arachides » to their allergies — her later save of an unrelated field (the weight) posts the old
empty allergies, erases the patient's allergy, and removes the only sign it existed. The audit
trail keeps the patient's event, but nothing in the console shows the loss. The read-then-write
also drops a patient marker that lands between the two steps.

## Proposed change

Make the console save conflict-aware for the seven patient-editable fields: the form carries the
values (or the row's `patientEditedAt`/`updatedAt`) it was opened with, and the service only
writes a field Morgane actually changed from what she saw — a field the patient changed since
then is kept, or the save is refused with « la patiente a modifié son profil entre-temps ».

## Acceptance criteria

- [ ] A console save of an unrelated field never changes a patient-editable field the patient edited after the form was opened
- [ ] The « modifié par la patiente » marker survives such a save
