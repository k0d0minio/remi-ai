# Handoff rem-178

## Next action

L'opérateur coche Ready to merge. Ensuite, Release fusionne.

## How to test

Ouvrez l'aperçu de l'application et de la console : les cartes ont des coins bien arrondis (24 px) et un padding de 16 px. Les champs de formulaire ont un rayon de 16 px, un fond blanc et font 48 px de haut.

## What changed

- `packages/ui/src/tokens.css` : l'échelle des rayons suit la charte. `lg` fait 16 px (champs, cartes secondaires), `xl` 20 px, `2xl` 24 px (carte principale). `md` (8 px) et `sm` (6 px) servent aux petites pièces.
- `Card` : rayon 24 px, padding et espacement de 16 px.
- `Input`, `Select` et `Textarea` : rayon 16 px, fond blanc (surface.card), hauteur 48 px (56 px pour la taille `lg`).
- Tous les blocs qui utilisent `rounded-lg` passent de 10 px à 16 px, le rayon des cartes secondaires.
- Les boutons ne changent pas ici : REM-179 leur donne la forme en pilule.
- Cette branche et REM-173 changent la même ligne dans `input.tsx`, `select.tsx` et `textarea.tsx`. À la seconde fusion, il faut fusionner `main` dans la branche et garder les deux changements.
- La console devient moins dense : les champs gagnent 12 px de hauteur.

## Blockers

- none

## Do not touch

- none
