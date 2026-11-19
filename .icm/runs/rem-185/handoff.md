# Handoff rem-185

## Next action

L'opérateur coche Ready to merge. Ensuite, Release fusionne.

## How to test

Ouvrez `packages/ui/brand/README.md` dans la demande de fusion : l'ancien tableau de couleurs n'y est plus, et la section « The palette and the typeface » renvoie à la charte.

## What changed, and why no user sees it

- `packages/ui/brand/README.md` ne donne plus aucune valeur de couleur. Il renvoie aux sections 3, 4 et 5 de la charte et nomme Plus Jakarta Sans.
- Le README dit que `src/tokens.css` a les mêmes valeurs : c'est vrai quand REM-170 à REM-173 et REM-176 sont fusionnés. Fusionnez ce ticket après eux.
- Cette branche et REM-184 changent le même fichier, à deux endroits différents.

## Blockers

- none

## Do not touch

- none
