# Stub: Pantry essentials — the placard/frigo list, per patient

- feature-slug: pantry-essentials
- sequence: 1 of 4
- depends-on: none
- priority: P1
- size: S
- sources: v2 brainstorm § H (PANTRY_ESSENTIALS) · scope answers 2026-09-01
  (patient-record/breakdown.md § Decisions)

## What this is

§ H: a short list of foods worth having in the placard and the frigo, chosen for _this_ patient —
each item with a simple, personalised justification ("sardines — oméga-3, et tu aimes ça"). In the
target model the AI drafts the list and Morgane validates; manual-first, she writes it herself,
and § H's own warning becomes the design rule: **no per-item fields like quantity, season or
nutrients** — an item is a name and a why, nothing else.

Per patient: rows with item name, a short why, an order, archive-not-delete (a list refresh
archives what drops off — the trail is part of the WEEKLY_ADAPTATION record alongside the recipe
sets). Admin gets a card on the patient page: the active list, add/edit/reorder/archive inline,
phone-usable — she may well type it during the consultation. The patient link renders the active
list in `patient-link-segments` (§ J: "essentiels placard / frigo").

## Worth knowing

- § H mentions placard vs frigo as the framing, not as data. If a grouping is wanted at all it is
  one optional label, not a taxonomy — and "no grouping" is a legitimate spec answer.
- Same service/table conventions as everything in these epics: Drizzle schema + migration,
  service behind the seam, in-memory-client tests, admin writes through `lib/audit.ts`.

## Open questions — flag these on pickup

- Does Morgane think in placard / frigo (/ congélateur?) sections, or one flat list? Ask her —
  do not invent the sections.
- Is one active list per patient right, or does she want dated list versions (a "September list")
  the way recipes get weekly sets? Lean answer is archive-rows-on-refresh; confirm it matches how
  she works.

## Prompt

Run `/pipeline new .icm/intake/patient-surface/pantry-essentials.md` in the remi-ai repo and
follow the pipeline from there. Read the stub and its epic's `breakdown.md` first — and the
decisions of record in `.icm/intake/patient-record/breakdown.md`, which bind this epic. Scope: a
per-patient pantry-essentials table (item + short why + order, archive-not-delete) with migration
and service behind the seam, and an inline-editable card on the admin patient page. Nothing
renders on the patient link in this stub. Raise the stub's open questions rather than answering
them.
