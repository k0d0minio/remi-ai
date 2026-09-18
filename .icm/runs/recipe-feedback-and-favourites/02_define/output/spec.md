# Spec: Recipe feedback and favourites — four buttons, and « Mes recettes préférées »

- slug: recipe-feedback-and-favourites
- personas: patient, practitioner
- touches: packages/services/src/db/schema.ts, packages/services/src/db/migrations, packages/services/src/db/services/recipe-assignments, packages/services/src/shared/audit.ts, apps/web/lib/patient-link, apps/web/components/patient-link, apps/web/app/[locale]/p/[token]/recettes, apps/web/lib/content, apps/admin/components/patients/recipe-assignment-item.tsx, apps/admin/app/(admin)/patients/[id]/page.tsx
- complexity: standard

## Problem

Morgane's § 7 closes with the signal that makes the next recipes better — **J'aime · Pas pour moi ·
Trop long · À refaire** — and the patient has no way to give it. `/p/[token]/recettes` renders the
active assignments and stops there: the patient reads a recipe and the loop ends, so nothing in the
record says whether the dish was cooked, liked, or quietly skipped. That is the current initiative's
one question left unanswerable — does REMI help a patient apply what their practitioner told them
between two consultations (`business/initiatives`, "a patient experience validated on real terrain")
— and it is also the missing input for `ai-assist/recipe-generation`, which is specified to read « ce
qui a été essayé, apprécié, refusé » and today has nothing to read.

The old version gave the patient a shelf — « Enregistrer cette recette » feeding an onglet « Mes
recettes préférées » — and the rebuild dropped it. Decision D-2 made the same token read **and**
write and `link-writes` (#98) built the write path; this is the fourth stub to use it, and the first
one where a single tap is the whole interaction.

## Proposed change

The patient answers each assigned recipe in one tap, and the answers become a shelf for them and a
count for Morgane.

**Four answers on each assigned recipe.** Every active assignment on the recipes segment carries the
four buttons, in Morgane's own § 7 words, verbatim and first-person — « J'aime » · « Pas pour moi » ·
« Trop long » · « À refaire » (EN: "Liked it" · "Not for me" · "Too long" · "Would make again"). The
buttons are exclusive: one answer per assignment, tapping another switches to it, and **tapping the
active answer clears it** back to no answer — a mis-tap on a phone is undoable without a second
control, and it is also how a favourite is removed. All four stay one tap; « Trop long » carries no
follow-up field (see Out of scope).

The answer is stored **on the assignment row** — the per-patient row, not the library recipe — so the
same dish can be « À refaire » for one person and « Pas pour moi » for another (D-5: the library
stays, and feedback is per assignment). `patient_recipe_assignments` gains a nullable answer column,
the timestamp of the answer, and `written_by`, carried from birth as `link-writes` specified for the
tables this epic introduces to the patient's reach. The write goes through the existing
`writePatientLink` helper: the token resolved by the loader's rules, the rate limits and the audit
entry with a patient actor, nothing new invented beside it. The audit vocabulary gains
`recipe.response_written` and `recipe.response_cleared`, following `meal.feedback_written` /
`meal.feedback_cleared`.

The button state updates optimistically so the tap feels instant on a phone; the server action is the
truth, and a refusal (rate limit, unknown token) renders in place on the recipe and restores the
previous answer rather than leaving a button that lies.

**« Mes recettes préférées ».** « À refaire » *is* the favourite — no second table and no separate
save control. The recipes segment opens with a « Mes recettes préférées » list of the patient's
à-refaire assignments, above the active list. It **keeps archived assignments**: when Morgane rotates
a recipe out, the patient's shelf does not empty — a recipe kept is a recipe kept, which is what the
old version's « Enregistrer cette recette » meant. An archived favourite renders in the favourites
list only (the active list is unchanged) and is not answerable there — the patient can no longer
change an answer on an assignment that is no longer theirs to cook this week. When no assignment is
à-refaire the section does not render at all, in the same spirit as a segment with nothing in it not
appearing in the navigation.

**The console.** The assignment row in the admin patient page shows the patient's answer and when
they gave it, alongside the existing per-patient note. Under « À retenir », a line per answer gives
the counts — "3 recettes aimées, 1 pas pour elle" — so Morgane reads the week's recipe signal without
opening each assignment. Both are reads: nothing in the console writes or clears a patient's answer,
because it is the patient's sentence and an operator editing it would make the trail a lie.

Archived assignments keep their answer permanently — that history is precisely what
`ai-assist/recipe-generation` will read (brainstorm § I); nothing in this run calls a model.

## Acceptance criteria

- [ ] Each active assignment on `/p/[token]/recettes` carries the four answers — « J'aime », « Pas pour moi », « Trop long », « À refaire » — verbatim in FR, mirrored in EN, one tap to set, one tap on another to switch
- [ ] Tapping the currently selected answer clears it; the assignment returns to no answer and, if it was « À refaire », leaves the favourites list
- [ ] The answer is stored on the `patient_recipe_assignments` row with `written_by: patient` and the timestamp of the answer; the library recipe is unchanged and another patient's assignment of the same recipe is unaffected
- [ ] The write goes through the patient-link write helper: rate-limited, audited with a patient actor under a new `recipe.response_*` action, and refused writes render an error on the recipe with the previous answer restored
- [ ] The button state updates before the server responds and settles on the server's result
- [ ] « Mes recettes préférées » renders first on the recipes segment, listing the patient's à-refaire assignments including archived ones; it does not render when there are none, and there is no second table behind it
- [ ] An archived assignment keeps its stored answer and renders in the favourites list without answer buttons
- [ ] The admin assignment row shows the patient's answer and its date; « À retenir » shows a count per answer for that patient
- [ ] Nothing in the console can write or clear a patient's answer
- [ ] The migration is generated by the repo's tooling and applied through the pipeline's migration path; existing assignment rows keep no answer

## Out of scope

- A « combien de temps vous irait ? » follow-up on « Trop long » — settled at Define as one tap for all four; if Morgane asks for the second field later it is its own stub
- Any model call: `ai-assist/recipe-generation` reads these answers, it is not built here
- A free-text comment on a recipe, a rating scale, or answers on library recipes the patient was never assigned
- Practitioner-side editing of a patient's answer, and any notification when an answer lands (D-9: in-page, no outbound channel)
- Sorting or filtering the active recipe list by answer
- Photos (D-12) and anything requiring a patient account (`beyond-december`)

## Open questions

- none — the stub's one open point (her four labels verbatim, and whether « Trop long » carries a follow-up) was settled with the operator at Define: § 7 verbatim, one tap, no follow-up.
