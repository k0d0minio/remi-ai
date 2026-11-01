# Breakdown: care-activation — the practitioner opens the patient's space

- epic-slug: care-activation
- source: story 19 « Validation et activation de l'accompagnement », Morgane Paquet, 15 October 2026, https://drive.google.com/file/d/1pKnc2yd8HoimUsBVDXv2MzMtYnkbOER7/view
- story: 19

## What I understood

After the first consultation the practitioner validates the recommendations and presses « Activer l'accompagnement » on the patient file. Before the click, a recap shows the validated values, each eviction with its period, and the unrecognised elements that stay unapplied. An inconsistency or an eviction without a period or a durable status blocks the activation. Unrecognised elements do not block it. On confirmation the file status becomes « Accompagnement actif » (D-31), the patient space unlocks, and one e-mail « Votre espace REMI est prêt » goes out through the email seam. On `main` nothing like this exists: the patient link opens on creation and there is no status enum. The epic rests on D-26 (accounts), D-31 (one status enum), D-32 (audit events) and on `protocol-versions`, which owns the validated version the recap reads.

### Questions for Morgane

1. What counts as an « incohérence » that blocks the activation? Default: the same element in « À favoriser » and « Éviction totale », and a calculation marked « à revalider ».
2. May you activate a file whose optional questionnaire fields are empty? Default: yes.
3. Can an activation be undone or suspended? Default: no, not in the MVP.
4. Does a later validation (story 20) send a new e-mail? Default: no, the e-mail goes out once, at the first activation.

### Questions for Jamie

1. Which sender address for the activation e-mail? Default: the address `patientLinkEmail` uses today, on the verified Resend domain.

Jamie answered on 2026-11-01: the sender shows « REMI », from no-reply@mail.jamienisbet.com until remiai.be is verified in Resend.
2. Is the first validation the same action as the activation? Default: yes, « Activer l'accompagnement » validates version 1 and activates in one step.

## Build order

1. activation-recap — the recap read model and the blocking rules — depends-on: none
2. activation-action — the button, the confirmation, the status flip, the audit event — depends-on: activation-recap
3. activation-email — « Votre espace REMI est prêt », sent once, resend on failure — depends-on: activation-action

## Criteria → stubs

| #   | Morgane's criterion (short, her French kept)                                                                                                      | Stub                                        |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------- |
| 1   | « L'activation est déclenchée uniquement par le praticien, après confirmation du récapitulatif »                                                  | activation-action                           |
| 2   | « Les incohérences et les évictions non résolues bloquent la validation ; une éviction sans période ni statut durable bloque l'activation »       | activation-recap                            |
| 3   | « Les éléments non reconnus ne bloquent pas l'activation, mais sont listés dans le récapitulatif et restent non appliqués »                       | activation-recap                            |
| 4   | « Le statut du dossier devient “Accompagnement actif” après activation »                                                                          | activation-action                           |
| 5   | « L'e-mail est envoyé une seule fois, au moment de l'activation réussie »                                                                         | activation-email                            |
| 6   | « Si l'envoi de l'e-mail échoue, le praticien est averti et peut renvoyer l'e-mail »                                                              | activation-email                            |
| 7   | « Avant activation, aucune fonctionnalité de l'espace patient n'est accessible, à l'exception de l'inscription et du questionnaire préparatoire » | patient-access/waiting-screen               |
| 8   | « Seules les recommandations validées sont utilisées pour générer les recettes et les suggestions d'amélioration »                                | protocol-versions/working-copy-and-validate |
| 9   | « Le patient retrouve son compte initial »                                                                                                        | patient-access/active-space-entry           |

## Out of scope

- The e-mail's wording and the add-to-home-screen instructions: `patient-access/activation-email-content`.
- The validated version itself and its history: `protocol-versions`.
- A second e-mail on later validations (question 4).
