# Handoff rem-181

## Next action

L'opérateur teste le changement et coche **Ready to merge**. Ensuite, il dit `release REM-181`.

## Decision

- Q1 : « type d'alimentation » remplace « régime ». Jamie a accepté la valeur par défaut dans le chat, le 2026-11-19.

## Change

- `apps/web/lib/content/fr.ts` : « Type d'alimentation » (profil et questionnaire), « Précisez votre type d'alimentation », l'aide « Aucun type d'alimentation particulier ».
- `packages/services/src/shared/questionnaire.ts` : le libellé `dietLabels.none.fr` devient « Aucun type d'alimentation particulier ». L'aide du questionnaire cite ce libellé, les deux restent égaux. La fiche du patient dans l'admin montre aussi ce libellé.
- Aucun identifiant, aucune clé et aucune valeur de la base ne change.

## How to test

Ouvrez le questionnaire du patient, à la question sur l'alimentation : le mot « régime » n'apparaît plus. Ouvrez « Mon profil » depuis le lien du patient : le champ s'appelle « Type d'alimentation ».

## Blockers

- none

## Do not touch

- `packages/services/src/consent/texts/` et les textes de la praticienne dans `apps/admin/`.
