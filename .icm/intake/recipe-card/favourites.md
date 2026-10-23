# Stub: The patient keeps a recipe in « Mes favoris » and finds it again

- feature-slug: favourites
- epic: recipe-card
- story: 25
- sequence: 2 of 4
- depends-on: recipe-card-view
- complexity: medium
- priority: P0

## Problem

Today's recipe disappears tomorrow. The patient has no way to keep one.

## Proposed change

A heart on the card adds the recipe to the patient's favourites and removes it. A new table `patient_recipe_favourites` holds one row per patient and recipe. « Mes favoris » lists them under « Recettes », newest first. When a new protocol version is validated, every favourite is re-checked by the compatibility gate. A favourite that fails is hidden behind the note « Plus compatible avec tes recommandations » and is never deleted.

## Acceptance criteria

- [ ] A tap on the heart adds the recipe. A second tap removes it.
- [ ] Favourites survive sign-out and a new device.
- [ ] « Mes favoris » lists the patient's favourites and opens the card.
- [ ] A new validated protocol version re-runs the gate on every favourite within the hour.
- [ ] A favourite the gate no longer confirms is hidden with the note and reappears if a later version confirms it.
- [ ] Deleting a patient removes their favourites.

## Out of scope

- Sharing from favourites: `recipe-sharing`. Folders, tags or ratings.

## Notes

D-25: this stub owns its migration. D-30. Files: `schema.ts`, one migration, the card, `apps/web/app/[locale]/(patient)/recettes/favoris/page.tsx`. Cross-epic: `eviction-safety/compatibility-gate` (the re-check), `protocol-versions` (the trigger), `patient-home-navigation` (the entry).
