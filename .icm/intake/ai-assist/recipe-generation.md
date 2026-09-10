# Stub: Recipe generation — several recipes from profile + recommendations, checked before display

- feature-slug: recipe-generation
- sequence: 3 of 5
- depends-on: mistral-adapter
- priority: P1
- size: L
- sources: feedback § 7 (the whole section: inputs, food selection, generation "tel un chef",
  control before display, patient feedback, "Pour la V2", "Vision finale") · § 9.4 · brainstorm
  § I · decisions #5, #6, #7 · cross-epic: `practitioner-workflow/recipe-in-place` (the library-and-assignment write path),
  `patient-loop/patient-profile-edit` (time available, budget, likes cooking),
  `patient-loop/recipe-feedback-and-favourites` (the feedback signal),
  `nutrition-knowledge/ciqual-import` and `nutrition-rules`

## What this is

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
   logged, never shown. A second, cheap model pass "does this recipe respect these
   recommendations?" is optional and Define decides whether it earns its cost.

**Where it lands** (decision #5 + #6): each surviving recipe is written to the library through
`recipe-in-place`'s path and assigned to the patient in the same transaction, marked as generated
(prompt version, generation id); it reaches the patient's « Mes recettes » **without a manual
gate**. Morgane sees them on the patient page labelled « proposé par REMI », can edit (as a
variant), archive, or regenerate with a one-line contextual instruction ("pas de petit-déjeuner,
le dîner doit resservir le lendemain" — brainstorm § E's third example). The patient's four-button
answers close the loop for the next batch.

**Who triggers it**: the console's « Proposer une recette » quick action gains « Générer »
(count, optional instruction); the patient gets nothing to trigger in this round — cadence is
Morgane's until the log says patients want a button.

## Worth knowing

- The recipe body is single-field prose today; this stub (or `recipe-in-place`, whichever ships
  first — flag, do not do both) splits it into ingredients + steps + meta, with the prose kept as
  a rendered view. A migration converts existing rows to prose-only entries with empty structure.
- The old version's "7 days × 4 meals a week to limit tokens" is not this: N recipes on demand,
  logged, is cheaper and testable; a weekly cadence is a cron later, if she wants it.
- Genotype inputs (Fagron) are a parked stub; the context block has a documented empty slot for
  "nutrients to favour" so adding them later is additive.
- Every generation writes `ai_generations`; dropped recipes are logged with the reason — that is
  the safety record.

## Open questions — flag these on pickup

- N per generation (3? 5?) and the servings default — hers.
- The ingredients / steps split: does she want quantities, or is "tel un chef" prose enough for
  the patient? It changes the schema and the check's precision.
- Should a generated recipe ever be visible to the patient before she has _seen_ it (not gated,
  but noticed)? Decision #6 says yes; confirm with her on the first real batch.

## Prompt

Run `/pipeline new .icm/intake/ai-assist/recipe-generation.md` in the remi-ai repo and follow the
pipeline from there. Read the stub, its epic's `breakdown.md` (§ The shape, decisions #5–#7) and
the `mistral-adapter`, `practitioner-workflow/recipe-in-place`, `nutrition-knowledge/*` and
`patient-loop/patient-profile-edit` runs' notes first. Scope: from the console's « Proposer une
recette », a « Générer » action that assembles a fixture-tested context (profile, recommendations,
goals, instruction, recipe answers, recent meals, CIQUAL-ranked candidate foods, retrieved rules),
makes one structured `balanced` call for N recipes, post-checks each in code (allergens,
intolerances, diet, time), writes survivors to the library and assigns them in one transaction
marked as generated, renders them labelled « proposé par REMI » on both sides, supports a
contextual instruction and regenerate, logs every generation and every drop. No manual gate, no
weekly cron, no patient trigger. Raise the stub's open questions rather than answering them.
