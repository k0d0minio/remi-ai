# Stub: REMI sends its e-mails from remiai.be

- lane: chore
- found-by: triage/remiai-be-addresses · 2026-11-17
- complexity: low
- priority: P2

## Problem

`EMAIL_FROM` is `REMI <no-reply@mail.jamienisbet.com>` on every target, until `remiai.be` is
verified in Resend (`.icm/docs/ENV.md`). The Neon API on 2026-11-17: the e-mail provider of Neon
Auth of the Neon project `remi-ai` has the same sender. The domain is on a personal account that
REMI does not own.

## Proposed change

Jamie verifies `remiai.be` in Resend. Then set `EMAIL_FROM` to `REMI <no-reply@remiai.be>` on
every target of `admin`, and the sender of Neon Auth in the two Neon projects. Then correct the
`EMAIL_FROM` sentence of `.icm/docs/ENV.md` and the sender line of `.icm/intake/README.md`.

## Acceptance criteria

- [ ] Resend shows `remiai.be` as verified
- [ ] An operator invitation and a sign-in e-mail arrive from `no-reply@remiai.be`
- [ ] `.icm/docs/ENV.md` names `no-reply@remiai.be` as the sender
