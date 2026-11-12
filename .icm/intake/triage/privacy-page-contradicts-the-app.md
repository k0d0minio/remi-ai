# Stub: The public privacy page states only what the app does

- lane: bug
- found-by: triage/care-consent-v2, the comparison with `care` version 2 · 2026-11-12
- complexity: medium
- priority: P1

## Problem

`apps/marketing/lib/content/legal.ts` (`PRIVACY`, « confidentialite ») contradicts the app and the care consent:

1. It says the site uses no audience tool. The three app layouts render `@vercel/analytics` (`apps/marketing/app/[locale]/layout.tsx` included).
2. It says the data is hosted in the European Union. The functions run in `iad1` until `vercel-function-regions-not-pinned` merges.
3. It says genetic data goes to a laboratory and a specialist doctor. The care consent version 1 says only the patient and the practitioner see it.
4. Its retention lines (12 months for the pilot sign-up, 24 months for interactions, 30 days after erasure for medical data) are not the rules in `.icm/docs/RETENTION.md`.
5. Its data-protection contact is `info@remiai.be`. The care consent says `morgane@remiai.be`.

## Proposed change

Align `PRIVACY` with the published care consent and `.icm/docs/RETENTION.md`, after Morgane and her lawyer approve the wording. Do not edit `landing.ts`.

## Acceptance criteria

- [ ] The privacy page names Vercel Web Analytics, or no app renders it
- [ ] The privacy page states the hosting place that the Vercel API and the Neon console show
- [ ] The privacy page and the published care consent give the same contact, retention rules and recipients of genetic data
