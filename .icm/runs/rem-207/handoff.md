# Handoff rem-207

## Next action

L'opérateur répond aux questions Q1 à Q3 (carte HUD ou corps de la PR #246), relit la spec et
coche Spec approved sur la PR #246. Puis il dit `build REM-207`.

## How to test

Après le build : faire une nouvelle inscription patient sur la preview, puis ouvrir Profil,
« Mes consentements ». La ligne « Conditions générales de vente » montre la date du jour et la
version 1. Le dossier du patient dans la console montre la même chose.

## Blockers

- Les questions Q1 à Q3 attendent la réponse de l'opérateur.
- Spec approved attend la coche de l'opérateur.

## Do not touch

- `packages/services/src/consent/texts/cgv/1.fr-BE.md` : un texte publié ne change jamais.
