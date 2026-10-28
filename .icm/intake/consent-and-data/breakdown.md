# Breakdown: consent-and-data — the patient consents before anything is held, and every access is scoped

- epic-slug: consent-and-data
- source: story 3 « Consentement et données personnelles », Morgane Paquet, 12 October 2026, https://drive.google.com/file/d/1Y0NJRzU7IH2fPddszOqZgk1cYFjPJLIp/view, and the pilot privacy policy (Drive, `01_Politique_de_confidentialite_REMI_AI_Pilote.docx`, sections 4 and 7), Jamie's decision of 2026-10-23
- story: 3

## What I understood

Before the account exists the patient reads how their data is processed and gives the
consents. Each consent is stored with its date and the version of the text. The genetic
consent is asked only when a genotype is entered. No optional data (génotype, médicaments,
compléments, poids souhaité) is collected without its consent. A refusal is stored and
activates nothing. A practitioner sees only their own patients. REMI-team access is limited
and logged. On `main` consent is two nullable columns on `patient_profiles` (`consent_date`,
`consent_channel`) that Morgane fills by hand, and no text or version exists. The pilot
privacy policy sits in Drive (`01_Politique_de_confidentialite_REMI_AI_Pilote.docx`). This
epic rests on D-26, D-30 and D-32. The audit trail (`audit_events`) already exists and carries
every write here. The privacy policy promises two things no story asks for: an option to
withdraw a consent from the patient's space (section 4) and the deletion of an account inactive
for twelve months, after a notice (section 7). Jamie decided on 2026-10-23 to build both. Stubs 5
and 6 carry them. The policy text promises them from its pilot version. The consent gate
binds every path that creates an account: the sign-up page and the two takeover paths of
`patient-file-creation/patient-takes-over-file`. Story 1 lets the practitioner enter the
génotype. Question 5 of `patient-file-creation` settles whether that waits for the patient's
genetic consent. Default: it waits.

### Questions for Morgane

1. Is the pilot privacy policy in Drive the text, version 1, that the patient accepts? Default: yes.
2. Which consents are mandatory and which are optional? Default: mandatory: the processing for the care. Optional: the genetic data.
3. Is the genetic consent a separate short text, or a paragraph of the same policy? Default: a separate short text.
4. Who in the REMI team may open a patient's file, and for what? Default: you and Jamie, for a technical or administrative need, every access logged.
5. What happens when a patient withdraws the mandatory `care` consent? Default: generation and suggestions stop at once, your file shows « Consentement retiré », the space stays readable, and deletion stays a request by e-mail.
6. Which legal retention rules may block the deletion of an inactive account? Default: none during the pilot. An admin can set a hold on one file.

### Questions for Jamie

1. Consent text bodies: rows in the database, or versioned markdown files in the repo with the hash stored on the consent row? Default: markdown in the repo.
2. Inactivity counts from the last sign-in, the last patient write, or the later of the two? Default: the later of the two.

## Build order

1. consent-texts-and-records — versioned texts and the `patient_consents` table — depends-on: none
2. consent-gate-at-signup — the information screen and the mandatory boxes before the account — depends-on: consent-texts-and-records
3. genetic-consent-and-optional-data — the conditional genetic consent, no optional data without consent, refusal handling — depends-on: consent-texts-and-records
4. data-access-scoping — every read and write scoped to the care relationship, REMI-team access logged — depends-on: none
5. consent-withdrawal-in-app — « Mes consentements » in the account settings, a withdrawal control per consent, the consequence applied at once — depends-on: consent-texts-and-records
6. inactive-account-deletion — a daily route: a notice at eleven months, the deletion at twelve, a hold that blocks it — depends-on: none

## Criteria → stubs

| #   | Morgane's criterion (short, her French kept)                                                                                | Stub                              |
| --- | --------------------------------------------------------------------------------------------------------------------------- | --------------------------------- |
| 1   | « Les consentements requis sont enregistrés avec date et version du texte »                                                 | consent-texts-and-records         |
| 2   | « Le compte ne peut pas être créé tant que les consentements obligatoires ne sont pas cochés »                              | consent-gate-at-signup, patient-file-creation/patient-takes-over-file |
| 3   | « Le patient peut relire les informations sur le traitement de ses données avant de consentir »                             | consent-gate-at-signup            |
| 4   | « Aucune donnée facultative n'est collectée sans consentement applicable »                                                  | genetic-consent-and-optional-data |
| 5   | « Un refus est enregistré et ne déclenche aucune activation automatique »                                                   | genetic-consent-and-optional-data |
| 6   | « L'accès aux données est limité au praticien autorisé ; le praticien ne voit que ses propres patients »                    | data-access-scoping               |
| 7   | « Tout accès de l'équipe REMI aux données personnelles des patients doit être sécurisé, limité et traçable »                | data-access-scoping               |
| 8   | « Le génotype n'est collecté et affiché que si le consentement correspondant a été donné »                                  | genetic-consent-and-optional-data |
| 9   | politique de confidentialité § 4 : « option de retrait dans votre espace personnel »                                        | consent-withdrawal-in-app         |
| 10  | politique de confidentialité § 7 : « supprimer les données d'un compte inactif après 12 mois, précédée d'une notification » | inactive-account-deletion         |

## Out of scope

- Writing the legal texts. Morgane and her counsel own them. This epic stores and shows them.
- A data-subject export, and a deletion the patient triggers from the app. `RETENTION.md` describes deletion today.
- Processor agreements (DPAs). Owner work, outside the repo.
