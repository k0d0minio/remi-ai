# Stub: Meal suggestions — « Je vais manger → Suggestions », instant, in her nutrition, to the patient

- feature-slug: meal-suggestions
- scope: ai-assist
- personas: patient, practitioner
- initiative: a patient experience validated on real terrain, in time for the December open day / objective: the patient loop working end to end for one real patient
- depends-on: mistral-adapter
- sequence: 2 of 5
- priority: P1
- size: L
- sources: feedback § 8 (the whole section: analysis inputs, the four-part answer, the
  pedagogical why, "le praticien ne doit pas devoir commenter chaque repas") · § 6 · § 9.5 ·
  braindump `roadmap/features.md` (« Améliore mon assiette », the V2's central feature) ·
  decision D-6 · cross-epic: `patient-loop/meal-entry` (the entry and the response slot),
  `nutrition-knowledge/nutrition-rules` (soft)

## Problem

« Je vais manger » is the workflow the product bends toward (her § 8), and today the response slot `meal-entry` built only ever holds Morgane's own feedback, written after the fact. The patient gets no instant, pedagogical answer, and she has to comment every meal by hand.

## Proposed change

The patient writes « Spaghetti sauce tomate », taps « Suggestions », and within seconds reads:

1. **Ce qui est déjà positif** — « La sauce tomate apporte des composés antioxydants
   intéressants. »
2. **Ce qui pourrait être amélioré** — « Ce repas contient peu de protéines et peu de légumes. »
3. **Une action simple à faire maintenant** — « Ajoute une source de protéines comme du poulet, du
   tofu ou des lentilles, et si possible une portion de légumes. »
4. **Pourquoi, pour toi** — « … correspond mieux à ta recommandation actuelle d'augmenter les
   protéines. »

Short, concrete, applicable now, and pedagogical — the patient learns to improve their own meals.
The same call, with intent `eaten`, gives the « J'ai mangé » feedback: what was good, one thing
for next time, why. Decision D-6: **straight to the patient**, no queue; Morgane sees every
exchange in the journal and can add or correct — her feedback sits beside REMI's, labelled.

- **Context assembly** (tested against fixtures): profile (diet, allergies, intolerances, likes /
  dislikes), active recommendations with categories, active goals, the instruction, the last few
  entries of the day if any (kept minimal — the "repas précédents" logic is the vision, not this
  round), and the validated rules retrieved by the recommendations' tags — so the "pourquoi" is
  hers where she has written it.
- **The schema**: `{ positive, improve, action, why }`, each a short string with a length cap, plus
  `flags` (an allergen or excluded food named in the action — the post-check reads it).
- **The post-check in code**: the action's named foods against allergies, intolerances and the
  diet's exclusions; a hit means the suggestion is not shown and the failure is logged — the
  patient sees "REMI n'a pas de suggestion pour ce repas" and Morgane sees the entry awaiting her.
- **Where it lands**: the response slot `meal-entry` built; stored on the entry (a `suggestion`
  JSON column or a child table — Define picks, the log references it); labelled « proposé par
  REMI »; a « utile / pas utile » tap from the patient (one column) so the log carries a signal.
- **Latency**: the call runs in the server action on submit, `fast` role, a hard timeout; on
  timeout the entry is saved and the slot says the suggestion is coming — a retry on next open, not
  a queue.

## Acceptance criteria (rough)

- [ ] On a planned or eaten meal entry, one structured `fast` call returns positive / improve / action / why within a hard timeout, and the entry renders it labelled « proposé par REMI »
- [ ] The context block (profile, recommendations, goals, instruction, retrieved rules) is assembled by a function tested against fixtures
- [ ] A suggestion whose action names an allergen, intolerance or excluded food is withheld by code and logged; the patient sees that REMI has no suggestion for this meal
- [ ] The patient can tap « utile / pas utile » once per suggestion and the answer is stored
- [ ] Generations are capped per patient per day and every one is logged; a timeout saves the entry and retries on the next open

## Out of scope (this feature)

- A queue or a manual gate before the patient sees it (D-6 says straight to the patient); a chat; memory beyond the context block
- Photos (D-12); previous meals of the day beyond the last few entries — the « vision finale », a later round

## Notes for Define

- **Decisions that bind** ([`README.md § Decisions of record`](../README.md)): D-6 (straight to the patient, visible and correctable) · D-7 (her rules are what the prompt retrieves) · D-12 (text only).

- One structured call per meal; no conversation, no memory beyond the context block. The old
  version's "dialogue à tout moment" is not this — a chat is a different product decision.
- The patient's register (« tu ») and length caps are prompt constants beside the schema.
- Rate limits from `link-writes` also cap generations per token per day — a leaked link must not
  be an open faucet; a per-patient daily ceiling is a constant, logged when hit.
- Rules retrieval is soft: with none validated yet the prompt says so and the output's `why` is
  the model's; the log records which rules were used so she can see the gap.

**Open for Define** — settled with the operator before the spec is approved, never assumed:

- Her tone and length: the § 8 examples are the target — confirm the four labels and whether the
  "pourquoi" is a fourth block or folded into the action.
- Daily ceiling per patient — propose a number with the cost behind it.
- Does she want to be told when a suggestion was withheld by the post-check (a count on the
  console, like meals awaiting feedback)?

## Prompt

Run `/pipeline new meal-suggestions` in the remi-ai repo. Define reads this stub, its epic's `breakdown.md` and the decisions of record in `.icm/intake/README.md`, and asks the points under **Open for Define** rather than answering them. Scope is the Proposed change and nothing under Out of scope.
