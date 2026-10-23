# Stub: The patient receives the list in their own mailbox

- feature-slug: shopping-list-email
- epic: shopping-list
- story: 26
- sequence: 3 of 3
- depends-on: shopping-list-screen
- complexity: low
- priority: P1

## Problem

Morgane wants the patient to find the list in their e-mail.

## Proposed change

An « Envoyer par e-mail » button on the list screen. One templated mail through the email seam to the account's e-mail address: the recipe names, the items with quantity and unit and a box character per item. No health data, no recommendation. The send is logged as an audit event. The `web` project registers the Resend adapter and gains `RESEND_API_KEY` and `EMAIL_FROM`. With the key unset the button says the mail cannot be sent and sends nothing.

## Acceptance criteria

- [ ] The patient receives one e-mail with the items, quantities and tick boxes.
- [ ] The mail contains no personal health information and no recommendation.
- [ ] A failed send is shown to the patient and never reported as sent.
- [ ] `.icm/docs/ENV.md` lists `RESEND_API_KEY` and `EMAIL_FROM` as required on the `web` project.
- [ ] The send is one audit event with the list id.

## Out of scope

- Sending to another address. A PDF attachment.

## Notes

D-32. Files: `packages/services/src/email/templates/shopping-list.ts`, `apps/web` registration, `.icm/docs/ENV.md`, `apps/web/.env.example`. Cross-epic: `patient-signup-account` (the account e-mail).
