# Stub: CIQUAL import — the French food-composition table as a queryable seam-side dataset

- feature-slug: ciqual-import
- sequence: 1 of 2
- depends-on: none
- priority: P1
- size: M
- sources: feedback § 7 ("Sélection des aliments … la base CIQUAL") · brainstorm § 6, § 10 ("As-tu
  besoin de base de donnée : Base ciqual …") · decision #7 · ANSES CIQUAL (ciqual.anses.fr — open
  data under the Etalab licence; the exact edition, file format and licence terms are verified at
  pickup, not assumed here)

## What this is

CIQUAL is ANSES's food-composition table: on the order of three thousand foods with several dozen
nutrient components each, French names, public. Her § 7's recipe logic has a step that is exactly a
query on it: eliminate foods incompatible with the profile, then **select those that best match
the recommendations** ("augmenter les protéines" → protein per 100 g; "favoriser les oméga-3" →
the relevant fatty acids; "augmenter les fibres", "augmenter le magnésium"). This stub gives that
step a table to run on.

- **Tables** behind the storage seam: `foods` (CIQUAL code, French name, group / sub-group) and
  `food_nutrients` (food, component code, value, unit, confidence code where CIQUAL gives one) —
  or one wide table if Define prefers; migrations generated. Data, not patient data: no audit, no
  cascade concerns.
- **An import script** in `packages/services` (`pnpm ciqual:import <file>`), idempotent, from the
  downloaded CIQUAL export; the raw file is **not** committed (size, licence attribution instead) —
  the script and a small fixture subset are.
- **A query service**: search foods by name (accent-insensitive), get a food's nutrients, and
  **rank foods by a component** within a group with exclusions — the primitive
  `recipe-generation` composes. Tested against the fixture subset in memory like every service.
- **A small map from recommendation phrasing to components** ("protéines" → the protein
  component code, "oméga-3" → the ALA / EPA / DHA codes, "fibres", "magnésium", "sucres") — a
  vocabulary file, hand-written, easy to extend. Free text does not hit the model here.

## Worth knowing

- Attribution: the Etalab licence wants the source named; the docs' `technical/decisions` page
  records the edition and the licence, in the same PR.
- CIQUAL values carry "traces", "<", "-" markers; the importer normalises them into a value plus a
  confidence flag rather than losing them.
- No admin UI in this stub beyond an operator-visible "N aliments importés, édition XXXX" line on
  the console home — a lookup page is `ai-assist`'s or later, if wanted.

## Open questions — flag these on pickup

- Which components matter to Morgane's practice beyond the obvious (protein, fibre, the omega-3
  fatty acids, magnesium, sugars)? The map starts with her list.
- Does she want a food lookup page in the console now (search a food, see its numbers), or is the
  dataset invisible until generation uses it?

## Prompt

Run `/pipeline new .icm/intake/nutrition-knowledge/ciqual-import.md` in the remi-ai repo and
follow the pipeline from there. Read the stub and its epic's `breakdown.md` first. Scope: food and
food-nutrient tables behind the storage seam with generated migrations; an idempotent CIQUAL
import script with a committed fixture subset and licence attribution; a query service (search by
name, nutrients of a food, rank by component with exclusions) tested in memory; a hand-written
recommendation-to-component map. No model call, no patient data. Verify the CIQUAL edition,
format and licence terms at pickup. Raise the stub's open questions rather than answering them.
