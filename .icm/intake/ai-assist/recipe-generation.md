# Stub: Recipe generation — several recipes from profile + recommendations, checked before display

- feature-slug: recipe-generation
- scope: ai-assist
- personas: practitioner, patient
- initiative: a patient experience validated on real terrain, in time for the December open day / objective: a usable patient version for the partner clinic to test on 1 December
- depends-on: ai-gateway-adapter
- sequence: 3 of 5
- priority: P1
- size: L
- sources: feedback § 7 (the whole section: inputs, food selection, generation "tel un chef",
  control before display, patient feedback, "Pour la V2", "Vision finale") · § 9.4 · brainstorm
  § I · decisions D-5, D-6, D-7 · cross-epic: `practitioner-workflow/recipe-in-place` (the library-and-assignment write path),
  `patient-loop/patient-profile-edit` (time available, budget, likes cooking),
  `patient-loop/recipe-feedback-and-favourites` (the feedback signal),
  `nutrition-knowledge/ciqual-import` and `nutrition-rules`

## Problem

Her § 7 « Pour la V2 »: profile plus recommendations should give several adapted recipes, checked before display, without her creating and assigning each one by hand. Today every recipe in the library is typed; `recipe-in-place` built the write path, nothing fills it.

## Proposed change

Her § 7 "Pour la V2": **profil patient + recommandations praticien → REMI génère automatiquement
plusieurs recettes adaptées**; the practitioner does not create and assign each one by hand. Her
four steps become four pieces of code around one model call:

1. **Profil patient** — allergies, intolerances, diet, time available, likes cooking, budget,
   likes / dislikes; plus the active recommendations, goals and instruction, and the patient's
   recipe answers so far (liked, not for me, too long, again) and recent meals — brainstorm § I's
   "en tenant compte de ce qui a été essayé, apprécié, refusé".
2. **Sélection des aliments** — in code, on CIQUAL: exclude foods incompatible with the profile,
   then rank by the components the recommendations map to (`ciqual-import`'s service); the top
   candidates, with their numbers, go into the prompt as the pantry to cook from. With the
   dataset absent the step is skipped and the log says so.
3. **Génération** — one `balanced` call returning N recipes against a schema: title, servings,
   time, difficulty, ingredients (name, quantity, unit), steps, a two-line "pourquoi pour toi",
   tags. Validated rules retrieved by tag are in the prompt so the recipes reflect her nutrition.
4. **Contrôle avant affichage** — in code: every ingredient against allergies, intolerances and
   the diet's exclusions; time against the patient's level; a recipe that fails is dropped and
   logged, never shown. Plus a **culinary-coherence check** (decision D-20 — Arnaud's pumpkin soup
   with a chocolate bar, Morgane's « éplucher la banane »): edible pairings, a detail level that
   follows the patient's cooking appetite, no false nutritional precision. A second, cheap model pass "does this recipe respect these
   recommendations?" is optional and Define decides whether it earns its cost.

**Where it lands** (decision D-5 + D-6): each surviving recipe is written to the library through
`recipe-in-place`'s path and assigned to the patient in the same transaction, marked as generated
(prompt version, generation id); it reaches the patient's « Mes recettes » **without a manual
gate**. Morgane sees them on the patient page labelled « proposé par REMI », can edit (as a
variant), archive, or regenerate with a one-line contextual instruction ("pas de petit-déjeuner,
le dîner doit resservir le lendemain" — brainstorm § E's third example). The patient's four-button
answers close the loop for the next batch.

**Who triggers it**: the console's « Proposer une recette » quick action gains « Générer »
(count, optional instruction); the patient gets nothing to trigger in this round — cadence is
Morgane's until the log says patients want a button.

## Acceptance criteria (rough)

- [ ] From « Proposer une recette », a « Générer » action (count, optional instruction) makes one structured `balanced` call and returns N recipes against a schema (title, servings, time, difficulty, ingredients, steps, why-for-you, tags)
- [ ] Candidate foods come from CIQUAL, filtered against the profile and ranked by the recommendations' components; with the dataset absent the step is skipped and logged
- [ ] Every recipe is checked in code (allergens, intolerances, diet, time) and a failing one is dropped and logged, never shown
- [ ] Survivors are written to the library and assigned to the patient in one transaction, marked as generated, and reach « Mes recettes » without a manual gate; Morgane can edit as a variant, archive, or regenerate with an instruction
- [ ] Every generation and every drop is in `ai_generations`

## Out of scope (this feature)

- A patient-side trigger; a weekly cadence or cron; the old version's 7 × 4 weekly plan
- Genotype inputs — the context block keeps an empty « nutrients to favour » slot for `genotype-layer`

## Notes for Define

- **Decisions that bind** ([`README.md § Decisions of record`](../README.md)): D-5 (the library stays; generation writes into it and assigns) · D-6 (an automated check, no manual gate) · D-7 (CIQUAL and her rules) · D-20 (seed base or not is Define's question; the coherence check is not).

- The recipe body is single-field prose today; this stub (or `recipe-in-place`, whichever ships
  first — flag, do not do both) splits it into ingredients + steps + meta, with the prose kept as
  a rendered view. A migration converts existing rows to prose-only entries with empty structure.
- The old version's "7 days × 4 meals a week to limit tokens" is not this: N recipes on demand,
  logged, is cheaper and testable; a weekly cadence is a cron later, if she wants it.
- Genotype inputs (Fagron) are a parked stub; the context block has a documented empty slot for
  "nutrients to favour" so adding them later is additive.
- Every generation writes `ai_generations`; dropped recipes are logged with the reason — that is
  the safety record.

**Open for Define** — settled with the operator before the spec is approved, never assumed:

- **Seed base or pure generation** (D-20, from the 11 Sept call [36:56]–[43:20]): the proposal to
  put to her is ~20 anti-inflammatory recipes she supplies, in the library, that generation
  transforms per patient; the alternative is CIQUAL-only generation, which she says she always let
  the model do. Her call; if the seed wins, authoring those recipes is a small stub before this one.
- The shape of the culinary-coherence check: a code rule set (pairings, steps per cooking level)
  or a second cheap model pass — and whether it earns its cost.
- N per generation (3? 5?) and the servings default — hers.
- The ingredients / steps split: does she want quantities, or is "tel un chef" prose enough for
  the patient? It changes the schema and the check's precision.
- Should a generated recipe ever be visible to the patient before she has _seen_ it (not gated,
  but noticed)? Decision D-6 says yes; confirm with her on the first real batch.

## Prompt

Run `/pipeline new recipe-generation` in the remi-ai repo. Define reads this stub, its epic's `breakdown.md` and the decisions of record in `.icm/intake/README.md`, and asks the points under **Open for Define** rather than answering them. Scope is the Proposed change and nothing under Out of scope.
