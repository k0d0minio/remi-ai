# Stub: Free text to rows — paste or dictate a protocol, REMI fills the grid for review

- feature-slug: free-text-to-rows
- sequence: 5 of 5
- depends-on: mistral-adapter
- priority: P2
- size: M
- sources: feedback § 5 ("Ensuite, l'IA pourra améliorer ce fonctionnement" — the omega-3 /
  magnesium / vitamin D example) · braindump `developpement-produit/ai.md` (the recommendations
  parser) · decision #8 (**excluded from the first AI round, Jamie 2026-09-10** — parked here so
  it is not lost; lifting the P2 is an owner decision, not a pickup) · decision #14 (2026-09-11:
  the reason is "grid first so the model has a slot to fill"; re-examined at the 31 October
  milestone) · cross-epic: `practitioner-workflow/bulk-entry` (the grid it fills)

## What this is

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

## Worth knowing

- This is the braindump's "parser de recommandations" at its smallest useful size — text, not
  PDF. PDF ingestion is `beyond-december/autonomous-patient-pdf-import`'s question.
- Category assignment for recommendations is the risky mapping; the vocabulary file is the
  prompt's enum and a miss lands in a "à classer" category she fixes in the grid.

## Open questions — flag these on pickup

- Only when the owner lifts the P2: which section first — supplements are the most structured and
  the example she gave.

## Prompt

Run `/pipeline new .icm/intake/ai-assist/free-text-to-rows.md` in the remi-ai repo and follow the
pipeline from there — **only after the owner has lifted this stub's P2 (decision #8 excluded it
from the first AI round)**. Read the stub, its epic's `breakdown.md` and the `mistral-adapter` and
`practitioner-workflow/bulk-entry` runs' notes first. Scope: a paste-a-text box in each protocol
section's edit mode that makes one structured `fast` call returning rows in the section's schema,
appended to the grid unsaved for review; unplaced text shown as a remainder; browser dictation
where available; logged. No model write, no PDF. Raise the stub's open question rather than
answering it.
