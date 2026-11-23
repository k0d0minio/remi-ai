# Handoff rem-205

## Next action

L'opérateur teste le questionnaire sur la preview de la PR #233, puis coche **Ready to merge**.

## How to test

Sur la preview de `app`, connecte-toi en patient et ouvre `/questionnaire`. À chaque étape avec un choix (par exemple le régime alimentaire), chaque cercle est entier, non coupé, et centré sur la première ligne de son libellé. Touche un choix : le cercle devient bleu avec un point au centre, les autres restent vides.

## Changement

- `packages/ui/src/server/radio-card.tsx` : le cercle n'est plus le bouton radio natif du navigateur. Il est dessiné (bord de 2 px dans une boîte de 20 px, point en ombre intérieure).
- Le même composant `RadioCard` sert aussi dans `admin` (fiche patient : choix en cartes, structure des repas). Ses cercles y prennent le même dessin.

## Blockers

- none

## Do not touch

- La première page d'inscription : une autre session la modifie.
