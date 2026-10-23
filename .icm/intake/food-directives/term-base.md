# Stub: The validated term base exists, seeded from CIQUAL, with provenance and confidence

- feature-slug: term-base
- epic: food-directives
- story: 13
- sequence: 1 of 4
- depends-on: none
- complexity: high
- priority: P0

## Problem

A directive names a food, a nutrient, a compound or a family. REMI must link each one to food sources it can document. CIQUAL covers foods and nutrients only. Nothing on main holds polyphenols, I3C, phytoestrogens, oxalates, purines, histamine or food families, and nothing records where an association came from.

## Proposed change

Two reference tables, not patient data: `food_terms` (one row per term: canonical French name, kind `food` | `nutrient` | `compound` | `family`, synonyms, source, status `draft` | `validated`, validated by and at) and `food_term_associations` (term → CIQUAL food code, level `significant` | `trace`, preparation note, provenance, confidence). One migration. A seed loads every CIQUAL food and every CIQUAL component as a validated term, with the associations CIQUAL's values give. Terms outside CIQUAL arrive as `draft` rows through the admin (knowledge-base-requests). A service exposes `resolveTerm(text)` and `associations(termId)`.

## Acceptance criteria

- [ ] The migration adds `food_terms` and `food_term_associations` and runs once on production.
- [ ] The seed creates one validated term per CIQUAL food and per CIQUAL component.
- [ ] An association records its level, its provenance and its confidence. A `trace` level is never read as `significant`.
- [ ] `resolveTerm` returns the validated term for an exact or synonym match after accent and case normalisation, and nothing for anything else.
- [ ] A `draft` term never resolves as validated.
- [ ] Unit tests cover a food, a nutrient, a synonym, a trace-only association and an unknown term.

## Out of scope

- Any patient row. Any console screen. The directive fields (directive-fields).
- Curated associations for compounds. The base ships with CIQUAL only. Morgane's sources load through the admin review.

## Notes

- D-25: one migration, run on production only.
- Files: `packages/services/src/db/schema.ts`, a new migration, `packages/services/src/db/services/food-terms/`, `packages/services/src/db/models/food-term.ts`, a seed script beside the CIQUAL import.
- Shared files first: this stub owns the schema change. Every later stub in the epic merges over it.
- cross-epic: knowledge-base-requests/admin-review writes `draft` and `validated` rows here.
