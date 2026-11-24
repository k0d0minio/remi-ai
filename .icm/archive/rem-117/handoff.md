# Handoff rem-117

## Next action

L'opérateur teste la déconnexion sur l'aperçu de la console (`admin`), coche **Ready to merge** sur la pull request #242, puis lance `release REM-117`.

## How to test

Ouvrez « Nouvelle consultation » d'un patient, tapez une note, puis déconnectez-vous avec « Se déconnecter » dans le menu du compte. Dans les outils de développement, onglet Application, `localStorage` ne contient plus aucune clé `remi:consultation:`. La déconnexion mène à la page de connexion comme avant.

## Blockers

- none

## Do not touch

- Le TTL de 12 h du brouillon (`DRAFT_TTL_MS`, #99) reste en place.
