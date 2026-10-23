# Stub: The practitioner reads any earlier version of the protocol

- feature-slug: protocol-history-view
- epic: protocol-versions
- story: 20
- sequence: 3 of 3
- depends-on: protocol-version-table
- complexity: low
- priority: P1

## Problem

The practitioner cannot find what was decided before. The versions exist after stub 1 but nothing shows them.

## Proposed change

A section « Historique » on the patient file lists the versions, newest first: version number, date, who validated. Opening one renders its snapshot read-only, in the same layout as the current protocol. A disabled element shows in the version it belonged to.

## Acceptance criteria

- [ ] The list shows every version with number, date and validator.
- [ ] Opening a version shows its full content, read-only.
- [ ] No control on a past version edits anything.
- [ ] A disabled element appears in the versions that held it.

## Out of scope

- A comparison between two versions.

## Notes

Files: `apps/admin/app/(admin)/patients/[id]/`. Reads `protocol_versions` only.
