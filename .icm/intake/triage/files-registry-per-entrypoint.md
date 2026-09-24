# Stub: Give the files seam one registry, whatever entrypoint reaches it

- lane: chore
- found-by: patient-documents-and-links · release code review · 2026-09-24
- complexity: medium

## Problem

`packages/services/src/db/services/patients/index.ts` imports the files registry, and tsup bundles
each entrypoint on its own — so `@remi/services/db` (which exports `deletePatient`) and
`@remi/services/files` each carry a file-store registry nobody registers, plus the Vercel Blob SDK.
A caller reaching `deletePatient` through `/db` sees `isFileStoreConfigured()` false: a patient
with files is always refused. Today every app uses `/server`, and `packages/services/AGENTS.md`
says so — the same rule-to-remember the mailer already has.

## Proposed change

Make the registries shared rather than per bundle — tsup `splitting` for the ESM build, or one
registry chunk every entry imports — and prove it with a test that registers through one entry
and reads through another. Then the AGENTS.md warnings for mail and files can go.
