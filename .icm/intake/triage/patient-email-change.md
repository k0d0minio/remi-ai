# Stub: A patient changes the e-mail address of their account

- lane: tweak
- found-by: preparatory-questionnaire/questionnaire-flow · 2026-11-03
- complexity: medium
- priority: P2

## Problem

Story 4 says Identité shows the e-mail from sign-up and an e-mail change follows `patient-signup-account/sign-in-and-session`. That stub has no e-mail change flow. The questionnaire shows the e-mail read-only with « Pour modifier votre e-mail, contactez votre praticien » (`apps/web/app/[locale]/questionnaire/_components/questionnaire-flow.tsx`).

## Proposed change

Investigate. The change must update the auth identity, `patient_accounts.email` and `patient_profiles.email` together, and confirm the new address by e-mail.

## Acceptance criteria

- [ ] The patient changes their e-mail from Identité and signs in with the new address after the confirmation
- [ ] The old address no longer signs in
- [ ] The change writes an audit event
