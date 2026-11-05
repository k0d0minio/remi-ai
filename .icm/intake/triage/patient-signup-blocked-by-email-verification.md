# Stub: A new patient cannot get in: Neon Auth requires an e-mail check that the app never asks for

- lane: bug
- found-by: UAT test of uat-app.remiai.be with `test+…@jamienisbet.com` accounts · 2026-11-05
- complexity: medium
- priority: P0

## Problem

Observed on UAT, 2026-11-05:

1. A patient signs up from the practitioner's link. The account and the file are created. The
   audit shows `inscription par le lien` and `consentement donné`.
2. The sign-up redirects to `/fr/questionnaire`. There is no session, so the page redirects to
   `/fr/connexion`. The page shows no message.
3. Neon Auth sends « Verify Your Email Address - uat-remi-ai », in English, with a 6-digit code.
   The app has no page where the patient can type this code.
4. Sign-in with the correct password shows « Adresse e-mail ou mot de passe incorrect. ».
   `toServiceError` maps `EMAIL_NOT_VERIFIED` to `not_permitted`
   (`packages/services/src/auth/adapters/neon-auth.ts:77-84`).
5. The magic link (« Recevoir un lien ») sends an e-mail. The link lands on `/fr/connexion/lien`.
   That route finds no session and redirects to `/fr/connexion`. After the magic link, the
   password sign-in still fails, so the magic link does not verify the e-mail.

Cause: the Neon Auth setting `require_email_verification` is `true` with the method `otp`. The code
does not expect this (`apps/web/lib/signup/actions.ts:103` redirects as if a session exists).
The production project `remi-ai` has the same setting. The UAT project `uat-remi-ai` shows the same
behaviour (its config read was not available to the session).

Effect: no patient can complete a sign-up, sign in, or reach the questionnaire. Morgane cannot test
the patient side. Every patient stub after sign-up is untestable in UAT.

## Proposed change

Unblock now: set `require_email_verification` to `false` in the Neon console for `uat-remi-ai` and
`remi-ai`. Then fix the code: after sign-up, ask the patient for the e-mail code on a French page,
or keep the check off by decision. Map `EMAIL_NOT_VERIFIED` to its own message with a « Renvoyer le
code » action. Find why the magic link lands without a session, and fix it.

## Acceptance criteria

- [ ] On UAT, a new patient signs up from the practitioner's link and lands on `/fr/questionnaire`, signed in.
- [ ] The same patient signs out, then signs in with the password, and lands on `/fr/questionnaire`.
- [ ] « Recevoir un lien » sends an e-mail. The link signs the patient in and lands on `/fr/questionnaire`.
- [ ] If e-mail verification stays on: the patient types the code on a French page, and an unverified sign-in shows its own message, never « mot de passe incorrect ».
- [ ] `.icm/docs/ENV.md` § Patient auth records the value of `require_email_verification` for each Neon project.

## Questions

1. Must a patient prove the e-mail address before the questionnaire? Default: no for the pilot. The practitioner's link already ties the patient to a practitioner.
