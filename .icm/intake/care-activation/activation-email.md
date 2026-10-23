# Stub: The patient receives « Votre espace REMI est prêt », once

- feature-slug: activation-email
- epic: care-activation
- story: 19
- sequence: 3 of 3
- depends-on: activation-action
- complexity: medium
- priority: P0

## Problem

The patient must know when the space is ready. The e-mail must go out once, and a failed send must not stay silent.

## Proposed change

On a successful activation the email seam sends « Votre espace REMI est prêt » to the account's address. The send result is stored on the file: sent at, or failed with the reason. On failure the file shows a warning and a button « Renvoyer l'e-mail ». The template content is `patient-access/activation-email-content`.

## Acceptance criteria

- [ ] The e-mail is sent once, at the moment the activation succeeds.
- [ ] A failed send shows a warning on the patient file with the reason.
- [ ] « Renvoyer l'e-mail » sends the same e-mail again and records the new result.
- [ ] A later validation of the protocol sends no e-mail.
- [ ] Each send is an audit event.

## Out of scope

- The e-mail wording: `patient-access/activation-email-content`.

## Notes

D-32. Files: `packages/services/src/email/templates/`, a `sent_at` and `last_error` pair on the file or a small `patient_emails` table (Jamie's call), `apps/admin/app/(admin)/patients/[id]/`. Cross-epic: `patient-access/activation-email-content`.
