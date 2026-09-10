# Stub: Nutrition rules — Morgane's own knowledge, authored and versioned, retrieved by tag

- feature-slug: nutrition-rules
- sequence: 2 of 2
- depends-on: none
- priority: P1
- size: M
- sources: her covering message ("remplir la base de donnée de REMI avec les informations
  importantes") · brainstorm § 6 ("sources / contenus validés que l'équipe choisira
  progressivement", "possibilité de construire ou enrichir ces bases avec l'aide d'IA, puis de les
  valider") · § H (seasonality, omega-3 / fibre / polyphenol sources) · decision #7

## What this is

The "pourquoi" in her § 8 example — "la sauce tomate apporte des composés antioxydants
intéressants", "ajouter une source de protéines peut rendre le repas plus rassasiant" — is her
nutrition, and she wants the model to say what _she_ would say. This stub gives her a place to
write it once, and the model a way to find it:

- **A rules corpus**: `nutrition_rules` rows — title, body (markdown, a paragraph to a page),
  **tags** (the recommendation vocabulary: protéines, oméga-3, fibres, magnésium, sucres raffinés,
  anti-inflammatoire, saison, petit-déjeuner …), a kind (`principle`, `food-list`, `seasonality`,
  `safety`, `house-rule`), a status (`draft`, `validated`), version and who validated it. Only
  `validated` rows are ever retrieved by a prompt — brainstorm § 6's "puis les valider avant
  intégration", made structural.
- **A console page** « Connaissances » (owner and operators): list, filter by tag and kind,
  create / edit in markdown, validate, see versions. Plain, dense, the admin register.
- **A retrieval service**: given tags (from a patient's active recommendations and the meal or
  recipe context) return the validated rules that match, ranked by tag overlap, capped — the block
  a prompt pastes in. Tested in memory. No embeddings.
- **A seed**: the rules she has already written in the braindump and the brainstorm's § H (omega-3
  sources, fibre, polyphenols, seasonal produce, frozen allowed) as `draft` rows, for her to
  validate — never as validated by us.

## Worth knowing

- Markdown body, rendered with the same renderer the docs app uses; no rich editor.
- Versioning: keep it as "a new row supersedes, old row kept with `superseded_by`" — the living
  summary already follows that shape for instructions.
- The retrieval cap is a token budget; make it a constant beside the prompt, not a magic number.

## Open questions — flag these on pickup

- Her tag vocabulary — the recommendation categories plus what else? Ask before seeding.
- Does she want rules to be per-practitioner one day (multi-practitioner REMI) or house-wide?
  Decides whether a `practitioner_id` column is nullable now or absent.

## Prompt

Run `/pipeline new .icm/intake/nutrition-knowledge/nutrition-rules.md` in the remi-ai repo and
follow the pipeline from there. Read the stub and its epic's `breakdown.md` first. Scope: a
`nutrition_rules` table (title, markdown body, tags, kind, draft / validated status, versioning)
behind the storage seam; a console « Connaissances » page to author, tag and validate; a
tag-based retrieval service returning validated rules with a cap, tested in memory; a draft seed
from the braindump and brainstorm § H. No model call. Raise the stub's open questions rather than
answering them.
