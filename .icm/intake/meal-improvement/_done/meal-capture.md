# Stub: The patient types what they plan to eat

- feature-slug: meal-capture
- epic: meal-improvement
- story: 28
- sequence: 1 of 3
- depends-on: none
- complexity: medium
- priority: P0

## Problem

The patient cannot show REMI a meal. The link accepted text only and no model read it. Story 33 (2026-10-27) keeps the text and removes the photo: the patient types the dish and its ingredients.

## Proposed change

The « Qu'as-tu prévu de manger ? » block (story 31) accepts a text: the dish and, when the patient knows them, the ingredients. One row in `patient_meal_entries` is written with `written_by = patient`, today's date and the text. A new table `meal_suggestions` holds the attempts: meal entry id, attempt number, the two blocks, the improvement, the explanation, the linked recommendation or goal, the flagged evictions, the patient's response, the generation id. The product no longer writes `intent` or `feedback` on a meal entry. No photo, no file upload, no files seam in this epic.

## Acceptance criteria

- [ ] A meal is submitted as text. The field accepts a dish name alone or a dish with ingredients.
- [ ] An empty text is refused with a message. The field accepts up to 500 characters.
- [ ] A meal entry carries `written_by = patient`, today's date and the text. No photo column is written.
- [ ] The table `meal_suggestions` exists with the fields above and cascades on patient deletion.
- [ ] A patient cannot submit more than 20 meals a day.
- [ ] No upload control and no camera prompt appear in the block.

## Out of scope

- The model call, the blocks, the buttons.
- Any photo or voice input. Story 33 moves them to a later version.

## Notes

D-12 (text-only meals, confirmed by story 33), D-25 (this stub owns its migration), D-30. Files: `schema.ts`, one migration, `apps/web/app/[locale]/(patient)/page.tsx` (the home's block), `packages/services/src/server/meals/*`. Cross-epic: `recipe-space/ai-gateway-adapter` (the next stub needs it), `patient-home-navigation/home-meal-block` (the block's place).
