# Stub: An account inactive for twelve months is deleted, thirty days after a notice

- feature-slug: inactive-account-deletion
- epic: consent-and-data
- story: 3
- sequence: 6 of 6
- depends-on: none
- complexity: medium
- priority: P1

## Problem

The pilot privacy policy (Drive, section 7) promises the deletion of an inactive account after
12 months, preceded by a notification. `RETENTION.md` says: no expiry job, no deletion prompt,
no scheduled purge. Jamie decided on 2026-10-23 to build it. The first deletion can occur twelve
months after the first account at the earliest, so this stub ships after the open day without
breaking the promise.

## Proposed change

One idempotent cron route on `apps/web`, daily at 03:00 Europe/Brussels, the same pattern as the
recipe top-up (`recipe-space`). Inactivity counts from the later of the patient's last sign-in and
the patient's last write (Jamie's question 2). At eleven months the route sends the patient one
e-mail « Votre compte REMI sera supprimé le <date> » with a sign-in link, and a copy to the
practitioner. A sign-in after the notice cancels the deletion and restarts the clock. At twelve
months, with the notice sent at least thirty days earlier and no sign-in since, the route deletes
the patient through `deletePatient`, the same cascade as the console (`RETENTION.md`), files
first. An admin may set a retention hold on a file. A hold blocks the deletion and the route logs
the skip (Morgane's question 6).

## Acceptance criteria

- [ ] A patient with no sign-in and no write for eleven months receives one notice e-mail that names the deletion date. The practitioner receives a copy
- [ ] A sign-in after the notice cancels the deletion. The next notice comes eleven months after that sign-in
- [ ] A patient twelve months inactive, with a notice at least thirty days old, is deleted through the same cascade as the console's deletion. Files go first
- [ ] A retention hold set by an admin blocks the deletion. The route writes one log line per skipped patient
- [ ] Each deletion writes an audit event with actor kind `system` and reason `inactivity`
- [ ] The route is idempotent: a second run on the same day sends no second e-mail and deletes nothing twice
- [ ] `RETENTION.md` says what the route does and when

## Out of scope

- A deletion the patient asks for. Deletion of a practitioner account. Legal retention periods beyond the hold.

## Notes

- D-32. cross-epic: `patient-signup-account/auth-seam` gives the last sign-in. `care-activation/activation-email` sets the e-mail template this notice follows. `recipe-space/weekly-plan-generation` sets the cron pattern.
- The notice goes through the email seam (Resend). With no mailer registered, the route sends nothing and deletes nothing.
