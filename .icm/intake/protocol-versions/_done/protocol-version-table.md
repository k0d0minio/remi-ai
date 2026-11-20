# Stub: A validated protocol is kept as a dated, immutable version

- feature-slug: protocol-version-table
- epic: protocol-versions
- story: 20
- sequence: 1 of 3
- depends-on: none
- complexity: medium
- priority: P0

## Problem

The protocol tables write live. Nothing records what the practitioner validated, and when. A disabled element disappears from the current view with no trace of the version it belonged to.

## Proposed change

A table `protocol_versions`: patient, version number, validated at, validated by, and one snapshot of the protocol content. The snapshot holds every section as validated: food directives (« À favoriser », « À limiter », « Éviction totale » with periods), goals in order, interventions, lifestyle advice, meal structure, fasting option, the validated calculations. A zod schema defines the snapshot and checks it on write and on read. A version is never updated or deleted. Its migration ships in this stub.

## Acceptance criteria

- [ ] A row in `protocol_versions` holds patient, version number, validated at, validated by and the snapshot.
- [ ] Version numbers per patient start at 1 and increase by 1.
- [ ] A snapshot that fails the zod schema is refused on write and reported on read.
- [ ] A disabled element stays in the version it was validated in.
- [ ] No code path updates or deletes a version row.
- [ ] `RETENTION.md` says versions are deleted with the patient and kept otherwise.

## Out of scope

- The action that creates a version: `working-copy-and-validate`.

## Notes

D-25 (previews never migrate), D-30, D-32. Shared files first: `packages/services/src/db/schema.ts`, the migrations journal, `.icm/docs/RETENTION.md`. The snapshot schema lives beside the table in `packages/services/src/db/models/`.
