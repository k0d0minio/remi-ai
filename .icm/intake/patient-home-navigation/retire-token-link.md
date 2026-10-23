# Stub: The token link closes and points the patient to their account

- feature-slug: retire-token-link
- epic: patient-home-navigation
- story: 31
- sequence: 4 of 4
- depends-on: profile-tab
- complexity: medium
- priority: P1

## Problem

Two patient surfaces cannot coexist: the token link shows features the stories rule out and bypasses the account (D-26).

## Proposed change

The route `apps/web/app/[locale]/p/[token]` and its ten pages are removed. A visit to an old link shows one message in French: the space has moved, sign in or ask your practitioner for an invitation. The console's « Lien patient » controls go. `patient_link_writes` and the token columns stay for the audit trail (breakdown question 1 for Jamie). `RETENTION.md` records the change. The existing patients' path to an account is breakdown question 1 for Morgane and is built in `patient-signup-account`.

## Acceptance criteria

- [ ] No route under `/p/[token]` renders patient data.
- [ ] An old link shows the moved message with a sign-in link, in French.
- [ ] The console no longer offers to create, copy or regenerate a patient link.
- [ ] `RETENTION.md` says what happened to the link tables.
- [ ] The repas, progression, messages, placard-frigo and documents pages have no replacement in the new shell.

## Out of scope

- Account creation for existing patients: `patient-signup-account`.
- Deleting the tables.

## Notes

D-26, D-30 (story 30 rules out points, badges and periodic feedback). Files: `apps/web/app/[locale]/p/`, `apps/admin/app/(admin)/patients/[id]/`, `.icm/docs/RETENTION.md`. Cross-epic: `patient-signup-account`.
