# Handoff rem-186

## Next action

L'opérateur coche Ready to merge. Ensuite, Release fusionne.

## How to test

Ouvrez `CLAUDE.md` dans la demande de fusion : le tableau Routing a une ligne qui envoie le travail d'interface vers `packages/ui/brand/charte-graphique.md`.

## What changed, and why no user sees it

- `CLAUDE.md`, tableau Routing : une ligne de plus, après « write code ». Jamie a demandé ce ticket le 19 novembre 2026.
- Le tableau est réaligné, parce que la nouvelle ligne est plus longue que les autres. Aucun autre texte ne change.
- Le ticket ne change qu'un fichier de routage.

## Blockers

- Les aperçus Vercel de `admin` et `app` échouent : « Resource provisioning failed ». Le projet Neon `uat-remi-ai` a 10 branches, sa limite. L'opérateur libère des branches Neon ou monte la limite. Ensuite, une session relance les aperçus.

## Do not touch

- none
