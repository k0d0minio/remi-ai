# Stub: « Reprendre mon dossier » fails with a 500 on every submit

- lane: bug
- found-by: UAT test of uat-app.remiai.be with `test+…@jamienisbet.com` accounts · 2026-11-05
- complexity: low
- priority: P0

## Problem

Observed on UAT, 2026-11-05:

1. The practitioner creates a file with an e-mail address. The patient signs up with the same
   address. The page shows « Un dossier existe déjà pour cette adresse. ». « Recevoir un lien par
   e-mail » sends « Reprenez votre dossier REMI ». This part works.
2. The link opens `/fr/inscription/reprendre/<token>`. The consent step and the password field show.
3. The submit returns « This page couldn't load » (HTTP 500).

The runtime log says: `x-forwarded-host header with value uat-app.remiai.be does not match origin
header with value null from a forwarded Server Actions request. Aborting the action.`

Cause: the page sets `referrer: "no-referrer"`
(`apps/web/app/[locale]/inscription/reprendre/[token]/page.tsx:28`). With that policy the browser
sends `Origin: null` on the form POST. The Next.js Server Actions origin check then rejects every
submit. No patient can take over a file that the practitioner created.

## Proposed change

Set the page's referrer policy to `same-origin`. The token still does not leave the site, and the
same-origin POST carries its real `Origin`. Check the other token pages for the same setting.

## Acceptance criteria

- [ ] On UAT, a patient opens a claim link, accepts the consent, sets a password, and lands on `/fr/questionnaire` with the practitioner's entries.
- [ ] The console list still shows one row for that patient. The audit shows `patient.file_taken_over`.
- [ ] A request from the takeover page to another site carries no `Referer` that contains the token.
- [ ] No other page under `apps/web` sets `no-referrer` on a page that holds a form.
