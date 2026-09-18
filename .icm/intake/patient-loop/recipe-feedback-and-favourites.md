# Stub: Recipe feedback and favourites — four buttons, and « Mes recettes préférées »

- feature-slug: recipe-feedback-and-favourites
- scope: patient-loop
- personas: patient, practitioner
- initiative: a patient experience validated on real terrain, in time for the December open day / objective: the patient loop working end to end for one real patient
- depends-on: link-writes
- sequence: 4 of 6
- priority: P1
- size: S
- sources: feedback § 7 ("Feedback patient : J'aime · Pas pour moi · Trop long · À refaire") · V2
  explication (« Enregistrer cette recette », onglet « Mes recettes préférées ») · brainstorm § 5
  step 4 · `patient_recipe_assignments` · `apps/web/app/[locale]/p/[token]/recettes/page.tsx`

## Problem

Her § 7 closes with the signal that makes the next recipes better — J'aime · Pas pour moi · Trop long · À refaire — and the patient has no way to give it. Without it, generation has no « ce qui a été essayé, apprécié, refusé » to read.

## Proposed change

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

## Acceptance criteria (rough)

- [ ] Each assigned recipe on the link carries the four answers, one tap, changeable; the answer is stored on the assignment row with patient attribution and a timestamp
- [ ] « Mes recettes préférées » is the à-refaire view, first on the recipes segment; no second table
- [ ] The console shows the patient's answer on the assignment row and a per-answer count under « À retenir »
- [ ] An archived assignment keeps its answer

## Out of scope (this feature)

- Any model call; a « how long would be fine » follow-up unless Morgane wants one (open point)

## Notes for Define

- **Decisions that bind** ([`README.md § Decisions of record`](../README.md)): D-5 (the library stays; feedback is per assignment) · D-9 (in-page, no outbound channel).

- One nullable enum column on `patient_recipe_assignments` (`patient_response`) plus a timestamp;
  migration generated, audited through `link-writes`.
- Optimistic toggle on the button so a tap feels instant on a phone; the server action is the
  truth.
- An archived assignment keeps its answer — that is exactly the history generation wants.

**Open for Define** — settled with the operator before the spec is approved, never assumed:

- Her four labels, verbatim, in the patient's register — and whether « Trop long » should carry a
  "how long would be fine" follow-up (a second field) or stay one tap.

## Prompt

Run `/pipeline new recipe-feedback-and-favourites` in the remi-ai repo. Define reads this stub, its epic's `breakdown.md` and the decisions of record in `.icm/intake/README.md`, and asks the points under **Open for Define** rather than answering them. Scope is the Proposed change and nothing under Out of scope.
