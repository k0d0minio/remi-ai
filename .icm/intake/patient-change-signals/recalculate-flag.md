# Stub: A calculation that rests on a changed value reads « estimation à revalider »

- feature-slug: recalculate-flag
- epic: patient-change-signals
- story: 21
- sequence: 3 of 4
- depends-on: patient-change-table
- complexity: low
- priority: P0

## Problem

After the patient changes weight, height or activity, the validated calculations no longer match the data. Nothing says so.

## Proposed change

Each calculation (BMI, protein needs, energy needs) exposes a stale flag: true when an unacknowledged change touches one of its inputs. The console shows « estimation à revalider » on a stale value. The recap of `care-activation` and the validation of `protocol-versions` treat a stale validated value as a blocker until the practitioner recalculates and validates.

## Acceptance criteria

- [ ] A change to weight or height marks BMI, protein needs and energy needs « estimation à revalider ».
- [ ] A change to the activity level marks energy needs « estimation à revalider ».
- [ ] The flag clears when the practitioner recalculates and validates.
- [ ] The flag does not change the stored validated value.

## Out of scope

- The calculations themselves: `bmi`, `protein-needs`, `energy-needs`.

## Notes

D-30. Cross-epic: `bmi`, `protein-needs`, `energy-needs` (each exposes its inputs), `care-activation/activation-recap`.
