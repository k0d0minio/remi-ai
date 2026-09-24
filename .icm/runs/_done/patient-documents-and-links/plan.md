# Plan: patient-documents-and-links

Build's execution plan in passes — each pass one layer of the change, in the order it lands, so
a session that resumes mid-build sees where it is. Written by the advisor pass (Define, or
Build's first act on `sonnet` after reading the spec), executed pass by pass, and rewritten when
reality disagrees with it — never left describing a plan that was abandoned.

## Passes

1. **The files seam** — `packages/services/src/files/` (interface, `registerFileStore` /
   `getFileStore`, the non-storing default + `isFileStoreConfigured`, the allow-list and 10 MB cap
   as exported constants, the Vercel Blob adapter as the only vendor-naming file), the `./files`
   subpath in `package.json` exports + `tsup.config.ts` entry (kept adjacent), `@vercel/blob` in the
   manifest and lockfile (regenerated with pnpm, never by hand), the token variable in `env.ts`,
   `turbo.json`, `.icm/docs/ENV.md` — done when: unit tests prove the seam refuses a bad type and an
   oversize file on the grant, and the default refuses to store.
2. **Schema and service** — `patient_documents` in `schema.ts` (cascade on patient, set null on
   goal and recipe assignment, the at-most-one-attachment check), the generated migration + journal
   (load the `database-migration` skill), `db/services/patient-documents/` (add, edit, remove,
   reads: all newest first, by goal, by recipe assignment, recipe-tagged), audit events on each
   write; `deletePatient` removes the store prefix before the row cascade and stops on a store
   failure — done when: service tests cover the attachment check, set-null on goal/assignment
   delete, ownership on read, and the patient-delete path.
3. **Console** — register the file store in `apps/admin/lib` (beside the mailer), the upload-grant
   route behind the operator session, the « Documents » section on the patient page (add file / add
   link, tag, optional goal or assignment, edit, remove with confirmation, unavailable state when
   unconfigured), and « Voir comme la patiente » opening the link in a new tab without recording an
   open — done when: the flow works on the admin preview against a private EU store.
4. **Link** — register the file store in `apps/web/lib`, the `documents` segment in
   `segments.ts` + `visibleSegments`, `/p/[token]/documents` page, the token-checked file route
   redirecting to a 5-minute signed URL, recipe-tagged items under « Mes recettes », attached items
   under their recipe and beside their goal, FR/EN copy in `lib/content` — done when: another
   patient's document id returns not-found and each list renders on the web preview.
5. **Docs** — `.icm/docs/RETENTION.md` (documents and files in the held-data table and the
   cascade), `apps/docs/app/technical/decisions` (the files seam entry: vendor, private EU store,
   residency/retention terms, cap, allow-list, signed-URL life) — done when: both read as what the
   code does.

## Risks

- **Upload size vs. function limits** — a 10 MB body cannot go through a server action or a
  function; if the grant-based client upload is skipped, uploads fail above ~4.5 MB on Vercel.
  Signal: a PDF over 5 MB fails on the preview.
- **Store region and privacy are set at store creation** and cannot be changed; a public or US
  store needs a new store. Signal: blob URLs without `.private.` or a non-EU region in the dashboard.
  The store and its token are the operator's to provision per environment (ENV.md).
- **Orphaned files** — a DB row deleted without its blob (or vice versa). Remove the blob first on
  a single remove; the patient delete stops on a store failure. Signal: prefix listing non-empty
  after a patient delete.
- **Shared-file overlap** — `schema.ts`, the migrations journal and `turbo.json` are touched by
  `general-feedback` too; merge `main` early.
