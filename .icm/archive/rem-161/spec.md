# Spec: Questionnaire patient – Ajouter la question personnalisée du praticien

- ticket: REM-161
- touches: packages/services/src/db/schema.ts, packages/services/src/db/migrations/, packages/services/src/db/services/operators/, packages/services/src/db/services/patient-questionnaire/, packages/services/src/db/models/, apps/admin/app/(admin)/account/page.tsx, apps/admin/components/operators/, apps/admin/lib/operators/actions.ts, apps/admin/components/patients/questionnaire-file.tsx, apps/admin/components/patients/profile-summary.tsx, apps/admin/components/patients/patient-form.tsx, apps/web/app/[locale]/questionnaire/, apps/web/lib/questionnaire/
- complexity: standard

## Problem

Le questionnaire préparatoire pose les mêmes questions à tous les patients. Le praticien ne
peut pas demander une information propre à sa pratique avant la consultation. La colonne de
la réponse existe déjà (`patient_profiles.practitioner_question_answer`, migration 0027) et
le dossier patient de la console affiche la réponse. Mais aucun praticien ne peut écrire la
question, et le patient ne la voit jamais.

## Proposed change

- Sur la page « Mon compte » de la console, le praticien écrit une question libre, la
  modifie ou l'efface. Une seule question par praticien.
- Le patient rattaché à ce praticien voit la question dans l'étape Consultation, après les
  questions communes (motif et date de consultation). Il répond dans une zone de texte
  libre. La réponse s'enregistre seule, comme les autres champs du questionnaire (REM-167).
  Il peut la modifier.
- La question est facultative : elle n'entre pas dans les champs obligatoires et ne bloque
  pas la fin du questionnaire.
- Sans question configurée, l'étape Consultation reste comme aujourd'hui.
- Le dossier patient de la console montre la question telle que le patient l'a vue, puis sa
  réponse. Si le praticien change sa question plus tard, le dossier garde le texte que le
  patient a lu.

Technique : une migration additive, sans perte. Deux colonnes `text` nulles :
`operators.questionnaire_question` et `patient_profiles.practitioner_question_text` (la
copie de la question au moment de la réponse). Aucune ligne existante ne change.

## Acceptance criteria

- [ ] La migration s'applique sur la base de la preview et `db:verify` passe. (verify: CI)
- [ ] Sur « Mon compte », le praticien enregistre une question, la modifie, puis l'efface. Après un rechargement, la page montre la dernière valeur. (verify: agent)
- [ ] Un patient d'un praticien avec une question voit cette question dans l'étape Consultation, sous la date de consultation, avec une zone de texte libre. (verify: operator)
- [ ] La réponse s'enregistre sans bouton. Après un rechargement de la page, le patient retrouve sa réponse et peut la changer. (verify: operator)
- [ ] Un patient d'un praticien sans question ne voit aucun champ en plus dans l'étape Consultation. (verify: operator)
- [ ] Une réponse vide ne bloque pas la fin du questionnaire et n'apparaît pas dans la liste des réponses manquantes. (verify: operator)
- [ ] Dans le dossier patient de la console, le praticien lit la question et la réponse du patient. (verify: operator)
- [ ] Tous les textes nouveaux sont en français. (verify: agent)

## Out of scope

- Plusieurs questions par praticien.
- Un autre type de réponse que le texte libre (choix, date, nombre).
- Une question obligatoire. Le ticket la veut facultative par défaut, et aucune règle ne dit le contraire.
- La page d'inscription (REM-9 la change en parallèle).
- La base de production. Elle migre seulement à la promotion, sur la parole de Jamie.

## Open questions

- Le ticket dit « une question libre » : une seule question par praticien. La note de l'ancien
  stub `practitioner-free-question` le prévoyait aussi.
- Le praticien écrit la question sur la page « Mon compte » de la console, la page de son
  lien d'inscription. Choix à vérifier avant l'approbation.
- Longueur maximale : 500 caractères pour la question, 5 000 pour la réponse (la limite
  actuelle du service).
