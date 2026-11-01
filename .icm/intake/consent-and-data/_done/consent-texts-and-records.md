# Stub: Each consent a patient gives is stored with its date and the version of the text

- feature-slug: consent-texts-and-records
- epic: consent-and-data
- story: 3
- sequence: 1 of 6
- depends-on: none
- complexity: medium
- priority: P0

## Problem

Consent is two hand-filled columns on `patient_profiles`. No text, no version, no per-consent
record. Story 3 needs each consent traceable and opposable.

## Proposed change

Add the consent texts as versioned files under `packages/services/src/consent/texts/` (Jamie's
question 1), each with a key, a version and a language. Seed version 1 from the pilot privacy
policy in Drive. Add the `patient_consents` table: patient, consent key, text version, text
hash, `given`, `refused` or `withdrawn`, timestamp. Expose `recordConsent` and `consentsOf` in the server
entrypoint. Keep the two old columns read-only until the migration of existing patients.

## Acceptance criteria

- [ ] Each consent row stores the key, the text version, the text hash, the decision and the timestamp
- [ ] A text change is a new version file. An old row still resolves to the text it accepted
- [ ] `consentsOf(patient)` returns the latest decision per key
- [ ] Recording a consent writes an audit event (D-32)
- [ ] Existing patients' `consent_date` and `consent_channel` are mapped into one row of key `care` with version `legacy`, and nothing is lost

## Out of scope

- Any screen. The genetic consent's condition.

## Notes

- D-32. Touches `schema.ts` and the migrations journal, so it goes first in this epic.
- Default texts: `care` (mandatory) and `genetic` (optional), per Morgane's question 2.
