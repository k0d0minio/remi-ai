# Handoff rem-179

## Next action

L'opérateur coche Ready to merge. Ensuite, Release fusionne.

## How to test

Ouvrez l'aperçu de l'application : chaque bouton est une pilule. Le bouton principal d'un écran fait 56 px de haut, en bleu avec un texte blanc. Les autres boutons font 44 px, et le bouton à bordure a un fond blanc.

## What changed

- `packages/ui/src/components/button.tsx` : forme en pilule pour tous les boutons. Les tailles font 44 px (`sm`, `md`, `icon`) ou 56 px (`lg`, `xl`). Le bouton principal de taille par défaut fait 56 px.
- Le bouton `outline` a un fond blanc (surface.card) et une bordure légère : c'est le bouton secondaire de la charte.
- Un bouton principal de taille `sm` reste à 44 px, pour une action dans une ligne dense de la console.
- Aucun appel de `Button` ne change. La console devient moins dense : ses boutons passent de 32 ou 36 px à 44 px.
- Cette branche et REM-173 changent la même ligne de `button.tsx`. À la seconde fusion, il faut fusionner `main` dans la branche et garder les deux changements.

## Blockers

- Les aperçus Vercel de `admin` et `app` échouent : « Resource provisioning failed ». Le projet Neon `uat-remi-ai` a 10 branches, sa limite. L'opérateur libère des branches Neon ou monte la limite. Ensuite, une session relance les aperçus.

## Do not touch

- none
