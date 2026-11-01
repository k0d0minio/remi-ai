# Stub: Deleting a patient also deletes their Neon Auth user

- lane: bug
- found-by: patient-signup-account/auth-seam · 2026-11-01
- complexity: medium
- priority: P1

## Problem

`deletePatient` removes the `patient_profiles` row. The cascade removes the `patient_accounts` row.
The Neon Auth user in the `neon_auth` schema stays. Its e-mail and name outlive the patient file.
`.icm/docs/RETENTION.md` does not name the auth store.

## Proposed change

Add a delete-user call to the auth seam. `deletePatient` calls it with the account's `auth_subject`
before it removes the file. Name the auth store in `.icm/docs/RETENTION.md`.

## Acceptance criteria

- [ ] `AuthProvider` has a call that deletes one user by subject
- [ ] `deletePatient` deletes the patient's auth user when the patient has an account
- [ ] A failed auth delete stops the patient delete and returns `upstream_failed`
- [ ] `.icm/docs/RETENTION.md` names the `neon_auth` schema and its delete path
