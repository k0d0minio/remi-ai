# Handoff rem-184

## Next action

L'opérateur coche Ready to merge. Ensuite, Release fusionne.

## How to test

Ouvrez `packages/ui/brand/README.md` dans la demande de fusion : sous le tableau des fichiers, un paragraphe dit que les visuels servent à la communication seulement.

## What changed, and why no user sees it

- `packages/ui/brand/README.md` a la règle de la charte : pas de photo ni d'illustration dans l'application (MVP).
- Vérifié le 19 novembre 2026 : `apps/web` et `apps/admin` n'ont aucune image (`next/image`, `<img>`, dossier `public/`).
- Le ticket ne change qu'un document.

## Blockers

- none

## Do not touch

- none
