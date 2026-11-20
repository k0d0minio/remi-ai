# The markdown backlog in Linear

Language: en
Date: 2026-11-19

On 2026-11-19 each open stub of `.icm/intake/` got one ticket of the Linear team `REM`. A stub is not a
ticket (`.icm/local/ROUTES.md`): this file is the record of which ticket came from which stub. Each ticket
has the path of its stub in its last line. Each epic has one parent ticket, and each ticket is in one
Linear project of the team, a burst. The bursts can run at the same time, within the limits below.

## Limits of work in parallel

- A ticket with `M` in the column Migration changes the database schema. Merge these tickets one at a
  time: two branches that each add a migration collide in the migration journal.
- Bursts 04 to 09 each change a section of the patient file page of `apps/admin`. Expect conflicts there.
- Bursts 10, 11 and 12 read the validated protocol that burst 09 makes. Burst 12 uses the AI adapter of
  burst 11 (`recipe-space/ai-gateway-adapter`). Linear has no relation for these two rules.
- The column Blocked by has the `blocks` relations of Linear. They come from the `depends-on` line of the stubs.
- Bursts 01 to 04 depend on no other burst.

## Burst 01 – Mise en production et plateforme

| Ticket  | Stub or epic                                            | Estimate | Migration | Blocked by |
| ------- | ------------------------------------------------------- | -------- | --------- | ---------- |
| REM-7   | made in Linear by the client or by Jamie                | 3        |           |            |
| REM-113 | `triage/blob-store-is-public.md`                        | 2        |           |            |
| REM-118 | `triage/_done/db-migrate-connection-retry.md`           | 2        |           |            |
| REM-119 | `triage/decisions-page-six-apps.md`                     | 2        |           |            |
| REM-126 | `triage/lint-zero-warnings.md`                          | 2        |           |            |
| REM-128 | `triage/marketing-canonical-www.md`                     | 2        |           |            |
| REM-129 | `triage/neon-auth-trusted-domains-remiai-be.md`         | 2        |           |            |
| REM-130 | `triage/new-run-silent-hook-failure.md`                 | 2        |           |            |
| REM-135 | `triage/preview-links-point-at-production.md`           | 3        |           |            |
| REM-137 | `triage/processor-agreements.md`                        | 2        |           |            |
| REM-138 | `triage/promote-current-production-read.md`             | 2        |           |            |
| REM-143 | `triage/regenerated-migration-breaks-preview-branch.md` | 2        |           |            |
| REM-146 | `triage/resend-sender-on-remiai-be.md`                  | 2        |           |            |
| REM-148 | `triage/stubs-cite-superseded-d-25.md`                  | 2        |           |            |
| REM-149 | `triage/table-story-33-criteria.md`                     | 2        |           |            |
| REM-150 | `triage/uat-postgres-major-differs.md`                  | 2        |           |            |
| REM-151 | `triage/vercel-origin-variables-remiai-be.md`           | 2        |           |            |
| REM-152 | `triage/vercel-project-skipping.md`                     | 2        |           |            |
| REM-153 | `triage/web-build-does-not-call-vercel-build.md`        | 3        |           |            |
| REM-154 | made in Linear by the client or by Jamie                | 3        |           |            |

## Burst 02 – Consentement et données personnelles

| Ticket  | Stub or epic                                       | Estimate | Migration | Blocked by |
| ------- | -------------------------------------------------- | -------- | --------- | ---------- |
| REM-16  | epic `consent-and-data/` (parent)                  |          |           |            |
| REM-43  | `consent-and-data/consent-withdrawal-in-app.md`    | 3        |           |            |
| REM-121 | `triage/drop-the-hand-recorded-consent-columns.md` | 2        | M         |            |
| REM-122 | `triage/end-of-pilot-account-deletion.md`          | 3        | M         |            |
| REM-124 | `triage/genetic-consent-v2.md`                     | 2        |           |            |
| REM-131 | `triage/one-practitioner-per-patient-email.md`     | 3        | M         |            |
| REM-133 | `triage/patient-delete-leaves-auth-user.md`        | 3        |           |            |
| REM-134 | `triage/patient-email-change.md`                   | 3        |           |            |
| REM-136 | `triage/privacy-page-contradicts-the-app.md`       | 3        |           |            |
| REM-142 | `triage/reconsent-on-new-consent-version.md`       | 3        |           |            |
| REM-147 | `triage/retention-questionnaire-rows-stale.md`     | 2        |           |            |

## Burst 03 – Inscription patient et identité visuelle

| Ticket  | Stub or epic                               | Estimate | Migration | Blocked by |
| ------- | ------------------------------------------ | -------- | --------- | ---------- |
| REM-6   | made in Linear by the client or by Jamie   | 2        |           |            |
| REM-8   | made in Linear by the client or by Jamie   | 2        |           |            |
| REM-9   | made in Linear by the client or by Jamie   | 3        |           |            |
| REM-10  | made in Linear by the client or by Jamie   | 1        |           |            |
| REM-11  | made in Linear by the client or by Jamie   | 2        |           |            |
| REM-12  | made in Linear by the client or by Jamie   | 2        |           |            |
| REM-127 | `triage/logo-mark-in-every-app.md`         | 2        |           |            |
| REM-140 | `triage/radio-option-card-in-ui.md`        | 2        |           |            |
| REM-145 | `triage/remove-prototype-patient-pages.md` | 2        |           |            |

## Burst 04 – Console praticien : correctifs

| Ticket  | Stub or epic                                             | Estimate | Migration | Blocked by |
| ------- | -------------------------------------------------------- | -------- | --------- | ---------- |
| REM-111 | `triage/admin-read-only-file-controls.md`                | 3        |           |            |
| REM-112 | `triage/at-a-glance-prep-note-polish.md`                 | 2        |           |            |
| REM-114 | `triage/check-in-goal-not-scoped-to-patient.md`          | 2        |           |            |
| REM-115 | `triage/console-save-overwrites-patient-profile-edit.md` | 2        |           |            |
| REM-116 | `triage/console-shows-no-meal-intent.md`                 | 2        |           |            |
| REM-117 | `triage/consultation-draft-clear-on-sign-out.md`         | 2        |           |            |
| REM-120 | `triage/document-attachment-encoding.md`                 | 2        |           |            |
| REM-123 | `triage/files-registry-per-entrypoint.md`                | 3        |           |            |
| REM-125 | `triage/label-map-lookups-assume-valid-enums.md`         | 2        |           |            |
| REM-132 | `triage/orphan-patient-profile-edit-attempt.md`          | 2        | M         |            |
| REM-139 | `triage/protocol-template-name-unique-index.md`          | 2        | M         |            |
| REM-144 | `triage/remove-console-challenges.md`                    | 3        |           |            |

## Burst 05 – Dossier patient et signaux de modification

| Ticket | Stub or epic                                              | Estimate | Migration | Blocked by |
| ------ | --------------------------------------------------------- | -------- | --------- | ---------- |
| REM-17 | epic `preparatory-questionnaire/` (parent)                |          |           |            |
| REM-18 | epic `patient-list-and-status/` (parent)                  |          |           |            |
| REM-19 | epic `patient-file-view/` (parent)                        |          |           |            |
| REM-32 | epic `patient-change-signals/` (parent)                   |          |           |            |
| REM-44 | `preparatory-questionnaire/practitioner-free-question.md` | 2        | M         |            |
| REM-45 | `patient-list-and-status/list-indicators.md`              | 2        |           |            |
| REM-46 | `patient-file-view/safety-highlights.md`                  | 2        |           |            |
| REM-47 | `patient-file-view/provenance-markers.md`                 | 3        | M         |            |
| REM-48 | `patient-file-view/post-validation-change-markers.md`     | 2        |           | REM-47     |
| REM-78 | `patient-change-signals/change-signals-in-console.md`     | 3        |           |            |
| REM-80 | `patient-change-signals/immediate-safety-fields.md`       | 3        |           |            |

## Burst 06 – Calculs : protéines, énergie, génotype

| Ticket  | Stub or epic                                        | Estimate | Migration | Blocked by |
| ------- | --------------------------------------------------- | -------- | --------- | ---------- |
| REM-20  | epic `protein-needs/` (parent)                      |          |           |            |
| REM-21  | epic `energy-needs/` (parent)                       |          |           |            |
| REM-42  | epic `genotype-macro-split/` (parent)               |          |           |            |
| REM-49  | `protein-needs/protein-estimate.md`                 | 3        |           |            |
| REM-50  | `protein-needs/protein-target-validation.md`        | 3        |           | REM-49     |
| REM-51  | `energy-needs/energy-estimate.md`                   | 3        | M         |            |
| REM-52  | `energy-needs/calorie-target-validation.md`         | 3        |           | REM-51     |
| REM-79  | `patient-change-signals/recalculate-flag.md`        | 2        |           |            |
| REM-108 | `genotype-macro-split/genotype-reference-table.md`  | 3        | M         |            |
| REM-109 | `genotype-macro-split/macro-split-proposal.md`      | 3        |           | REM-108    |
| REM-110 | `genotype-macro-split/macro-split-in-generation.md` | 2        |           | REM-109    |

## Burst 07 – Aliments, évictions et base de termes

| Ticket  | Stub or epic                                    | Estimate | Migration | Blocked by |
| ------- | ----------------------------------------------- | -------- | --------- | ---------- |
| REM-22  | epic `food-directives/` (parent)                |          |           |            |
| REM-23  | epic `eviction-safety/` (parent)                |          |           |            |
| REM-24  | epic `knowledge-base-requests/` (parent)        |          |           |            |
| REM-53  | `food-directives/term-base.md`                  | 5        | M         |            |
| REM-54  | `food-directives/directive-fields.md`           | 3        | M         | REM-53     |
| REM-55  | `food-directives/directive-resolution.md`       | 3        |           | REM-54     |
| REM-56  | `food-directives/directive-application.md`      | 3        |           | REM-55     |
| REM-57  | `eviction-safety/compatibility-gate.md`         | 5        |           |            |
| REM-58  | `eviction-safety/eviction-expiry-review.md`     | 3        |           | REM-57     |
| REM-59  | `eviction-safety/suggestion-suspension.md`      | 3        | M         | REM-58     |
| REM-60  | `knowledge-base-requests/request-record.md`     | 3        | M         |            |
| REM-61  | `knowledge-base-requests/admin-review.md`       | 3        |           | REM-60     |
| REM-141 | `triage/rank-by-component-ignores-direction.md` | 2        |           |            |

## Burst 08 – Protocole : objectifs, hygiène de vie, compléments, repas

| Ticket | Stub or epic                                      | Estimate | Migration | Blocked by |
| ------ | ------------------------------------------------- | -------- | --------- | ---------- |
| REM-25 | epic `priority-goals/` (parent)                   |          |           |            |
| REM-26 | epic `lifestyle-advice/` (parent)                 |          |           |            |
| REM-27 | epic `supplement-interventions/` (parent)         |          |           |            |
| REM-28 | epic `meal-structure/` (parent)                   |          |           |            |
| REM-29 | epic `intermittent-fasting/` (parent)             |          |           |            |
| REM-62 | `priority-goals/goals-section.md`                 | 2        |           |            |
| REM-63 | `priority-goals/goals-for-generation.md`          | 2        |           | REM-62     |
| REM-64 | `lifestyle-advice/advice-table.md`                | 3        | M         |            |
| REM-65 | `lifestyle-advice/advice-section.md`              | 3        |           | REM-64     |
| REM-66 | `supplement-interventions/intervention-fields.md` | 3        | M         |            |
| REM-67 | `supplement-interventions/intervention-form.md`   | 3        |           | REM-66     |
| REM-68 | `meal-structure/meal-configuration.md`            | 3        | M         |            |
| REM-69 | `meal-structure/meal-orientation-rules.md`        | 3        |           | REM-68     |
| REM-70 | `intermittent-fasting/fasting-option.md`          | 2        | M         |            |
| REM-71 | `intermittent-fasting/fasting-in-generation.md`   | 3        |           | REM-70     |

## Burst 09 – Validation et activation de l'accompagnement

| Ticket | Stub or epic                                     | Estimate | Migration | Blocked by |
| ------ | ------------------------------------------------ | -------- | --------- | ---------- |
| REM-30 | epic `care-activation/` (parent)                 |          |           |            |
| REM-31 | epic `protocol-versions/` (parent)               |          |           |            |
| REM-72 | `care-activation/activation-recap.md`            | 3        |           |            |
| REM-73 | `care-activation/activation-action.md`           | 3        |           | REM-72     |
| REM-74 | `care-activation/activation-email.md`            | 3        | M         | REM-73     |
| REM-75 | `protocol-versions/protocol-version-table.md`    | 3        | M         |            |
| REM-76 | `protocol-versions/working-copy-and-validate.md` | 5        |           | REM-75     |
| REM-77 | `protocol-versions/protocol-history-view.md`     | 2        |           | REM-75     |

## Burst 10 – Espace patient : accès, accueil, recommandations

| Ticket | Stub or epic                                                    | Estimate | Migration | Blocked by |
| ------ | --------------------------------------------------------------- | -------- | --------- | ---------- |
| REM-33 | epic `patient-access/` (parent)                                 |          |           |            |
| REM-34 | epic `patient-home-navigation/` (parent)                        |          |           |            |
| REM-35 | epic `patient-recommendations/` (parent)                        |          |           |            |
| REM-81 | `patient-access/waiting-screen.md`                              | 3        |           |            |
| REM-82 | `patient-access/activation-email-content.md`                    | 3        |           |            |
| REM-83 | `patient-access/active-space-entry.md`                          | 2        |           | REM-81     |
| REM-84 | `patient-home-navigation/home-meal-block.md`                    | 3        |           |            |
| REM-85 | `patient-home-navigation/profile-tab.md`                        | 3        |           |            |
| REM-86 | `patient-home-navigation/retire-token-link.md`                  | 3        |           | REM-85     |
| REM-87 | `patient-recommendations/recommendations-page.md`               | 3        |           |            |
| REM-88 | `patient-recommendations/evictions-and-food-directives-view.md` | 2        |           | REM-87     |

## Burst 11 – Recettes et liste de courses

| Ticket  | Stub or epic                                      | Estimate | Migration | Blocked by |
| ------- | ------------------------------------------------- | -------- | --------- | ---------- |
| REM-36  | epic `recipe-space/` (parent)                     |          |           |            |
| REM-37  | epic `recipe-card/` (parent)                      |          |           |            |
| REM-38  | epic `shopping-list/` (parent)                    |          |           |            |
| REM-40  | epic `practitioner-daily-recipes/` (parent)       |          |           |            |
| REM-89  | `recipe-space/ai-gateway-adapter.md`              | 5        | M         |            |
| REM-90  | `recipe-space/recipe-structure.md`                | 3        | M         | REM-89     |
| REM-91  | `recipe-space/weekly-plan-generation.md`          | 5        |           | REM-90     |
| REM-92  | `recipe-space/patient-recipes-today.md`           | 3        |           | REM-91     |
| REM-93  | `recipe-space/recipe-justification.md`            | 2        |           | REM-91     |
| REM-94  | `recipe-card/recipe-card-view.md`                 | 3        |           |            |
| REM-95  | `recipe-card/favourites.md`                       | 3        | M         | REM-94     |
| REM-96  | `recipe-card/portion-scaling.md`                  | 2        | M         | REM-94     |
| REM-97  | `recipe-card/recipe-sharing.md`                   | 3        | M         | REM-95     |
| REM-98  | `shopping-list/shopping-list-build.md`            | 3        | M         |            |
| REM-99  | `shopping-list/shopping-list-screen.md`           | 2        |           | REM-98     |
| REM-100 | `shopping-list/shopping-list-email.md`            | 2        |           | REM-99     |
| REM-104 | `practitioner-daily-recipes/daily-recipes-tab.md` | 2        |           |            |
| REM-105 | `practitioner-daily-recipes/daily-recipe-read.md` | 2        |           | REM-104    |

## Burst 12 – Suggestion d'amélioration et restaurant

| Ticket  | Stub or epic                              | Estimate | Migration | Blocked by |
| ------- | ----------------------------------------- | -------- | --------- | ---------- |
| REM-39  | epic `meal-improvement/` (parent)         |          |           |            |
| REM-41  | epic `restaurant-menu/` (parent)          |          |           |            |
| REM-101 | `meal-improvement/meal-capture.md`        | 3        | M         |            |
| REM-102 | `meal-improvement/meal-suggestion.md`     | 5        |           | REM-101    |
| REM-103 | `meal-improvement/suggestion-feedback.md` | 2        |           | REM-102    |
| REM-106 | `restaurant-menu/menu-photo-reading.md`   | 3        |           |            |
| REM-107 | `restaurant-menu/menu-suggestions.md`     | 3        |           | REM-106    |
