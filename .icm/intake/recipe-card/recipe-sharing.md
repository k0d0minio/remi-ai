# Stub: The patient shares a recipe, and the recipient reads it without an account and without any patient data

- feature-slug: recipe-sharing
- epic: recipe-card
- story: 25
- sequence: 4 of 4
- depends-on: favourites
- complexity: medium
- priority: P1

## Problem

A patient who likes a recipe has no way to pass it on. Morgane wants every shared recipe to carry REMI's name.

## Proposed change

A « Partager » action on the card and on each favourite. It opens the phone's share sheet (Web Share API, a copy-link fallback) with a public URL `/r/<id>`. A new table `recipe_shares` holds an unguessable id, the patient recipe id, a jsonb snapshot of the recipe at share time and the dates. The public page renders the name, description, times, ingredients with quantities for the number of people chosen, the steps, the REMI logo, the sentence « REMI, la nutrition sur mesure » and one link to the platform. It never renders the justification, the patient's name, the protocol or any health information. The page is `noindex`.

## Acceptance criteria

- [ ] « Partager » works from the card and from « Mes favoris ».
- [ ] The recipient opens the page with no account and no sign-in.
- [ ] The page contains no personal data, no recommendation and no health information. A test asserts the rendered HTML against the forbidden fields.
- [ ] The logo, « REMI, la nutrition sur mesure » and the link to the platform are on every shared page.
- [ ] A later regeneration of the patient's plan does not change a shared page.
- [ ] The share id is unguessable (at least 128 bits) and the page is `noindex`.

## Out of scope

- Revoking a share. Share analytics. A sign-up form on the page.

## Notes

D-25: this stub owns its migration. Priority P1 pending Morgane's question 1. Files: `schema.ts`, one migration, `apps/web/app/r/[id]/page.tsx`, the card. Cross-epic: `recipe-space/recipe-justification` (excluded from the snapshot).
