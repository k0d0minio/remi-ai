# Epic: nutrition-knowledge — what REMI knows about food, so the model looks it up instead of guessing

Cut 2026-09-10 from the last line of Morgane's covering message
([`correspondence/03`](../../docs/correspondence/03-feedback-on-first-version.md)): « remplir la
base de donnée de REMI avec les informations importantes et que l'IA puisse aller les rechercher
facilement » — and from her feedback § 7 ("à terme, la base CIQUAL et d'autres bases
nutritionnelles permettront d'utiliser la composition précise des aliments") and brainstorm § 6
("Connaissance nutritionnelle derrière REMI … ce chantier est distinct de la saisie patient").

Decision #7 (2026-09-10, [`practitioner-workflow/breakdown.md § Decisions`](../practitioner-workflow/breakdown.md))
answers her question with two things, now: **CIQUAL**, the French food-composition table, imported
as data the recipe engine can query; and **her own nutrition rules as text**, a corpus she authors
and versions, that prompts retrieve from. Genotype knowledge (Fagron, Dr Mouton's table) is parked
in `beyond-december` until the rights question is answered.

Neither stub calls a model. Both are read by `ai-assist`: `recipe-generation` filters foods
against the patient's profile and ranks by nutrient for the active recommendations (her § 7
"Sélection des aliments"); `meal-suggestions` cites her rules so the "pourquoi" is her nutrition,
not the model's. Both are also useful with no AI at all — a food lookup and a rule book Morgane
can point a patient at.

## Build order

1. `ciqual-import` — the table, the import script, a query service — depends-on: none
2. `nutrition-rules` — the authored corpus, its console page, its retrieval — depends-on: none

## Parallelizable

Fully: different tables, different consumers. Both can run alongside `practitioner-workflow` and
`patient-loop`; `ai-assist/recipe-generation` waits for both, `ai-assist/meal-suggestions` for
`nutrition-rules` only (soft — it degrades to the model's own knowledge with a flag in the output).

## Out of scope (whole epic)

- Embeddings / vector search. Retrieval here is by tag and by name; if the corpus outgrows that,
  it is a later stub with a vendor question.
- Any other food database (USDA, Open Food Facts) — one source first.
- Pathology / treatment descriptions (brainstorm § 10's last question) — not now.
