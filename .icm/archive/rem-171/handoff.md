# Handoff rem-171

## Next action

L'opérateur coche Ready to merge. Ensuite, Release fusionne.

## How to test

Ouvrez l'aperçu du site public et envoyez le formulaire de contact : la pastille de confirmation est verte (`#1F7A4D`), plus turquoise. Dans l'application, un badge ou une barre de succès a le même vert.

## What changed

- `packages/ui/src/tokens.css` : `--success` est `#1f7a4d` (feedback.success), avec un texte clair dessus (contraste 5,3:1). Le fond léger, la bordure et le texte de succès suivent cette teinte.
- Le turquoise a son propre token, `--brand-accent` (utilitaire `bg-brand-accent`), pour un point ou un filet. Aucun bouton et aucun texte ne l'utilisent.
- Le thème sombre garde ses valeurs. REM-175 décide de ce thème.
- Cette branche et REM-172 changent des lignes voisines de `tokens.css` : la seconde fusion peut demander une fusion de `main` dans la branche.

## Blockers

- none

## Do not touch

- none
