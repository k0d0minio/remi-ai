# Tasks: patient-documents-and-links

The queue, with a definition of done per item. Ticked by the stage that finishes the item —
a human checkbox, never a script's. The definition of done is seeded from the spec's
acceptance criteria when the run is opened; the queue is Build's own, one line per commit-sized
step, so a resuming session can pick up the first unticked line.

## Definition of done

- [x] `@remi/services/files` exists: a `FileStore` interface, `registerFileStore()` / `getFileStore()`, a non-storing default with `isFileStoreConfigured()`, and one Vercel Blob adapter that is the only file naming the vendor; the store is private and in an EU region
- [x] The Blob token variable is in `env.ts`, `turbo.json` and `.icm/docs/ENV.md`; with it unset the console says uploads are unavailable and adding a link still works
- [x] The seam refuses a file that is not PDF, JPEG, PNG or WebP, or is over 10 MB — on the upload grant, not only in the page
- [x] From the patient page Morgane uploads a PDF or an image, or adds a link, with a title and a Recette / Document tag, optionally attached to one goal or one recipe assignment (never both)
- [x] She edits a document's title, tag and attachment, and removes it; a removed file is gone from the store
- [x] Each add, edit and remove is recorded in the audit trail
- [x] The link shows a « Mes documents » segment, present only when the patient has a document, listing every document newest first with its title and date added
- [x] A file opens on the link only through a route that checks it belongs to the token's patient and redirects to a signed URL valid for 5 minutes; another patient's document id returns not-found
- [x] Recipe-tagged documents (files and links) also appear under « Mes recettes »; a document attached to a recipe assignment shows under that recipe; a document attached to a goal shows beside that goal on the home
- [x] Deleting a goal or a recipe assignment keeps its documents on the patient, unattached
- [x] Deleting a patient deletes their document rows and their files in the store; RETENTION.md says so
- [x] The console's patient page has a one-click « Voir comme la patiente » that opens the patient's link in a new tab
- [x] `technical/decisions` records the files seam: Vercel Blob, private EU store, residency and retention terms, the cap and the allow-list

## Queue

- [x] Pass 1 — the files seam, the Vercel Blob adapter and its browser half, `BLOB_READ_WRITE_TOKEN` in the three lists (f424e16)
- [x] Pass 2 — `patient_documents` + migration 0021, the service and its tests, `deletePatient` sweeps the store first, audit actions (9563c09)
- [x] Pass 3 — the console's Documents section, the upload grant and file opener routes, the stateful delete dialog, « Voir comme la patiente » (88961a5)
- [x] Pass 4 — the link's Documents segment, the token-checked file route, documents under recipes and goals, the preview marker (8c3729d)
- [x] Pass 5 — RETENTION.md, build notes, run pack
- [x] Release — the `technical/decisions` files-seam entry (the docs tree is Release's to edit; see Notes for Release)
