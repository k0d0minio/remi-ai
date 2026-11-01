# Breakdown: patient-file-creation — one file per patient, opened by the link or by the practitioner

- epic-slug: patient-file-creation
- source: story 1 « Création du dossier patient », Morgane Paquet, 12 October 2026, https://drive.google.com/file/d/1euZKVlwh7THGIG_Q_lNQFYVSZg4kfcyC/view
- story: 1

## What I understood

Each practitioner has one permanent sign-up link, copied in one click into their appointment
confirmations. A patient who follows it creates an account attached to that practitioner and
reaches the questionnaire. When the patient did not, the practitioner creates and completes
the whole file from the console, with every questionnaire field, and no invitation goes out.
An e-mail already known to the same practitioner opens the existing file instead of a second
one. The patient later takes that file over when they activate their account. The appointment
date can be entered by either side. Recipes stay locked until activation (story 19). On `main`
the console has `(admin)/patients/new` and every operator sees every patient. There is no care
relationship column and no practitioner link. This epic adds both and rests on D-26, D-27,
D-28 and D-31.

### Questions for Morgane

1. On 1 December, is there one practitioner with a link (you) or several? Default: you alone. The structure holds several.
2. When you create a file with an e-mail, REMI sends nothing until activation. Correct? Default: yes.
3. Where does your link appear: the account page, the patient list, or both? Default: both.
4. The appointment date: one date per file, overwritten at each consultation, or a history? Default: one date.
5. Story 1 lets you enter the génotype on a file you create. Story 3 writes a génotype only under the patient's genetic consent. May you enter it before the patient consents? Default: no. The genotype fields stay locked until the patient gives the genetic consent at takeover.

Morgane answered on the call of 2026-10-23 (recorded by Jamie, 2026-11-01): 1. About a dozen practitioners before 19 December. The structure holds several from the start.

### Questions for Jamie

1. The care relationship: a `practitioner_id` column on `patient_profiles` referencing `operators`, or a join table? Default: a column.
2. Backfill today's profiles to Morgane's operator by migration? Default: yes.

## Build order

1. care-relationship — `practitioner_id` on every patient, backfilled, read by every scope — depends-on: none
2. practitioner-signup-link — one permanent link per practitioner, copied in one click, resolved by the sign-up page — depends-on: care-relationship
3. practitioner-creates-file — « Nouveau patient » creates and completes the whole file, no invitation, no duplicate — depends-on: care-relationship
4. appointment-date — one appointment date per file, entered by either side — depends-on: practitioner-creates-file
5. patient-takes-over-file — the patient activates an account on the file the practitioner created — depends-on: practitioner-creates-file

## Criteria → stubs

| #   | Morgane's criterion (short, her French kept)                                                                                                                                                           | Stub                                                                   |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------- |
| 1   | « Un seul lien permanent par praticien ; il reste utilisable après plusieurs inscriptions et se copie en un clic »                                                                                     | practitioner-signup-link                                               |
| 2   | « L'inscription via le lien rattache automatiquement le patient au bon praticien ; un lien invalide ne crée aucun dossier »                                                                            | practitioner-signup-link                                               |
| 3   | « Le praticien peut créer et compléter intégralement le profil … sans déclencher automatiquement d'invitation »                                                                                        | practitioner-creates-file                                              |
| 4   | « Le praticien peut consulter, compléter et modifier l'ensemble des réponses au questionnaire préparatoire, y compris lorsqu'elles sont manquantes »                                                   | practitioner-creates-file                                              |
| 5   | « Une adresse e-mail déjà liée au même praticien n'entraîne jamais la création d'un second dossier : REMI propose d'ouvrir le dossier existant ou de s'y connecter »                                   | practitioner-creates-file (console), patient-takes-over-file (patient) |
| 6   | « Si le profil a été créé par le praticien, le patient reçoit un e-mail d'activation une fois les recommandations validées et peut accéder à son espace REMI avec les informations déjà enregistrées » | patient-takes-over-file                                                |
| 7   | « Les champs manquants sont signalés ; le dossier peut être enregistré sans questionnaire complet »                                                                                                    | practitioner-creates-file                                              |
| 8   | « Le praticien ne voit que les dossiers qui lui sont rattachés et le patient ne voit que son propre profil »                                                                                           | care-relationship, consent-and-data/data-access-scoping                |
| 9   | « Aucune recette personnalisée n'est accessible avant activation par le praticien »                                                                                                                    | patient-access (story 22)                                              |

## Out of scope

- The questionnaire fields and their validation (`preparatory-questionnaire`). This epic reuses that form in the console.
- The activation itself and its e-mail (`care-activation`, story 19). This epic makes the takeover work when that e-mail arrives.
- Several practitioners per patient.
