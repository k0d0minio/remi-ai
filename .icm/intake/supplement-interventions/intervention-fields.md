# Stub: An intervention row carries type, route, moment, frequency, duration, precautions and status

- feature-slug: intervention-fields
- epic: supplement-interventions
- story: 18
- sequence: 1 of 2
- depends-on: none
- complexity: medium
- priority: P0

## Problem

`patient_supplements` holds name, dose, timing and reason. The story needs type, route, moment and frequency as lists with a free option, a duration, precautions and a status with three values. Nothing today distinguishes a plant from an essential oil, or suspended from ended.

## Proposed change

Extend `patient_supplements`: `kind` (complement | plant | essential_oil | other), `route` (oral | skin | other, with a free note), `moment` (one of Morgane's six keys, or free text), `frequency` (daily | some_days | occasional | custom, with a free note), `started_on`, `ends_on` (nullable dates), `duration` (nullable text), `precautions` (text), `status` (active | suspended | ended, default active), `incomplete` (boolean, default false). `timing` becomes the free note of `moment`. One migration: existing rows get `kind` = complement and `status` = active, or `ended` with `ends_on` = `archived_at` when archived. A migrated row also gets `incomplete` = true, because route, moment and frequency are empty. The service clears the flag when a save fills the three. The service gains `activeInterventions(patientId)`: validated, active rows for the patient side. Each write is an audit event.

## Acceptance criteria

- [ ] The migration adds the columns and maps every existing row without data loss.
- [ ] A migrated row carries `kind = complement` and `incomplete = true` until route, moment and frequency are filled. The form requires them on the next edit.
- [ ] Several interventions can exist for one patient.
- [ ] `kind` offers exactly four « Type » values: complement, plant, essential_oil and other.
- [ ] `moment` offers matin, midi, soir, avant repas, pendant repas, après repas, au coucher, and a free text.
- [ ] `frequency` offers chaque jour, certains jours, ponctuellement, personnalisée, with a free note.
- [ ] A duration such as « 3 semaines » saves without an end date.
- [ ] A new row has status « Actif ».
- [ ] `activeInterventions` returns validated, active rows only.
- [ ] Every write is an audit event (D-32).

## Out of scope

- The form (intervention-form).
- The patient page.

## Notes

- D-25: one migration, production only. Shared files first: this stub owns the schema change.
- Files: `schema.ts`, a migration, `patient-supplements/`, `shared/patient.ts` (the new keys and labels).
- cross-epic: protocol-versions (validation state), patient-recommendations (reader).
