# Stub: Recipe feedback and favourites — four buttons, and « Mes recettes préférées »

- feature-slug: recipe-feedback-and-favourites
- sequence: 4 of 6
- depends-on: link-writes
- priority: P1
- size: S
- sources: feedback § 7 ("Feedback patient : J'aime · Pas pour moi · Trop long · À refaire") · V2
  explication (« Enregistrer cette recette », onglet « Mes recettes préférées ») · brainstorm § 5
  step 4 · `patient_recipe_assignments` · `apps/web/app/[locale]/p/[token]/recettes/page.tsx`

## What this is

Her § 7 closes with the signal that makes the next recipes better: the patient says **J'aime · Pas
pour moi · Trop long · À refaire** on each recipe, and those answers "permettent d'améliorer les
prochaines propositions". This stub records the signal and gives the patient the shelf the old
version had:

- **Four buttons on each assigned recipe**, one tap, changeable. Stored on the assignment (the
  per-patient row), not the library recipe — the same dish can be "à refaire" for one person and
  "pas pour moi" for another. `written_by: patient`.
- **Favourites** — « À refaire » doubles as the favourite: « Mes recettes préférées » is a view of
  the patient's assignments with that answer, on the recipes segment, first. No second table.
- **Admin**: the assignment row shows the patient's answer; the learnings view (« À retenir »)
  gains a line per answer so Morgane reads "3 recettes aimées, 1 pas pour elle" without opening
  each. `ai-assist/recipe-generation` reads the answers as its "ce qui a été essayé, apprécié,
  refusé" input (brainstorm § I).

## Worth knowing

- One nullable enum column on `patient_recipe_assignments` (`patient_response`) plus a timestamp;
  migration generated, audited through `link-writes`.
- Optimistic toggle on the button so a tap feels instant on a phone; the server action is the
  truth.
- An archived assignment keeps its answer — that is exactly the history generation wants.

## Open questions — flag these on pickup

- Her four labels, verbatim, in the patient's register — and whether « Trop long » should carry a
  "how long would be fine" follow-up (a second field) or stay one tap.

## Prompt

Run `/pipeline new .icm/intake/patient-loop/recipe-feedback-and-favourites.md` in the remi-ai repo
and follow the pipeline from there. Read the stub, its epic's `breakdown.md` and the `link-writes`
run's notes first. Scope: a four-answer response per assigned recipe (J'aime / Pas pour moi /
Trop long / À refaire) stored on the assignment with patient attribution, « Mes recettes
préférées » as the à-refaire view on the recipes segment, the answer visible in the console's
assignment row and learnings. No model call. Raise the stub's open question rather than answering
it.
