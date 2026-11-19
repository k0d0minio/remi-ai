# Handoff rem-176

## Next action

L'opérateur coche Ready to merge. Ensuite, Release fusionne.

## How to test

Ouvrez l'aperçu de l'application, de la console et du site public : tous les textes sont en Plus Jakarta Sans. Aucun titre n'a de police à empattements.

## What changed

- `apps/web`, `apps/admin` et `apps/marketing` chargent Plus Jakarta Sans avec `next/font` (police variable, graisses 400 à 800, servie par la plateforme). Inter et Instrument Serif sont retirées.
- `packages/ui/src/tokens.css` : la variable est `--font-jakarta`, avec le repli system-ui / sans-serif. La famille des titres est la même famille.
- Les tailles et les graisses des titres ne changent pas ici : REM-177 applique l'échelle de la charte.
- `apps/docs` (le site de référence interne) garde la police de son thème Nextra. Le ticket nomme l'application, la console et le site.
- Le nom REMI écrit par le composant `Wordmark` passe aussi en Plus Jakarta Sans. REM-182 le remplace par le logo.

## Blockers

- none

## Do not touch

- none
