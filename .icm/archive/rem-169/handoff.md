# Handoff rem-169

## Next action

L'opérateur coche Ready to merge. Ensuite, Release fusionne.

## How to test

Ouvrez la demande de fusion et lisez `packages/ui/brand/charte-graphique.md` : la charte est complète, en français, avec le logo. Ouvrez `CONVENTIONS.md`, section « The design system » : la première règle envoie vers la charte. Aucun fichier de code ne change.

## What changed, and why no user sees it

- `packages/ui/brand/charte-graphique.md` est la charte de Morgane du 16 novembre 2026, texte complet. La mise en forme Markdown est la seule différence avec le fichier Word : les codes de couleur sont entre accents graves.
- `packages/ui/brand/logo/remi-logo-charte.png` est l'image du fichier Word.
- Le ticket ne nomme pas l'emplacement. Le choix est `packages/ui/brand/`, parce que ce dossier a déjà les fichiers de marque de Morgane et que son README se nomme « the design reference ».
- Les routes : `CONVENTIONS.md` (section « The design system »), `packages/ui/AGENTS.md`, `apps/web/AGENTS.md` et `packages/ui/brand/README.md`. `CLAUDE.md` envoie déjà chaque session de code vers `CONVENTIONS.md` puis vers le `AGENTS.md` du sous-dossier.
- `apps/web/AGENTS.md` est un fichier de règles, pas un fichier d'application. Aucun code, aucun token CSS et aucune police ne changent.
- La liste des écarts entre le code et la charte est dans `findings.md` : dix-huit entrées.

## Blockers

- none

## Do not touch

- none
