# Handoff rem-114

## Cause

`addGoalCheckIn` et `updateGoalCheckIn` contrôlaient l'accès par l'objectif ou le suivi seul, et non par le patient de la page : un objectif d'un autre patient passait le contrôle.

## Correction

- Les deux services prennent maintenant l'identifiant du patient (`byPatient`, écriture).
- `goalOfPatient` vérifie que l'objectif appartient à ce patient. Sinon le service répond `not_found`, « no such goal for this patient ».
- Un objectif d'un autre patient et un objectif absent donnent la même réponse.
- `addCheckInAction`, `updateCheckInAction` et `recordConsultation` passent le patient. L'action écrit l'audit seulement après un succès du service.
- Deux tests de service : un ajout et une modification sur l'objectif d'un autre patient. Le résultat est refusé, rien n'est écrit, le journal d'audit ne change pas.

## Next action

L'opérateur teste la preview admin, puis coche Ready to merge.

## How to test

Sur la preview admin, ouvrez un dossier patient avec un objectif. Ajoutez un suivi, puis modifiez-le : les deux enregistrements marchent comme avant. Le refus d'un objectif d'un autre patient se voit seulement avec un formulaire falsifié : les tests de service de la CI le prouvent.

## Blockers

- none

## Do not touch

- none
