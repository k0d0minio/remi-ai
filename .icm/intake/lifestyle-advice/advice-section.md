# Stub: The practitioner writes lifestyle advices in six categories on the file

- feature-slug: advice-section
- epic: lifestyle-advice
- story: 17
- sequence: 2 of 2
- depends-on: advice-table
- complexity: medium
- priority: P0

## Problem

The practitioner has no place on the file for advice outside food. The section must be fast: several advices at once, optional details folded, one save per section.

## Proposed change

On the console patient page, a section « Hygiène de vie » with the six categories in Morgane's order and her labels. Each category lists its advices and offers « + Ajouter un conseil ». The text is mandatory. Frequency, moment and duration sit under a fold. Several advices can be added before one save. Each advice has « Modifier », « Désactiver » and « Supprimer ». Deactivated advices show under « Historique ». No category is mandatory, and an empty category shows nothing.

## Acceptance criteria

- [ ] The section shows the six categories with Morgane's labels, in her order.
- [ ] Several advices can be added in one category before one save.
- [ ] A save with an advice without text is refused and names the empty line.
- [ ] « Modifier », « Désactiver » and « Supprimer » work on each advice.
- [ ] A deactivated advice appears under « Historique » and not in the active list.
- [ ] The section works with no advice in any category.

## Out of scope

- The patient view.
- Templates of advices.

## Notes

- D-27: the console, practitioner role. Follows the section-save pattern on main.
- Files: the console patient page, `section-save.ts`, `patient-lifestyle-advices/`.
