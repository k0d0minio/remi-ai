# Handoff rem-158

## Cause

Trois règles serveur différentes contrôlaient le téléphone (inscription, questionnaire, fiche patient). Aucune n'exigeait l'indicatif du pays : `0470123456` passait. Le navigateur ne vérifiait rien avant l'envoi.

## Correction

- Une seule règle, `normalizePhone` de `packages/services/src/shared/phone.ts`, utilisée par le navigateur et par les trois services.
- Le numéro commence par `+` et un indicatif de la liste UIT. 8 à 15 chiffres (E.164). Pour la Belgique, la France, les Pays-Bas, le Luxembourg, l'Allemagne, la Suisse et le Royaume-Uni : la longueur du pays, sans le `0`.
- Le champ garde seulement `+`, les chiffres et les espaces (`maskPhoneEntry`).
- Libellé « Numéro de téléphone », exemple « +32 470 12 34 56 », texte d'aide et message d'erreur de Morgane (26/11).
- Un numéro enregistré avant REM-158 sans indicatif reste valable tant que la console le renvoie sans changement.
- Pas de nouvelle dépendance : l'ajout de `libphonenumber-js` a été refusé par la permission de la session.

## Next action

Jamie teste la preview, puis coche **Ready to merge** sur la pull request #255.

## How to test

Sur la preview, ouvre un lien d'inscription : le champ s'appelle « Numéro de téléphone » et montre « +32 470 12 34 56 ». Tape « 0470 12 34 56 » puis quitte le champ : le message « Veuillez saisir un numéro de téléphone valide, avec l'indicatif de votre pays. » apparaît. Le même champ et le même message sont dans le questionnaire (Mes informations) et dans Profil, Mes informations personnelles.

## Blockers

- none

## Do not touch

- none
