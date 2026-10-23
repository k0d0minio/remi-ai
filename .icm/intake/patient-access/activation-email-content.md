# Stub: The activation e-mail tells the patient how to open REMI like an app

- feature-slug: activation-email-content
- epic: patient-access
- story: 22
- sequence: 2 of 3
- depends-on: none
- complexity: medium
- priority: P0

## Problem

The patient must find REMI again easily on a phone. There is no app store listing. The e-mail is the one place to say how.

## Proposed change

An e-mail template « Votre espace REMI est prêt » in the email seam, in French: a sign-in link, then two short step lists, « Sur iPhone » (Safari, Partager, Sur l'écran d'accueil) and « Sur Android » (Chrome, menu, Ajouter à l'écran d'accueil). `apps/web` ships a web app manifest and icons so the shortcut opens full screen with the REMI icon. `care-activation/activation-email` sends this template.

## Acceptance criteria

- [ ] The e-mail holds a sign-in link to `apps/web`.
- [ ] The e-mail explains the home-screen shortcut for iPhone and for Android, without an app store.
- [ ] The e-mail is in French and uses the patient's first name.
- [ ] `apps/web` serves a manifest with name, icons and `display: standalone`.
- [ ] The e-mail renders in the console mailer in development and through Resend in production.

## Out of scope

- The send, once, and the retry: `care-activation/activation-email`.

## Notes

Files: `packages/services/src/email/templates/`, `apps/web/app/manifest.ts`, icons under `apps/web/app/`. Cross-epic: `care-activation/activation-email`.
