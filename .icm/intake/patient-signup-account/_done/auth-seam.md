# Stub: One auth seam serves patients and operators, and a patient can hold an account

- feature-slug: auth-seam
- epic: patient-signup-account
- story: 2
- sequence: 1 of 4
- depends-on: none
- complexity: high
- priority: P0

## Problem

A patient has no account. The share token is the whole credential (D-2, superseded). The
operator console has its own scrypt and HMAC module. Story 2 needs an account the patient
creates once and keeps.

## Proposed change

Add an auth seam to `packages/services`: sign up, sign in, magic link, sign out, current
session, password reset. A patient signs up and signs in with a password or with a magic link
(Jamie, 2026-11-01). One adapter behind it (Jamie's question 1, default Neon Auth). Add the
`patient_accounts` table: one row per `patient_profiles` row, e-mail, the adapter's subject id,
created and activated timestamps. Nothing above the seam names the vendor.

## Acceptance criteria

- [ ] `packages/services/src/auth/` exports one interface for password sign up, password sign in, magic-link request, sign out, session read and password reset
- [ ] A magic-link request sends one e-mail. The link signs the patient in, and creates the account when none exists
- [ ] One adapter is registered at process start by `apps/web`. No app imports the vendor directly
- [ ] The migration adds `patient_accounts` with a unique `patient_profile_id` and a unique e-mail per practitioner
- [ ] A session read returns the principal kind (`patient` or `operator`) and its id
- [ ] The operator console keeps working unchanged on this branch
- [ ] `.icm/docs/ENV.md` and the three env lists name every new variable. No value enters git

## Out of scope

- The pages. Any migration of operator accounts onto the new adapter.

## Notes

- D-26, D-28. Touches `schema.ts`, the migrations journal, the lockfile and the env lists, so it goes first.
- Jamie's question 2 decides whether operators move later. This stub leaves them where they are.
