# Stub: Drop the hand-recorded consent columns from patient_profiles

- lane: chore
- found-by: consent-and-data/consent-texts-and-records, pull request 159 · 2026-11-01
- complexity: low
- priority: P2
- blocked: waits on `consent-and-data/consent-gate-at-signup`

## Problem

`patient_profiles.consent_date` and `consent_channel` are read-only since `consent-texts-and-records`. Migration `0027` copied each dated pair into one `care` row of version `legacy` in `patient_consents`. The admin form and the patient page still read the two columns for the « Recueilli le … » badge (`apps/admin/components/patients/patient-form.tsx`, `apps/admin/app/(admin)/patients/[id]/page.tsx`).

## Proposed change

Read the badge from `consentsOf()`. Then drop the two columns in a migration, and remove `consentChannels` where nothing else reads it.

## Acceptance criteria

- [ ] The admin badge reads the latest `care` row of `patient_consents`.
- [ ] A migration drops `consent_date` and `consent_channel`, and no code reads them.
- [ ] `.icm/docs/RETENTION.md` no longer names the two columns.
