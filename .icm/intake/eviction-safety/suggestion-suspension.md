# Stub: Past an eviction's end date with no decision, every suggestion for the patient stops

- feature-slug: suggestion-suspension
- epic: eviction-safety
- story: 14
- sequence: 3 of 3
- depends-on: eviction-expiry-review
- complexity: medium
- priority: P0

## Problem

If the practitioner does not answer by the end date, REMI must not guess. It must stop suggesting food to that patient until the practitioner decides.

## Proposed change

A daily job (Vercel cron on the product app) finds evictions past `exclusion_until` with no decision and sets `suggestions_suspended_at` on the patient. While set: recipe-space, meal-improvement and restaurant-menu generate nothing and show the patient « Votre praticien met à jour vos recommandations ». The console shows « Suggestions suspendues » on the file and the list. Any answer in eviction-expiry-review clears the flag. The clear and the set write audit events. The job is idempotent and runs on production only.

## Acceptance criteria

- [ ] At the end date with no decision, the patient's suggestions are suspended.
- [ ] While suspended, no recipe, meal suggestion or dish is generated or shown for the patient.
- [ ] The patient sees « Votre praticien met à jour vos recommandations ».
- [ ] The console shows « Suggestions suspendues » on the file and in the list.
- [ ] A decision on the eviction lifts the suspension at once.
- [ ] The set and the clear write audit events (D-32).

## Out of scope

- Any suspension for another reason. This flag has one cause.
- Notification to the practitioner.

## Notes

- D-25: the job runs against the one database, from production only. Previews never run it.
- Files: `apps/web/app/api/cron/evictions/route.ts`, `vercel.json` of the product app, `patient_profiles` (one nullable column, one migration), the three generation entry points, the console signals.
- cross-epic: recipe-space, meal-improvement, restaurant-menu (check the flag first), patient-list-and-status (the signal).
