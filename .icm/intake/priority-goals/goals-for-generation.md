# Stub: REMI reads the validated, active goals in order, the first as the principal one

- feature-slug: goals-for-generation
- epic: priority-goals
- story: 16
- sequence: 2 of 2
- depends-on: goals-section
- complexity: low
- priority: P0

## Problem

A generator that reads every goal, validated or not, applies a draft. One that reads them
unordered cannot prefer the principal goal when two cannot be reconciled (D-30).

## Proposed change

Add `goalsForGeneration(patientId)` in the goals service: the goals with no `archived_at`
whose protocol version is validated, in `position` order. The first is `principal`, the
others `secondary`. The result is the « objectifs » block of the context every prompt
opens with. The function applies no goal above a restriction: the priority order of D-30
places goals at ranks 5 and 6, after every restriction and every validated parameter.

## Acceptance criteria

- [ ] A deactivated goal is absent from the result.
- [ ] A goal in a protocol version not yet validated is absent from the result.
- [ ] The result is in `position` order. The first entry is marked `principal`.
- [ ] The context block names the goals as the practitioner wrote them, unchanged.
- [ ] A test proves a goal never removes or adds a food against a total eviction.

## Out of scope

- The prompts themselves (`recipe-space`, `meal-improvement`).

## Notes

- Decisions kept: D-16 (prompts carry pseudonymised context), D-30.
- Files: the goals service and tests.
- cross-epic: `protocol-versions` (the validated state), `recipe-space` and
  `meal-improvement` (the readers).
