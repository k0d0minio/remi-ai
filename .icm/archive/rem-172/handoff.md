# Handoff rem-172

## Next action

L'opérateur coche Ready to merge. Ensuite, Release fusionne.

## How to test

Ouvrez l'aperçu du site public, section « étapes » : l'étape en cours a la couleur d'attention de la charte (`#925F12`), plus orange. Dans l'application, un message d'erreur a le rouge `#B42318`.

## What changed

- `packages/ui/src/tokens.css` : `--warning` est `#925f12` et `--error` est `#b42318`, avec un texte clair dessus (contrastes 5,4:1 et 6,6:1). Les fonds légers, les bordures et les textes de ces deux intentions suivent ces teintes.
- Les composants `Badge` gardent leur icône ou leur libellé : ce ticket ne change aucun composant.
- Le thème sombre garde ses valeurs. REM-175 décide de ce thème.
- Cette branche et REM-171 changent des lignes voisines de `tokens.css` : la seconde fusion peut demander une fusion de `main` dans la branche.

## Blockers

- none

## Do not touch

- none
