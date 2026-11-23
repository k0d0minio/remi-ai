# Handoff rem-161

## Next action

Jamie teste sur la preview, coche **Ready to merge** sur https://github.com/k0d0minio/remi-ai/pull/239,
puis dit `release REM-161`. Le merge vers `main` déploie UAT. Le build `uat` de l'admin migre
la base UAT (migration 0047). La production ne bouge pas.

Décisions (Jamie, 2026-11-23, Spec approved) : une seule question par praticien, sur la page
« Mon compte ». Le dossier garde la question que le patient a lue. Question : 500 caractères
au plus. Réponse : 5 000 caractères au plus.

## Acceptance criteria

- Migration et `db:verify` : faits. Le build de la preview admin les a passés (CI GREEN à 7a50147).
- « Mon compte » : enregistrer, changer, effacer. Les tests du service le prouvent dans CI.
  Pas vérifié sur la preview : la console demande une connexion.
- Étape Consultation, sauvegarde automatique, pas de champ sans question, réponse facultative,
  dossier patient : à vérifier par l'opérateur. Les tests du service prouvent la copie de la
  question.
- Textes en français : faits.

## How to test

Dans la console, sur « Mon compte », écris une question et enregistre-la. Connecte-toi comme un
de tes patients : à l'étape Consultation, la question apparaît sous la date, et la réponse
reste après un rechargement. Dans le dossier du patient, lis la question et la réponse.

Previews :
- admin : https://admin-git-claude-rem-161-custom-question-e85815-remi21.vercel.app
- app : https://app-git-claude-rem-161-custom-question-e85815-remi21.vercel.app

## Blockers

- Ready to merge n'est pas coché.

## Do not touch

- La page d'inscription (REM-9).
- La base de production.
