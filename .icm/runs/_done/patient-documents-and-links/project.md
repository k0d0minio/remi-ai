# Project: patient-documents-and-links

The run's context card — what a fresh session needs before it reads anything else. Pointers,
not copies: the spec stays the spec, the scope stays the scope. Seeded when the run is opened
(`new-run.sh` → `run-pack.sh --init`), sharpened by whichever stage learns something. Read with
`status.md` and `handoff.md` on every resume (`_shared/stage-preamble.md`).

- stub: intake/patient-loop/patient-documents-and-links.md
- scope: none (epic cut before the front existed — breakdown: intake/patient-loop/breakdown.md)
- spec: 02_define/output/spec.md
- touches: packages/services/src/files, packages/services/src/db, packages/services/src/server/env.ts, packages/services/package.json, packages/services/tsup.config.ts, pnpm-lock.yaml, turbo.json, apps/admin/app/(admin)/patients, apps/admin/components/patients, apps/admin/lib, apps/web/app/[locale]/p/[token], apps/web/components/patient-link, apps/web/lib/patient-link, apps/web/lib/content, apps/web/lib, apps/docs/app/technical/decisions, .icm/docs/ENV.md, .icm/docs/RETENTION.md
- complexity: complex → model: opus (executor — select-model.sh --stage 03_build)

## Constraints

- D-18: Vercel Blob is the one adapter behind a files seam; private store, EU region; nothing above
  the seam names the vendor.
- D-2: the token is the credential; the link reads documents, it never uploads (no new link write).
- D-12 stands: meals stay text-only; this run adds no photo column.
- The cap and allow-list live in the seam, not the page; a new env variable is a three-list edit.

## Context budget

- Read beyond Define's Inputs: `schema.ts` (goals, recipe assignments, challenges), the email seam
  and its registration, `segments.ts`, the services `package.json`/`tsup.config.ts`, and Vercel's
  Blob docs (private storage, regions, signed URLs) — to fill `touches:` and confirm D-18 is buildable.
