# Handoff rem-8

## Next action

L'opérateur teste le changement et coche **Ready to merge**. Ensuite, il dit `release REM-8`.
Cette pull request est empilée sur #235 (REM-6), elle-même sur #234 (REM-10). Fusionnez-les dans cet ordre.

## Decision

- La police Plus Jakarta Sans, les tailles 32/38 et 18/24 et les couleurs `#253348` et `#566579` existaient déjà dans les tokens (REM-170 à REM-179). Ce ticket les applique à la page.
- Titre principal : 32 px, graisse 800. Titre « Tes données personnelles » : 18 px, graisse 800.
- Le sous-titre, le texte explicatif et la phrase de chaque case passent de 14 à 16 px (interligne 24 px). La version de chaque document passe de 13 à 14 px.
- Les espacements suivent l'échelle de la charte (8, 16, 24, 32 px) : le titre et son sous-titre sont groupés, puis 32 px avant les documents.
- Le texte juridique dans le bloc de lecture garde sa taille de 14 px. REM-9 retire ce bloc.

## How to test

Ouvrez le lien d'inscription d'une praticienne. Le titre « Bienvenue sur REMI » est grand et très gras. « Tes données personnelles » est un titre plus petit mais aussi gras. Les textes sous les titres et à côté des cases sont à la taille normale de lecture, en gris-bleu pour les descriptions.

## Blockers

- none

## Do not touch

- none
