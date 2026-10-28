# Stub: REMI tells the patient what is already good and the one thing to improve

- feature-slug: meal-suggestion
- epic: meal-improvement
- story: 28
- sequence: 2 of 3
- depends-on: meal-capture
- complexity: high
- priority: P0

## Problem

A submitted meal gets no answer. Morgane's whole promise is the answer: help the patient apply the recommendations at the next meal.

## Proposed change

One structured call through the gateway with the pseudonymous protocol context (validated version only) and the meal text. The schema returns: `clear` (boolean) with a clarification question when false, `good_points` (one to three), an optional `improvement` with kind `add`, `replace` or `remove`, the food, a one-sentence explanation and the id of the validated recommendation or goal it serves, and `evicted_found` (foods in the meal under total eviction, allergy or intolerance). Code then checks the improvement's food against `eviction-safety/compatibility-gate` and drops it when not confirmed. The screen shows « Ce qui est déjà bien » and « Ce que tu pourrais améliorer », or a confirmation when there is no improvement. An evicted food is shown first, before anything else. When `clear` is false, the screen shows the question and a field to answer.

## Acceptance criteria

- [ ] A clear meal gets one to three good points and at most one improvement.
- [ ] An improvement is an add, a replace or a remove of one food, with an explanation that names a validated recommendation or goal of this patient.
- [ ] A meal already in line with the protocol gets a confirmation and no improvement.
- [ ] A food under total eviction, allergy or intolerance found in the meal is flagged first.
- [ ] No improvement proposes a food the gate does not confirm.
- [ ] A vague text returns one question instead of a suggestion.
- [ ] Every call is one row in `ai_generations` and one row in `meal_suggestions`.
- [ ] The prompt contains no name, e-mail or account id.
- [ ] The answer arrives in under 15 seconds or the screen says REMI is still thinking and keeps the entry.

## Out of scope

- The buttons and the second attempt. Nutrient numbers. Any write to the protocol.

## Notes

D-16, D-30 (the priority order resolves conflicts). No image reaches the model (story 33). The context assembler is shared with `recipe-space/weekly-plan-generation`. Morgane's v1 prompt (`Prompt.docx`, Drive, 24 October 2026) is reference for the tone and the two-block structure, never a spec. Files: `packages/services/src/ai/prompts/meal.ts`, `server/meals/suggest.ts`, the home block's result view. Cross-epic: `recipe-space/ai-gateway-adapter`, `eviction-safety/compatibility-gate`, `protocol-versions` (validated version only), `patient-recommendations` (the recommendation wording).
