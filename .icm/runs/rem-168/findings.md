# Findings — REM-168

## Le prénom du praticien n'existe pas dans les données

- kind: follow-up (Triage)
- found: 2026-11-27
- why: l'étape 1 de la page de fin doit afficher « Avec [prénom du praticien] ». La table
  `operators` n'a qu'un champ `name` (nom complet). Décision de Jamie (2026-11-27) : sans
  prénom, la page affiche « Avec ton praticien », et un ticket Triage couvre la donnée.
- title: Praticien – Enregistrer le prénom du praticien pour l'afficher au patient
- description:

  ## Problème
  La page de fin du questionnaire patient (REM-168) affiche « Avec ton praticien ». Le compte
  du praticien n'a qu'un nom complet, sans prénom séparé. La page ne peut donc pas afficher
  « Avec [prénom du praticien] ».

  ## Modifications proposées
  - Ajouter un champ « Prénom » au compte du praticien (invitation et profil de la console).
  - Remplir ce champ pour les comptes existants.
  - Afficher « Avec [prénom] » sur la page de fin du questionnaire quand le prénom existe.

  ## Critères d'acceptation
  - Le praticien saisit et modifie son prénom dans la console.
  - La page de fin du questionnaire affiche « Avec [prénom du praticien] ».
  - Sans prénom, la page affiche toujours « Avec ton praticien ».

  ## Résultat
  Le patient voit le prénom de son praticien à l'étape « Ta consultation ».
- filed: REM-214 (https://linear.app/remi-ai/issue/REM-214), related to REM-168
