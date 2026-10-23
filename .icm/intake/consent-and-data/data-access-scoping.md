# Stub: A practitioner reads only their own patients, and REMI-team access is logged

- feature-slug: data-access-scoping
- epic: consent-and-data
- story: 3
- sequence: 4 of 6
- depends-on: none
- complexity: medium
- priority: P0

## Problem

Today every operator sees every patient. Story 3 limits access to the patient, their
practitioner, and REMI-team members when a technical or administrative need exists, with a
trace.

## Proposed change

Every patient read and write in `packages/services/src/db/services/` takes the actor and
filters on the care relationship (`patient-file-creation/care-relationship`). A `practitioner`
role sees only patients whose `practitioner_id` is theirs. An `admin` role may open any
patient. Each admin open writes an audit event with the reason field the console asks for.
The patient's own session reads only their own profile.

## Acceptance criteria

- [ ] A practitioner's list and file pages return only their patients. A direct URL to another patient's file returns not found
- [ ] An admin opening a patient file is asked for a one-line reason and the open is logged with it
- [ ] The audit page lists admin opens with actor, patient and reason
- [ ] A patient session cannot read or write another patient's rows
- [ ] Every service function that reads patient data has a test for the cross-practitioner case

## Out of scope

- The `practitioner_id` column and its backfill (`patient-file-creation/care-relationship`).

## Notes

- D-27: roles `admin` and `practitioner` replace today's `owner` and `operator` on `operators.role`. The rename belongs to this stub.
- cross-epic: `patient-file-creation/care-relationship` must merge first.
