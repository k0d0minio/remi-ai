# Spec: CIQUAL import — the French food-composition table as a queryable dataset

- slug: ciqual-import
- apps: packages, admin
- touches: packages/services/src/db/schema.ts, packages/services/src/db/migrations,
  packages/services/src/db/models, packages/services/src/db/services/foods,
  packages/services/src/db/fixtures, packages/services/src/shared,
  packages/services/scripts, apps/admin/app/(admin)/page.tsx,
  apps/admin/app/(admin)/aliments, apps/docs/app/technical/decisions/page.mdx
- complexity: complex

## Verified at pickup

The stub deliberately left the edition, format and licence to be checked rather than assumed. All
of the below was read from the publisher on 2026-09-17, not from memory:

| Fact              | Value                                                                                                         |
| ----------------- | ------------------------------------------------------------------------------------------------------------- |
| Current edition   | **Table Ciqual 2025** — the newest; there is no 2026 edition. Data files dated 2025-11-03, published 2025-11-19 |
| Publisher         | ANSES, unité Observatoire des Aliments (Du Chaffaut, Oseredczuk, Gauvreau-Béziat)                              |
| DOI               | `10.57745/RDMHWY`, on Recherche Data Gouv — `ciqual.anses.fr` is the browse UI over the same data              |
| Licence           | **Etalab 2.0** (Licence Ouverte 2.0, SPDX `etalab-2.0`) — reuse and redistribution allowed, attribution required |
| Size              | **3 484 foods**, **74 constituents**, **257 816** composition rows, 11 groups / 66 sub-groups                  |
| Formats           | XML (`alim`, `alim_grp`, `compo`, `const`, `sources`) and XLS/XLSX. The XML set is what the importer reads      |
| Largest file      | `compo_2025_11_03.xml`, 69 MB — the reason the raw export is not committed                                     |

The XML shape, confirmed against the real files:

- `ALIM` → `alim_code`, `alim_nom_fr`, `alim_nom_eng`, `alim_grp_code`, `alim_ssgrp_code`, `alim_ssssgrp_code`
- `ALIM_GRP` → the group / sub-group / sub-sub-group code and French name for each triple
- `CONST` → `const_code`, `const_nom_fr` (which carries the unit, e.g. `Magnésium (mg/100 g)`), `code_INFOODS`
- `COMPO` → `alim_code`, `const_code`, `teneur`, `min`, `max`, `code_confiance`, `source_code`

`teneur` is **not** always a number. Counted across the real file: `-` (not determined) 83 246×,
`traces` 2 514×, `< x` (below the limit of quantification) ~17 000×, and numbers use a **decimal
comma**. `code_confiance` is always one of A, B, C, D. Losing those markers is exactly the failure
the stub warns about, so they are modelled rather than coerced.

Sources: [ANSES — la table Ciqual](https://www.anses.fr/en/content/ciqual-nutritional-composition-table) ·
[Recherche Data Gouv — Table Ciqual 2025](https://entrepot.recherche.data.gouv.fr/dataset.xhtml?persistentId=doi%3A10.57745%2FRDMHWY)

## Problem

REMI's patient features are all, underneath, a question about what is in a food. « Améliore mon
assiette » compares a meal with the practitioner's recommendations, « je mange autre chose »
proposes a compatible alternative, and the daily hub generates made-to-measure recipes — the three
that [V2 scope](../../../../../apps/docs/app/business/scope/page.mdx) names as the centre of the
build, and that the [current initiative](../../../../../apps/docs/app/business/initiatives/page.mdx)
measures against the partner clinic's 1 December date. Today nothing in this repository knows that a
sardine carries more EPA than a lentil. Morgane's own § 7 spells the missing step out: eliminate the
foods incompatible with the profile, then **select those that best match the recommendations** —
« augmenter les protéines », « favoriser les oméga-3 », « augmenter les fibres », « augmenter le
magnésium ». That is a query, and there is no table to run it against.

Without one, `ai-assist/recipe-generation` has only the model's own recollection of food
composition to work from — unsourced, unversioned, and wrong in ways nobody can see. Decision #7
(2026-09-10) answered it with CIQUAL: public, French, and authoritative enough that a practitioner
will stand behind a number it produced. This stub builds the table, the importer and the query
primitive; it calls no model and touches no patient data.

> The V2 scope page names the patient features but not the data behind them, because decision #7
> post-dates it. `.icm/docs/` outranks the page (`_shared/knowledge-map.md`), so this is the page
> drifting, not the work going out of scope — Release updates it in this PR.

## Proposed change

**1 — Three tables behind the storage seam.** `foods` (CIQUAL code, French and English name, group
and sub-group codes *and names*, an accent-stripped search name), `food_nutrients` (food code,
component code, component French name, unit, value, marker, confidence), and `ciqual_imports` (one
row per import: edition label, food and nutrient counts, source checksums, imported at). The seam
has no joins, so group names and component names are denormalised onto the rows that need them —
that is the storage seam's shape, not a shortcut. Migrations are generated with `pnpm db:generate`
and checked in, never hand-written.

**2 — The markers are modelled, not lost.** Every `food_nutrients` row carries `value` (a number or
null), `marker` — one of `exact`, `traces`, `less_than`, `not_determined` — `rawValue` (the original
string, verbatim), and `confidence` (A–D). `traces` stores value 0, `< 20` stores 20 with
`less_than`, `-` stores null. Ranking reads `exact` values only unless the caller opts in, so a
`< 20 µg` upper bound can never outrank a measured 5.

**3 — An idempotent import script.** `pnpm ciqual:import <dir>`, pointed at an unpacked CIQUAL XML
export. It streams the 69 MB `compo` file record by record, normalises the values, and upserts on
the natural keys (`foods.code`, `food_nutrients.(foodCode, componentCode)`), so a second run over
the same export changes no row count and no value. It refuses an export whose `const` file does not
match the component vocabulary it knows, rather than importing a silently different edition. The raw
export is **not committed**: it is 75 MB and it is nobody's to vendor.

> Like `scripts/migrate.mjs`, the importer is a maintenance script rather than a service, and it
> reaches the Neon driver directly for batched multi-row upserts — 257 816 single inserts through
> `Collection.insert` over Neon's HTTP driver is not an import, it is an afternoon. The carve-out is
> the script's alone and is documented in it. Everything under `db/services/` still speaks only to
> the seam, which is what the in-memory tests prove.

**4 — A committed fixture subset.** `pnpm ciqual:fixture <dir>` derives a ~120-food subset spanning
all 11 groups, carrying the full nutrient set for each, into
`packages/services/src/db/fixtures/ciqual-subset.json`. It is regenerated, never hand-edited, and
it is what the service tests load into the in-memory client. Etalab 2.0 permits the redistribution;
a `LICENCE.md` beside it names the source, the edition and the DOI.

**5 — A query service** (`db/services/foods/`), the primitive `recipe-generation` will compose:

- `searchFoods(query)` — accent- and case-insensitive substring match on the stored normalised name,
  so it behaves identically in Postgres and in the in-memory client. « magnesium » finds
  « Magnésium »; « boeuf » finds « bœuf ».
- `getFoodNutrients(code)` — a food's 74 numbers, with names, units, markers and confidence.
- `rankFoodsByComponent({ componentCode, group?, excludeCodes?, excludeGroups?, limit })` — foods
  ordered by that component per 100 g, descending, with exclusions applied. This is the shape her
  § 7 step needs: eliminate, then rank.

All three read through the seam as it stands — `findMany` with an exact-match filter is enough,
because a rank is one component code's column (3 484 rows) and a lookup is one food's rows (≤ 74).
The foods catalogue and each ranked component are memoised per process, which is safe because a
reference dataset changes only when the import script is run by hand; `refreshFoodCatalogue()` is
exported for the tests and the cache clears on the next cold start.

**6 — A hand-written recommendation-to-component map** in `shared/nutrition.ts`: twelve entries,
each naming the French phrasings that select it, the CIQUAL codes behind it, the unit, and whether
the recommendation means increase or reduce. The stub's five — protéines (25000), fibres (34100),
oméga-3 (ALA 41833 · EPA 42053 · DHA 42263), magnésium (10120), sucres (32000, reduce) — plus the
micronutrients a micronutrition practice reaches for: fer (10260), calcium (10200), zinc (10300),
sélénium (10340), iode (10530), vitamine D (52100), vitamine B9 / folates (56700). Matching is
normalised substring, no model call; adding Morgane's next component is one entry in one file.

**7 — The console sees it.** The `(admin)` home gains a line — « 3 484 aliments importés — Table
Ciqual 2025 (ANSES) » — read from `ciqual_imports`, and saying so plainly when nothing is imported
yet. A new operator-only `/aliments` page searches the catalogue and shows one food's full numbers
with its group, its markers and its confidence codes. Both carry the Etalab attribution. The page is
read-only: no write, no audit entry, no patient data anywhere near it.

## Acceptance criteria

- [ ] `foods`, `food_nutrients` and `ciqual_imports` exist behind the storage seam, with generated
      migrations checked in under `packages/services/src/db/migrations/` and `pnpm db:generate`
      reporting no drift from `schema.ts`.
- [ ] `pnpm ciqual:import <dir>` imports the Ciqual 2025 XML export to 3 484 foods and 257 816
      nutrient rows, and records the edition, the counts and the source checksums in
      `ciqual_imports`.
- [ ] Running the same import a second time over the same export leaves the row counts and every
      value unchanged — idempotency proved by the run, not asserted.
- [ ] The importer refuses an export whose component vocabulary does not match the one it knows,
      naming the mismatch, rather than importing a different edition silently.
- [ ] `teneur` markers survive the import: `traces` → `marker: "traces"` with value 0, `< 20` →
      `marker: "less_than"` with value 20, `-` → `marker: "not_determined"` with a null value, and
      `rawValue` holds the original string in every case. Decimal commas parse.
- [ ] Every imported nutrient row carries a confidence code of A, B, C or D.
- [ ] `packages/services/src/db/fixtures/ciqual-subset.json` is committed, spans all 11 CIQUAL
      groups, is regenerable with `pnpm ciqual:fixture <dir>`, and ships a `LICENCE.md` naming
      ANSES, the Ciqual 2025 edition, the DOI and Etalab 2.0.
- [ ] `searchFoods` matches accent- and case-insensitively — « magnesium » returns « Magnésium … »
      — proven against the fixture through the in-memory client.
- [ ] `getFoodNutrients` returns a food's components with their French names, units, markers and
      confidence codes.
- [ ] `rankFoodsByComponent` orders foods by a component descending, honours `group`,
      `excludeCodes` and `excludeGroups`, and excludes `traces`, `less_than` and `not_determined`
      values from the ranking unless the caller opts in.
- [ ] The services are tested against `createMemoryDatabase()` with no network and no driver, and
      the db-layer coverage floor still holds.
- [ ] `shared/nutrition.ts` maps the twelve recommendation phrasings to their CIQUAL component
      codes, direction and unit, and resolves « augmenter les protéines », « favoriser les oméga-3 »,
      « augmenter les fibres » and « augmenter le magnésium » to the right codes with no model call.
- [ ] The `(admin)` home shows « N aliments importés — Table Ciqual 2025 (ANSES) », and says so
      plainly when no import has run.
- [ ] `/aliments` is operator-only, searches the catalogue, shows one food's full composition, and
      carries the Etalab attribution; an unauthenticated request never reaches it.
- [ ] `apps/docs/app/technical/decisions/page.mdx` records the edition, the DOI and the Etalab
      licence terms, in this PR.

## Out of scope

- **Any model call.** Nothing here prompts an LLM; `ai-assist/recipe-generation` composes these
  primitives later.
- **Patient data.** This is reference data — no audit trail, no care-relationship scoping, no
  cascade concerns.
- **Committing the raw CIQUAL export.** Licence attribution and a regenerable fixture instead.
- **Extending the storage seam.** `Collection` stays as it is; nothing here needs a join, a sort or
  a comparison operator in the adapter.
- **CIQUAL's `min` / `max` columns and `sources` file.** The value, its marker and its confidence
  code are what ranking needs; the ranges are a later stub if a lookup page ever wants them.
- **Any other food database** — USDA, Open Food Facts, CIQUAL's « aliments moyens » companion table.
- **Embeddings or vector search.** Retrieval here is by name and by component code (epic
  `breakdown.md` § Out of scope).
- **A patient-facing food lookup.** `/aliments` is the console only.
- **Automatic edition upgrades.** Moving to a future edition is a human running the importer at a
  new export, plus whatever the diff turns out to need.

## Open questions

- Which components matter to Morgane's practice beyond the twelve this ships with? The map is
  hand-written and one entry per component, so her answer is a one-line edit — it blocks no
  criterion here. Raised from the stub, not answered.
- The V2 scope page does not name the nutrition-knowledge layer, because decision #7 post-dates it.
  Release updates the page in this PR; flagging it so the drift is recorded rather than absorbed.
