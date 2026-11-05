# Stub: The patient app's home page opens the September prototype with any password

- lane: bug
- found-by: UAT test of uat-app.remiai.be · 2026-11-05
- complexity: low
- priority: P0

## Problem

Observed on UAT, 2026-11-05:

1. `https://uat-app.remiai.be` redirects to `/fr` or `/en`. That page is the old entry screen
   « Connexion — Continuer en tant que Patient / Praticien »
   (`apps/web/app/[locale]/page.tsx`). It is not the patient sign-in at `/fr/connexion`.
2. Any e-mail and any password with « Praticien » open `/fr/clients` as « Dr Hélène Vasseur »,
   with four fixture people. The session is the development stand-in
   (`apps/web/lib/auth/session.ts:55-61`, `development-session.ts`), because no session provider
   is registered.

Production `app.remiai.be` serves the same entry screen.

Effect: Morgane and every patient who types the bare address land on a page that is not the
product. A visitor with any password sees a fake practitioner space. The stub
`patient-home-navigation` retires this surface, but it is far down the order.

## Proposed change

Make `/[locale]` redirect to `/[locale]/connexion`, or to the patient's landing page when a patient
session exists. Refuse the development session outside `NODE_ENV=development`.

## Acceptance criteria

- [ ] `https://uat-app.remiai.be` opens the patient sign-in `/fr/connexion` (or `/en/connexion`).
- [ ] A signed-in patient who opens `https://uat-app.remiai.be` lands on `/fr/questionnaire`.
- [ ] On UAT and production, no form or cookie opens `/fr/clients`, `/fr/today` or another `(app)` page without a real session.
- [ ] Local development keeps the development session.
