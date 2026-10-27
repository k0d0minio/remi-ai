# Breakdown: patient-signup-account — the patient creates one account and keeps it

- epic-slug: patient-signup-account
- source: story 2 « Inscription et compte patient », Morgane Paquet, 12 October 2026, https://drive.google.com/file/d/1gCJfGHyYMDX423FguDJEuwAL--WncGQe/view
- story: 2

## What I understood

The patient reaches a sign-up page from their practitioner's link. They enter nom, prénom,
date de naissance, e-mail, téléphone and a password. They give the consents (story 3) and go
straight to the preparatory questionnaire (story 4). One account serves the preparation and,
after activation (story 19), the care. The practitioner can also create the whole file from
the console (story 1). On `main` the patient has no account: `apps/web/app/[locale]/p/[token]`
reads and writes on a share token, and the only accounts are the operators' (scrypt and HMAC
tokens in `packages/services/src/auth/`). D-26 replaces the token link with accounts and D-28
puts one auth seam under both apps. This epic builds that seam and the sign-up and sign-in
pages. It rests on D-26, D-28, D-32. It supersedes D-2 and D-10.

### Questions for Morgane

1. Story 2 says « Prêt pour consultation » after the account is created. Stories 4 and 5 say after every mandatory questionnaire field is filled. Which one? Default: after the mandatory fields.
2. Does the patient need « Mot de passe oublié » by e-mail in the MVP? Default: yes.
3. Téléphone is mandatory. Does REMI check its format? Default: no, digits and a leading + only.

### Questions for Jamie

1. Auth adapter: Neon Auth (D-28), or the scrypt and HMAC module extended to patients? Default: Neon Auth.
2. One identity store for operators and patients, or two? Default: one seam, two principal kinds, operators migrated later.
3. Sign-up route on `apps/web`: `[locale]/inscription/[token]`? Default: yes.

## Build order

1. auth-seam — the auth seam, its adapter and the `patient_accounts` table — depends-on: none
2. signup-page — the sign-up page from the practitioner's link, mandatory fields, mobile — depends-on: auth-seam
3. sign-in-and-session — sign-in, session, sign-out, password reset, the same account after activation — depends-on: auth-seam
4. duplicate-email-guard — an e-mail already registered with this practitioner is sent to sign-in — depends-on: signup-page

## Criteria → stubs

| #   | Morgane's criterion (short, her French kept)                                                                 | Stub                                                  |
| --- | ------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------- |
| 1   | « Nom, prénom, date de naissance, adresse e-mail et telephone sont obligatoires »                            | signup-page                                           |
| 2   | « L'adresse e-mail doit être valide »                                                                        | signup-page                                           |
| 3   | « Le compte ne peut pas être créé tant que les consentements obligatoires ne sont pas cochés »               | consent-and-data/consent-gate-at-signup               |
| 4   | « Le statut du dossier est “Prêt pour consultation” après la création du compte »                            | patient-list-and-status/file-status-enum (question 1) |
| 5   | « Le patient n'a accès à aucune recette tant que l'accompagnement n'est pas activé (message d'attente) »     | patient-access (story 22)                             |
| 6   | « adresse e-mail déjà inscrite chez ce praticien … invité à se connecter au lieu de créer un doublon »       | duplicate-email-guard                                 |
| 7   | « Le praticien peut créer un profil patient et renseigner l'ensemble des informations du questionnaire »     | patient-file-creation/practitioner-creates-file       |
| 8   | « Le profil créé par le praticien apparaît directement dans sa liste de patients, sans création de doublon » | patient-list-and-status/list-appearance-rule          |
| 9   | « Le compte créé à l'inscription reste le compte utilisé après activation »                                  | sign-in-and-session                                   |
| 10  | « Le parcours d'inscription est utilisable sur mobile »                                                      | signup-page                                           |

## Out of scope

- The consent screen and its texts (`consent-and-data`).
- The questionnaire itself (`preparatory-questionnaire`).
- The practitioner's permanent link and the console-side file creation (`patient-file-creation`).
- The waiting screen and the activated space (`patient-access`, story 22).
- Removing the token link `p/[token]`. It stays until the patient space (stories 22 to 31) replaces it.
