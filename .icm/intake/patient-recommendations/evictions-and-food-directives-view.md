# Stub: The patient sees what to favour, what to limit, and every eviction with its period

- feature-slug: evictions-and-food-directives-view
- epic: patient-recommendations
- story: 23
- sequence: 2 of 2
- depends-on: recommendations-page
- complexity: low
- priority: P0

## Problem

Evictions are the recommendations a patient must never miss. They must stand out, with their period.

## Proposed change

Category 3 « Recommandations alimentaires » on the page: three lists from the validated version, in this order: « Évictions totales », « À favoriser », « À limiter ». Each eviction shows its period (« jusqu'au <date> ») or « exclusion durable ». Evictions render first and with a distinct style. The same block is reused as the summary on the Profil tab (cross-epic: `patient-home-navigation/profile-tab`).

## Acceptance criteria

- [ ] « Évictions totales », « À favoriser » and « À limiter » appear as three lists, in that order.
- [ ] Each eviction shows its end date or « exclusion durable ».
- [ ] An ended eviction is not shown (breakdown question 2).
- [ ] The block reads the validated version only.
- [ ] The block renders on the Profil tab summary without a second data read.

## Out of scope

- The practitioner's input of directives: `food-directives`.
- The eviction expiry rules: `eviction-safety`.

## Notes

D-30. Files: `apps/web/app/[locale]/(app)/profil/recommandations/`, a shared component under `apps/web/components/`. Cross-epic: `food-directives`, `eviction-safety`, `patient-home-navigation/profile-tab`.
