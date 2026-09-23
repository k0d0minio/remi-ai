# Stub: Free text to rows — paste or dictate a protocol, REMI fills the grid for review

- feature-slug: free-text-to-rows
- scope: ai-assist
- personas: practitioner
- initiative: a patient experience validated on real terrain, in time for the December open day / objective: a usable patient version for the partner clinic to test on 1 December
- depends-on: ai-gateway-adapter
- sequence: 5 of 5
- priority: P2
- size: M
- sources: feedback § 5 ("Ensuite, l'IA pourra améliorer ce fonctionnement" — the omega-3 /
  magnesium / vitamin D example) · braindump `developpement-produit/ai.md` (the recommendations
  parser) · decision D-8 (**excluded from the first AI round, Jamie 2026-09-10** — parked here so
  it is not lost; lifting the P2 is an owner decision, not a pickup) · decision D-14 (2026-09-11:
  the reason is "grid first so the model has a slot to fill"; re-examined at the 31 October
  milestone) · cross-epic: `practitioner-workflow/bulk-entry` (the grid it fills)

## Problem

Her § 5 example — « Oméga-3 2 g/jour au repas, magnésium bisglycinate 300 mg le soir… » typed or dictated, turned into rows — is the parser the braindump asked for. `bulk-entry` built the grid; nothing fills it from text. Excluded from the first AI round by D-8; parked here so it is not lost.

## Proposed change

Her § 5 example, verbatim: "j'écris ou je dicte « Oméga-3 2 g/jour au repas, magnésium
bisglycinate 300 mg le soir, vitamine D 2 000 UI/jour ». REMI transforme ensuite cela en champs
structurés." `bulk-entry` built the grid; this stub fills it:

- In each section's edit mode a **« Coller un texte »** box: free text in, a `fast` structured
  call returns rows against the section's schema (supplements: name / dose / timing / reason;
  recommendations: category / title / detail; essentials: item / why). The rows are **appended to
  the grid unsaved** — she reviews and saves, exactly as with a template or a copy from another
  patient. Nothing is written by the model.
- Dictation is the browser's: the box accepts a `speech-to-text` input where the device offers
  it; no audio vendor.
- Logged like every generation; rows the parser could not place are shown as a remainder line,
  not dropped silently.

## Acceptance criteria (rough)

- [ ] In each protocol section's edit mode a « Coller un texte » box makes one structured `fast` call and appends the returned rows to the grid unsaved, for review
- [ ] Text the parser could not place is shown as a remainder line, not dropped
- [ ] Dictation uses the browser's speech input where the device offers it; no audio vendor
- [ ] Every call is logged; a recommendation the model cannot categorise lands in « à classer »

## Out of scope (this feature)

- PDF ingestion (`beyond-december/autonomous-patient-pdf-import`); any model write to the record

## Notes for Define

- **Decisions that bind** ([`README.md § Decisions of record`](../README.md)): D-8 (excluded from the first round) · D-14 (re-examined at the 31 October milestone; lifting the P2 is the owner's decision, not a pickup's).

- This is the braindump's "parser de recommandations" at its smallest useful size — text, not
  PDF. PDF ingestion is `beyond-december/autonomous-patient-pdf-import`'s question.
- Category assignment for recommendations is the risky mapping; the vocabulary file is the
  prompt's enum and a miss lands in a "à classer" category she fixes in the grid.

**Open for Define** — settled with the operator before the spec is approved, never assumed:

- Only when the owner lifts the P2: which section first — supplements are the most structured and
  the example she gave.

## Prompt

Run `/pipeline new free-text-to-rows` in the remi-ai repo — **only after the owner has lifted this stub's P2 (D-8 excluded it from the first AI round)**. Define reads this stub, its epic's `breakdown.md` and the decisions of record in `.icm/intake/README.md`, and asks the points under **Open for Define** rather than answering them. Scope is the Proposed change and nothing under Out of scope.
