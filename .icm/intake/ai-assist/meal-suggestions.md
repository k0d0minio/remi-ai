# Stub: Meal suggestions — « Je vais manger → Suggestions », instant, in her nutrition, to the patient

- feature-slug: meal-suggestions
- sequence: 2 of 5
- depends-on: mistral-adapter
- priority: P1
- size: L
- sources: feedback § 8 (the whole section: analysis inputs, the four-part answer, the
  pedagogical why, "le praticien ne doit pas devoir commenter chaque repas") · § 6 · § 9.5 ·
  braindump `roadmap/features.md` (« Améliore mon assiette », the V2's central feature) ·
  decision #6 · cross-epic: `patient-loop/meal-entry` (the entry and the response slot),
  `nutrition-knowledge/nutrition-rules` (soft)

## What this is

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
for next time, why. Decision #6: **straight to the patient**, no queue; Morgane sees every
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

## Worth knowing

- One structured call per meal; no conversation, no memory beyond the context block. The old
  version's "dialogue à tout moment" is not this — a chat is a different product decision.
- The patient's register (« tu ») and length caps are prompt constants beside the schema.
- Rate limits from `link-writes` also cap generations per token per day — a leaked link must not
  be an open faucet; a per-patient daily ceiling is a constant, logged when hit.
- Rules retrieval is soft: with none validated yet the prompt says so and the output's `why` is
  the model's; the log records which rules were used so she can see the gap.

## Open questions — flag these on pickup

- Her tone and length: the § 8 examples are the target — confirm the four labels and whether the
  "pourquoi" is a fourth block or folded into the action.
- Daily ceiling per patient — propose a number with the cost behind it.
- Does she want to be told when a suggestion was withheld by the post-check (a count on the
  console, like meals awaiting feedback)?

## Prompt

Run `/pipeline new .icm/intake/ai-assist/meal-suggestions.md` in the remi-ai repo and follow the
pipeline from there. Read the stub, its epic's `breakdown.md` (§ The shape, decision #6) and the
`mistral-adapter` and `patient-loop/meal-entry` runs' notes first. Scope: on a patient's meal entry
(planned or eaten), one structured `fast` call with a fixture-tested context block (profile,
recommendations, goals, instruction, retrieved rules) returning positive / improve / action / why,
post-checked in code against allergies, intolerances and diet, stored on the entry, rendered in
the response slot labelled « proposé par REMI » with a useful / not-useful tap, logged with tokens
and outcome, capped per patient per day, timeout-safe. No queue, no chat, no photos. Raise the
stub's open questions rather than answering them.
