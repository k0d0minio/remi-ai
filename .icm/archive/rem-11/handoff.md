# Handoff rem-11

## Next action

L'opérateur teste le changement et coche **Ready to merge**. Ensuite, il dit `release REM-11`.
Cette pull request est empilée sur #236 (REM-8), #235 (REM-6) et #234 (REM-10). Fusionnez-les dans l'ordre : #234, #235, #236, puis celle-ci.

## Decision

- « Continuer » était déjà une pilule bleue de 56 px (REM-176). Désactivé, il passe d'un bleu à 50 % d'opacité à un fond gris-bleu pâle (`#E4EDF8`) avec un texte gris-bleu (`#566579`). Le changement est sur cette page seulement, pas dans le composant partagé.
- La case reste à 24 px. Sa zone de toucher fait 44 × 44 px. La phrase à côté de la case coche aussi la case.
- « Relire » est un bouton secondaire : 44 px de haut (charte, section 6), au lieu de 56 px.
- Le bloc de lecture a un contour de focus visible. Un lien dans un document est bleu, souligné, avec un focus visible. Les textes actuels n'ont pas de lien : la règle sert à REM-9.
- La phrase « Coche pour continuer : … » est supprimée. Le bouton désactivé suffit.
- La page de reprise de dossier (`/inscription/reprendre/…`) a la même étape de consentement, donc les mêmes changements.

## How to test

Ouvrez le lien d'inscription d'une praticienne. Tant qu'une case n'est pas cochée, « Continuer » est gris pâle et aucun message « Coche pour continuer » n'apparaît. Cochez les cases (en touchant la case ou sa phrase) : « Continuer » devient bleu. Avec la touche Tab, chaque élément montre un contour bleu.

## Blockers

- none

## Do not touch

- none
