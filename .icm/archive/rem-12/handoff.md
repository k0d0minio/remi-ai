# Handoff rem-12

## Next action

L'opérateur teste le changement et coche **Ready to merge**. Ensuite, il dit `release REM-12`.
Cette pull request est la dernière de la pile : #234 (REM-10), #235 (REM-6), #236 (REM-8), #237 (REM-11), puis celle-ci. Fusionnez-les dans cet ordre.

## Decision

- Marges latérales de 20 px (au lieu de 16 px). Sur téléphone, moins d'espace au-dessus et au-dessous du logo : 24 px au lieu de 40 px.
- Le logo garde sa taille compacte de 112 px (charte : 96 à 120 px).
- Les textes de lecture sont à 16 px (REM-8). Le bouton « Continuer » prend toute la largeur. Les cases ont une zone de 44 × 44 px (REM-11).
- La fenêtre « Relire » prend toute la largeur du téléphone, avec la marge de 20 px. Son bouton « Fermer » a maintenant une zone de toucher de 44 × 44 px. Ce bouton est dans le composant partagé `Sheet` : les menus mobiles des apps et la fenêtre des consentements du profil ont aussi la zone de 44 px. L'icône ne bouge pas.
- Les cases cochées restent cochées après l'ouverture et la fermeture d'un document : l'état est dans le formulaire, pas dans la fenêtre. Pas de changement de code pour ce point.
- REM-9 remplacera le bloc de lecture et « Relire » par des fenêtres modales des CGV et de la politique de confidentialité.

## How to test

Ouvrez le lien d'inscription sur un téléphone. La page tient en une colonne, sans défilement horizontal, et les documents apparaissent vite sous le logo. Cochez une case, ouvrez « Relire », fermez la fenêtre avec la croix : la case est toujours cochée.

## Blockers

- none

## Do not touch

- none
