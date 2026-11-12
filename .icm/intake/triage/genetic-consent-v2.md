# Stub: The genetic consent covers the DNA test that the pilot sells

- lane: bug
- found-by: triage/care-consent-v2 · 2026-11-12
- complexity: low
- priority: P1

## Problem

`packages/services/src/consent/texts/genetic/1.fr-BE.md` says a patient gives a génotype « uniquement si un test génétique a déjà été réalisé ». The offer « REMI + analyse génétique » (349 €, `apps/marketing/lib/content/landing.ts`) includes a DNA test and a specialist doctor. `packages/services/src/consent/index.ts` says Morgane validates the text, and her edit is version 2. No record of that validation exists. Version 1 gives `morgane@remiai.be` for a withdrawal. Jamie set `info@remiai.be` as the data-protection contact on 2026-11-12.

## Proposed change

Write `genetic` version 2 with Morgane: the test of the offer, the laboratory, the doctor, and who receives the result. The result enters REMI only after the genetic consent (Jamie, 2026-11-12). Use `info@remiai.be` as the contact. Publish it as a new version file.

## Acceptance criteria

- [ ] `genetic` version 2 names the test of the offer and who receives its result
- [ ] `genetic` version 2 gives `info@remiai.be` for a withdrawal
- [ ] Morgane's validation is recorded in the pull request
- [ ] `genetic/1/fr-BE` keeps its pinned hash
