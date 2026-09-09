# Stub: Structured anamnesis — brainstorm § B's categories replace the single blob

- feature-slug: anamnesis-structure
- sequence: 3 of 6
- depends-on: none
- priority: P1
- size: M
- sources: v2 brainstorm § B (ANAMNESIS) · scope answers 2026-09-01 (breakdown.md § Decisions)

## What this is

Today the anamnesis is one text column on the profile. § B structures it into twelve categories —
motif et attentes; santé; alimentation; hydratation; digestion; élimination; sommeil / stress /
énergie; immunité / ORL / respiration; cardiovasculaire / lymphatique; ostéo-articulaire /
activité; endocrinien / gynéco; contexte de vie — because the eventual model is a questionnaire
and a consultation transcript _filling these slots automatically_, with Morgane correcting rather
than re-typing.

Manual-first version: one free-text body per category, per patient. Morgane types into whichever
categories a consultation touched; empty categories cost nothing and render as nothing. The admin
patient page presents them as one editable block in § B's order — this is her working record,
phone-usable mid-consultation, and it never renders on the patient link (same rule as consultation
notes today).

The existing `anamnesis` blob is preserved: it becomes the seed content Morgane redistributes by
hand, and the old field disappears from the form only once she has emptied it (keep the column
until then — its retirement is a follow-up `tweak`, cut when she is done).

Design the storage so the AI round _writes into the same slots_ (a category row gaining
machine-drafted content pending her correction is a new writer, not a new table).

## Worth knowing

- A category list is domain vocabulary: constants in `packages/services/src/shared/`, types
  derived from them, French labels in the admin `vocabulary.ts` — the § B wording is the label
  source.
- One row per (patient, category) with a text body is the lean shape that fits the seam and the
  in-memory test client; twelve columns on the profile is the rigid alternative. The spec decides;
  the stub only requires: § B's categories, per-category editing, cheap emptiness.
- Never rendered at `/p/[token]` — assert it where the query lives, not only in the page.

## Open questions — flag these on pickup

- The category list is § B's twelve, verbatim — but the wording is Morgane's to trim. Confirm the
  list and the French labels with her before freezing the vocabulary constants.
- Does she want a per-category "last touched" date visible (an anamnesis ages block by block), or
  is the row's updated-at enough for the beta?

## Prompt

Run `/pipeline new .icm/intake/patient-record/anamnesis-structure.md` in the remi-ai repo and
follow the pipeline from there. Read the stub and its epic's `breakdown.md` first. Scope: a
per-patient, per-category anamnesis (§ B's twelve categories) with table + migration, service
behind the seam, and an editable block on the admin patient page; the legacy `anamnesis` field
stays until Morgane empties it; nothing renders on the patient link. Raise the stub's open
questions rather than answering them.
