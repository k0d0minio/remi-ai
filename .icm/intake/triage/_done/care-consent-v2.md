# Stub: The care consent a patient accepts is a finished text that matches the paid pilot

- lane: bug
- found-by: the UAT audit of uat-app.remiai.be/fr/inscription/<token> · 2026-11-12
- complexity: medium
- priority: P0

## Problem

Every patient must accept `packages/services/src/consent/texts/care/1.fr-BE.md` at sign-up.
The text shows 24 draft markers (« À CONFIRMER », « À VALIDER », « À COMPLÉTER », « À COMPLÉTER
PAR JAMIE »). It says « phase de test pilote gratuite » and « l'utilisation de REMI est
entièrement gratuite ». The marketing site sells the pilot at 119 € and 349 €
(`apps/marketing/lib/content/landing.ts`). Arnaud accepted version 1 on 2026-11-11. The public
privacy page (`apps/marketing/lib/content/legal.ts`, `PRIVACY`) also contradicts version 1.

## Proposed change

Write version 2 of the care text from the facts the repo holds. Remove the « gratuite » claims.
List every open point as a question. Publish version 2 only after Jamie answers: add the file to
`files` in `packages/services/src/consent/index.ts` and pin its hash in `index.test.ts`.

## Acceptance criteria

- [ ] `care/2.fr-BE.md` holds no draft marker (« À CONFIRMER », « À VALIDER », « À COMPLÉTER »)
- [ ] Version 2 does not say that the pilot or REMI is free
- [ ] Version 2 names the sub-processors the repo holds: Vercel (team `remi21`), Neon, Vercel Blob, Resend, Vercel Web Analytics
- [ ] Version 2 states the AI status that is true on the day it takes effect
- [ ] Version 2 does not contradict the public privacy page, or a parked stub corrects that page
- [ ] `currentConsentText("care", "fr-BE")` returns version 2, and `care/1/fr-BE` keeps its pinned hash
- [ ] A new sign-up records `care` version 2
