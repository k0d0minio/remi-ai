# Handoff rem-174

## Next action

L'opérateur coche Ready to merge. Ensuite, Release fusionne.

## How to test

Ouvrez l'aperçu de l'application : les cartes ont une ombre très légère. Ouvrez un menu ou une fenêtre : son ombre est discrète, la même partout.

## What changed

- `packages/ui/src/tokens.css` a deux ombres, celles de la charte : `--shadow-card` et `--shadow-float`.
- Les utilitaires gardent leurs noms, pour ne changer aucun composant : `shadow-xs` et `shadow-sm` donnent shadow.card, et `shadow-md`, `shadow-lg`, `shadow-xl` donnent shadow.float.
- Le token `--shadow-color` est retiré, avec sa valeur du thème sombre.
- Ce ticket ne retire aucune ombre d'une carte : la charte demande une ombre « seulement si nécessaire », et ce choix se fait écran par écran.

## Blockers

- Les aperçus Vercel de `admin` et `app` échouent : « Resource provisioning failed ». Le projet Neon `uat-remi-ai` a 10 branches, sa limite. L'opérateur libère des branches Neon ou monte la limite. Ensuite, une session relance les aperçus.

## Do not touch

- none
