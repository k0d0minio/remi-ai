# Stub: Each recipe tells the patient in one sentence why it fits

- feature-slug: recipe-justification
- epic: recipe-space
- story: 24
- sequence: 5 of 5
- depends-on: weekly-plan-generation
- complexity: low
- priority: P2

## Problem

Morgane asks for « une justification courte de la pertinence de la recette », and marks it « si facile à mettre en place sinon pas pour le MVP ».

## Proposed change

The generation schema gains one optional field, `justification`, one sentence in French that names the validated recommendation or goal the recipe serves. The card shows it under the description. The field never names a diagnosis or a medical term the protocol does not contain.

## Acceptance criteria

- [ ] A generated recipe may carry one sentence of justification, 160 characters or fewer.
- [ ] The sentence refers to a validated recommendation, directive or goal of the patient, never to anything else.
- [ ] The card shows it when present and shows nothing when absent.
- [ ] A shared recipe (story 25) never includes it.

## Out of scope

- A longer explanation. A link to the recommendation.

## Notes

Morgane's question 7 in the breakdown decides whether this stub starts. Files: the recipe schema, `prompts/recipe.ts`, the card component. Cross-epic: `recipe-card/recipe-card-view`, `recipe-card/recipe-sharing` (excludes it).
