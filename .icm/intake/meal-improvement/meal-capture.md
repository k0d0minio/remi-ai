# Stub: The patient says or shows what they plan to eat

- feature-slug: meal-capture
- epic: meal-improvement
- story: 28
- sequence: 1 of 3
- depends-on: none
- complexity: medium
- priority: P0

## Problem

The patient cannot show REMI a meal. The link accepted text only and no model read it.

## Proposed change

The « Qu'as-tu prévu de manger ? » block (story 31) accepts a text, a photo or both. A photo is resized in the browser, uploaded through the files seam under the patient's prefix, image types only, 5 MB cap. One row in `patient_meal_entries` is written with `written_by = patient`, today's date, the text and a new `photo_blob_key`. A new table `meal_suggestions` holds the attempts: meal entry id, attempt number, the two blocks, the improvement, the explanation, the linked recommendation or goal, the flagged evictions, the patient's response, the generation id. The product no longer writes `intent` or `feedback` on a meal entry.

## Acceptance criteria

- [ ] A meal can be submitted with text only, photo only, or both.
- [ ] A photo is stored privately through the files seam and read only through a short signed URL.
- [ ] A file that is not an image or exceeds the cap is refused with a message.
- [ ] A meal entry carries `written_by = patient` and the photo key.
- [ ] The table `meal_suggestions` exists with the fields above and cascades on patient deletion.
- [ ] A photo older than the retention period is deleted by a scheduled job. RETENTION.md says so.
- [ ] A patient cannot submit more than 20 meals a day.

## Out of scope

- The model call, the blocks, the buttons.

## Notes

D-18, D-25 (this stub owns its migration), D-29. Files: `schema.ts`, one migration, `apps/web/app/[locale]/(patient)/page.tsx` (the home's block), `packages/services/src/server/meals/*`, `.icm/docs/RETENTION.md`. Cross-epic: `recipe-space/ai-gateway-adapter` (the next stub needs it), `patient-home-navigation` (the block's place).
