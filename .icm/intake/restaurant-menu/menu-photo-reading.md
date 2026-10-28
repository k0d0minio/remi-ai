# Stub: The patient photographs a menu and REMI lists the dishes it can read

- feature-slug: menu-photo-reading
- epic: restaurant-menu
- story: 29
- sequence: 1 of 2
- depends-on: none
- complexity: medium
- priority: P2

## Problem

At the restaurant the patient has a menu and no way to ask REMI about it.

## Proposed change

A « Je suis au restaurant » entry under the home block (story 31), shown only when this epic ships. The patient takes a photo. It is resized in the browser and uploaded through the files seam (D-18) under the patient's prefix, image types only, 5 MB cap. This epic owns that path. One vision call returns the dishes it can read: name, description when printed, a confidence. A menu with no readable dish returns « Je n'arrive pas à lire la carte. Peux-tu reprendre une photo ? ». The photo is stored privately and deleted after the retention period of `.icm/docs/RETENTION.md`.

## Acceptance criteria

- [ ] The entry appears on the home only when this stub is merged.
- [ ] A readable menu returns the list of dishes with their printed description.
- [ ] An unreadable menu returns the new-photo message and no dish.
- [ ] The call is one row in `ai_generations`.
- [ ] The photo is stored privately under the patient's prefix and read only through a short signed URL.
- [ ] A file that is not an image or exceeds 5 MB is refused with a message.
- [ ] A photo older than the retention period of `.icm/docs/RETENTION.md` is deleted by a scheduled job.

## Out of scope

- The judgement. Handwritten menus in languages other than French, Dutch and English.

## Notes

D-18, D-29. This stub owns the photo path. Story 33 removed the meal photo of story 28. Files: `apps/web/app/[locale]/(patient)/restaurant/page.tsx`, `prompts/menu-read.ts`, `packages/services/src/server/restaurant/*`, `.icm/docs/RETENTION.md`. Cross-epic: `recipe-space/ai-gateway-adapter`, `patient-home-navigation` (the conditional entry).
