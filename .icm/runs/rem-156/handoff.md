# Handoff rem-156

## Next action

Jamie tests the questionnaire on the preview and ticks Ready to merge. Release merges.

## How to test

Ouvre le questionnaire sur la preview, en patient, sur un smartphone. À l'étape 1, vérifie le lien « Modifier » avec le crayon en haut à droite du bloc Identité, puis « Continuer » sur toute la largeur juste en dessous. Passe les six étapes : « Continuer » et « Retour » restent au même endroit, et « Se déconnecter » est un lien discret centré en bas.

## Blockers

- none

## Do not touch

- `questionnaire-end.tsx`: REM-168 changes it. REM-168 uses `QuestionnaireActions` after this merge.
