# Handoff rem-215

## Next action

L'opérateur teste le changement sur la préview de la PR #257 et coche **Ready to merge**. Ensuite, il dit `release REM-215`.

## Decision

- REM-215 est la suite de REM-12 (PR #238, déjà fusionnée). Jamie, 2026-11-27 : « Yes, new ticket ». REM-215 est lié à REM-12.
- Le lien long de la fenêtre « Politique de confidentialité » passe à la ligne à n'importe quel caractère (`wrap-anywhere`). Il reste dans la fenêtre.
- Les liens « Conditions générales de vente » et « Politique de confidentialité » de la phrase de la case ont une couche transparente de 10 px au-dessus et au-dessous. La zone de toucher fait 44 px de haut. La phrase garde sa mise en page.

## How to test

Ouvre un lien d'inscription sur un téléphone de 390 px. Ouvre « Politique de confidentialité » et descends jusqu'au lien de l'Autorité de protection des données : il passe à la ligne et reste dans la fenêtre. Touche juste au-dessus ou au-dessous d'un lien de la phrase : la fenêtre s'ouvre.

## Blockers

- none

## Do not touch

- none
