# Handoff rem-177

## Next action

L'opérateur coche Ready to merge. Ensuite, Release fusionne.

## How to test

Ouvrez l'aperçu de l'application : le titre d'un écran fait 32 px, en gras fort (800). Les titres de section font 18 px en 800. Sur l'accueil du patient, le titre fait 26 px. Zoomez à 200 % : aucun texte n'est coupé.

## What changed

- `packages/ui/src/tokens.css` : les tailles que `Typography` émet prennent les valeurs de la charte. `2xl` est le titre d'écran (32 / 38 px, interlettrage −0,8 px), `lg` le titre de section (18 / 24 px), `xs` le microtexte (13 / 18 px). `base` (16 / 24 px) et `sm` (14 / 20 px) avaient déjà les valeurs de la charte.
- `packages/ui/src/server/typography.tsx` : les titres d'écran, les titres de section et la variante `display` sont en graisse 800. Un titre de carte (`base`, graisse forte) a un interligne de 22 px.
- Aucun appel de `Typography` ne change, sauf le titre de l'accueil du patient, qui fait 26 px (la charte demande 24 à 28 px).
- La graisse 800 a son vrai dessin avec Plus Jakarta Sans (REM-176). Avant cette fusion, Inter l'affiche aussi.
- Les écrans qui écrivent une taille à la main, sans `Typography`, gardent leur taille. Les tailles `xl` et `3xl` ne sont pas dans le tableau de la charte et ne changent pas.

## Blockers

- none

## Do not touch

- none
