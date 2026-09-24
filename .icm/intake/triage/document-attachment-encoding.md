# Stub: One encode/decode pair for a document's attachment value

- lane: chore
- found-by: patient-documents-and-links · release code review · 2026-09-24
- complexity: low

## Problem

The console's attachment picker speaks `goal:<id>` / `recipe:<id>` / `none`, and the protocol is
written three times: built in `apps/admin/app/(admin)/patients/[id]/page.tsx`, re-derived in
`apps/admin/components/patients/document-section.tsx` (`attachmentValueOf`), parsed in
`apps/admin/lib/patients/actions.ts` (`attachmentFrom`). A new parent kind, or a changed
separator, missed in one place silently drops the attachment on edit.

## Proposed change

One `encodeAttachment` / `decodeAttachment` pair in `packages/services/src/shared/files.ts`
beside `documentTags`, used by all three. No behaviour change.
