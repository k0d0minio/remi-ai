# Spec: Inscription patient – Enregistrer la version des CGV acceptée

- ticket: REM-207
- touches: packages/services/src/shared/consent.ts, packages/services/src/consent/, packages/services/src/auth/patient-signup.ts, packages/services/src/auth/patient-takeover.ts, packages/services/src/db/services/patient-consents/, apps/web/components/signup/, apps/web/components/takeover/, apps/web/components/patient-consents/, apps/web/lib/signup/, apps/web/lib/takeover/, apps/web/lib/consents/, apps/web/lib/content/, apps/admin/components/patients/consents-section.tsx, apps/admin/components/audit/vocabulary.ts
- complexity: standard

## Problem

Sur la première page d'inscription, une seule case accepte les CGV et la Politique de
confidentialité (REM-9). L'app enregistre une ligne pour la politique de confidentialité
(clé `care`, version 3) : date, version et empreinte du texte. Elle n'enregistre pas la
version des CGV. Rien ne prouve donc quelle version des CGV le patient a acceptée.

## Proposed change

- Quand le patient coche la case et crée son compte, l'app enregistre une deuxième ligne,
  clé `cgv` : date, version du texte des CGV affiché et empreinte (SHA-256) de ce texte.
  Le texte est le fichier `packages/services/src/consent/texts/cgv/1.fr-BE.md`.
- La ligne de la politique de confidentialité (`care`) reste comme aujourd'hui.
- « Mes consentements » montre une ligne « Conditions générales de vente » : la date
  d'acceptation, la version et un lien pour relire le texte accepté.
- La section consentements du dossier patient de la console montre la même acceptation :
  « Acceptées », la date et la version du texte.
- Si les CGV changent entre l'affichage de la page et l'envoi, l'inscription est refusée
  comme pour un texte de consentement périmé, et la page montre le texte actuel.
- Technique : aucune migration. La colonne `consent_key` est un texte sans contrainte. La
  clé `cgv` entre dans le vocabulaire des clés, sans entrer dans `mandatoryConsentKeys` :
  l'accès au service dépend toujours du seul consentement `care`.

## Acceptance criteria

- [ ] Une inscription avec la case cochée écrit deux lignes dans `patient_consents` : `care` (version 3) et `cgv` (version 1), chacune avec la date, la langue et l'empreinte du fichier. Un test du service le prouve. (verify: CI)
- [ ] Un envoi qui nomme une version des CGV qui n'est plus la version actuelle ne crée pas de compte. Un test du service le prouve. (verify: CI)
- [ ] Le test qui fixe l'empreinte du fichier CGV version 1 reste vert : le texte publié ne change pas. (verify: CI)
- [ ] Après une nouvelle inscription sur UAT, « Mes consentements » montre la ligne « Conditions générales de vente », acceptées à la date du jour, version 1, avec un lien qui ouvre le texte. (verify: operator)
- [ ] Dans la console, la section consentements du dossier de ce patient montre les CGV acceptées, la date et la version 1. (verify: operator)
- [ ] La ligne « politique de confidentialité » montre la même chose qu'avant ce changement. (verify: operator)
- [ ] Tous les textes nouveaux sont en français. (verify: agent)

## Out of scope

- Demander une nouvelle acceptation quand une nouvelle version des CGV sort. Une version
  validée par le juriste sera un nouveau fichier (`cgv/2.fr-BE.md`) et un ticket à part.
- Le texte des CGV et son bandeau « à faire valider par un juriste ».
- Une ligne CGV pour les patients inscrits avant ce changement : aucune ligne n'est
  inventée.
- Le site public et sa copie des CGV.
- La base de production. Ce changement n'a pas de migration.

## Open questions

- Le nom affiché est « Conditions générales de vente », comme le lien de la case.
- La clé `cgv` ne rend pas les CGV obligatoires pour l'accès au service : un patient sans
  ligne CGV garde son accès.
