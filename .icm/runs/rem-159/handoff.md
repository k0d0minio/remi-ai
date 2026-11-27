# Handoff rem-159

## Cause

Le champ « Date de consultation » n'avait pas de règle de date : il acceptait une date passée et il n'était pas obligatoire. La date de naissance n'avait pas de règle d'âge.

## Next action

Jamie teste la preview `app`, puis coche Ready to merge. La release fusionne.

## How to test

Sur la preview `app`, ouvre le questionnaire d'un patient. À l'étape Identité, saisis une date de naissance de moins de 18 ans : le message « Tu dois avoir au moins 18 ans pour utiliser REMI. » s'affiche. À l'étape Consultation, saisis une date passée : le message « La date de consultation ne peut pas être antérieure à la date du jour. » s'affiche, « Continuer » reste possible, et l'écran de fin liste « Date de consultation ».

## Choix à vérifier

1. La date de consultation devient un champ obligatoire de la liste partagée. La console la montre donc aussi comme obligatoire. Un dossier sans date reste « Dossier à compléter ».
2. Une date passée compte comme manquante seulement côté patient. La console garde la date d'une consultation qui a eu lieu.
3. Une date de consultation refusée (passée ou invalide) efface la date enregistrée. Le journal d'audit note ce changement.
4. Le formulaire de la console accepte toujours une date passée saisie par le praticien.

## Blockers

- none

## Do not touch

- none
