# Breakdown: patient-access — the patient waits, then enters with the account they already have

- epic-slug: patient-access
- source: story 22 « Accès du patient à son espace activé », Morgane Paquet, 15 October 2026, https://drive.google.com/file/d/1EokDy5IDwT2q07P35ew-OFY0C40wxkGp/view
- story: 22

## What I understood

Before activation a signed-in patient sees one message, « Votre praticien prépare votre accompagnement », and every feature stays locked except the questionnaire. After activation the patient receives « Votre espace REMI est prêt » with a sign-in link and simple instructions to add REMI to the phone's home screen, on iPhone and on Android. The patient signs in with the account created at sign-up. A patient who never received the e-mail signs in all the same and finds the active space. Unvalidated recommendations are never shown. On `main` the patient opens a token link with no account and no waiting state. Rests on D-26 (accounts, owned by `patient-signup-account`), D-31 (status), and `care-activation` (the status flip and the send).

### Questions for Morgane

1. Before activation, may the patient still edit the questionnaire? Default: yes, until you validate.
2. Does the waiting screen show anything else, such as your name or the appointment date? Default: your name, and the appointment date when it is known.
3. Should the e-mail come from « REMI » or from your name? Default: « REMI ».

### Questions for Jamie

1. Add a web app manifest and icons to `apps/web` so the home-screen shortcut opens full screen? Default: yes.

## Build order

1. waiting-screen — the pre-activation state of the patient space — depends-on: none
2. activation-email-content — the e-mail template with the add-to-home-screen steps — depends-on: none
3. active-space-entry — sign-in lands on the active space, with or without the e-mail — depends-on: waiting-screen

## Criteria → stubs

| #   | Morgane's criterion (short, her French kept)                                                                                                      | Stub                     |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------ |
| 1   | « Avant activation, aucune fonctionnalité n'est accessible au patient »                                                                           | waiting-screen           |
| 2   | « L'e-mail d'activation explique comment ajouter REMI à l'écran d'accueil du smartphone … sans téléchargement depuis l'App Store ou Google Play » | activation-email-content |
| 3   | « Le même compte (mêmes identifiants) donne accès à l'espace activé »                                                                             | active-space-entry       |
| 4   | « Un patient qui n'a pas reçu l'e-mail peut se connecter et voir son accompagnement actif »                                                       | active-space-entry       |
| 5   | « Le patient ne voit jamais les recommandations non validées »                                                                                    | rule: README (D-30)      |

## Out of scope

- The account, sign-up and sign-in: `patient-signup-account`.
- The send and its retry: `care-activation/activation-email`.
- The home after entry: `patient-home-navigation`.
