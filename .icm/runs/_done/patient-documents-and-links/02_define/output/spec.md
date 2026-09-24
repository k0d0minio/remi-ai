# Spec: Patient documents and links — her PDFs and links on the patient's page, through a files seam

- slug: patient-documents-and-links
- personas: practitioner, patient
- touches: packages/services/src/files, packages/services/src/db, packages/services/src/server/env.ts, packages/services/package.json, packages/services/tsup.config.ts, pnpm-lock.yaml, turbo.json, apps/admin/app/(admin)/patients, apps/admin/components/patients, apps/admin/lib, apps/web/app/[locale]/p/[token], apps/web/components/patient-link, apps/web/lib/patient-link, apps/web/lib/content, apps/web/lib, apps/docs/app/technical/decisions, .icm/docs/ENV.md, .icm/docs/RETENTION.md
- complexity: complex

## Problem

Morgane sends recipes as PDFs and keeps per-person documents — « sa liste personnalisée des 15
aliments », a meal feedback, specific recommendations — on WhatsApp. Her 14 Sept document asks for
them on the page: « Je voudrais pouvoir ajouter certains documents propres au consultant … Un
document accessible dans son espace est suffisant » (§ 4), « Je peux simplement ajouter les PDF des
recettes que je leur envoie actuellement » (§ 3, option 2), and to see the page as the patient sees
it (§ 7). Today the link has nowhere to put a file or a link, and the services package has no files
seam. This advances the initiative — a patient experience validated on real terrain, in time for
the December open day — through its objective: the patient loop working end to end for one real
patient. Decisions D-18 (Vercel Blob behind a files seam, EU region), D-2 (the same token) and D-19
(cut from her 14 Sept document, before any model) bind it.

## Proposed change

**The files seam (D-18) — the services package's fourth seam.** A new server-only subpath
`@remi/services/files` in the same pattern as `/email`: a `FileStore` interface, `registerFileStore()`
/ `getFileStore()`, a default that stores nothing and says so (an `isFileStoreConfigured()` the
console asks before offering an upload — a file must never appear to be kept when it was not), and
**one adapter, Vercel Blob**, the only file in the repo that names the vendor (`@vercel/blob`). The
store is a **private** Blob store created in an **EU region**; objects are keyed under the patient
(`patients/<patient-id>/…`) so a patient's files can be removed by prefix. The seam owns the rules,
not the page:

- **Type allow-list:** `application/pdf`, `image/jpeg`, `image/png`, `image/webp`. Anything else is
  refused by the seam.
- **Size cap:** 10 MB per file, refused by the seam.
- **Upload grants.** A 10 MB body cannot pass through a server action or a function body on Vercel,
  so the console uploads straight to the store under a grant the seam issues after checking the
  operator session, the patient, the type and the size; the grant carries the allow-list and the cap
  so the store enforces them too. The row is written only once the upload completes.
- **Reads** are a short-lived signed URL (5 minutes) issued by the seam; no file has a public URL.
- **Delete** by key and by patient prefix.

The token variable follows the three-list rule: `env.ts`, `turbo.json`, `.icm/docs/ENV.md`. Unset,
nothing is registered and the console shows the upload as unavailable (links still work).

**Data.** One new table, `patient_documents`: patient (cascade-deleted with the patient), `kind`
(`file | link`), `tag` (`recipe | document`, default `document`), `title` (required, ≤ 200
characters), `url` (links only, `https` only), `blob_key`, `mime` and `size` (files only),
`goal_id` (nullable → `patient_goals`, **set null** on delete), `recipe_assignment_id` (nullable →
`patient_recipe_assignments`, **set null** on delete), `added_by` (the operator), `added_on`,
created/updated timestamps. A document attaches to **at most one** of a goal or a recipe assignment
(a check constraint) — the patient's assignment, not the library recipe, so it stays per-patient.
The migration is generated from `schema.ts` and checked in. A services-package service owns add,
edit, remove and the reads (all, newest first; by goal; by recipe assignment; recipe-tagged).

**Console — patient page.** A « Documents » section:

- **Add a file** (PDF or image) or **add a link** (URL + title); each with a title, a tag
  (Recette / Document, default Document), and an optional attachment to one of the patient's goals
  or one of their recipe assignments.
- The list, newest first: title, kind, tag, attachment, date added; open a file (signed URL) or a
  link (new tab).
- **Edit** the title, tag and attachment; **Remove** (with confirmation) — a removed file is
  deleted from the store in the same action, and the row after it.
- Each add, edit and remove is an audit event with the document's title as the target label.

**« Voir comme la patiente »** (her § 7): an action on the console's patient page that opens the
patient's link in a new tab, one click. It reuses the existing token; it does not record an open
against the link.

**On the link.**

- **« Mes documents »** — a new segment `/p/[token]/documents`, in the navigation only when the
  patient has at least one document (the segment rule of decision #3). Every document, newest first,
  each showing its **title and the date added** — no author line. A file opens through a route under
  the token that checks the document belongs to the token's patient, then redirects to a 5-minute
  signed URL; a link opens in a new tab.
- **« Mes recettes »** — recipe-tagged documents (files and links) are listed there too, beside the
  assigned library recipes; they also stay in « Mes documents ». A document attached to a recipe
  assignment shows under that recipe.
- **Goals on the home** — a document attached to a goal shows beside that goal.
- A document attached to an archived goal or assignment stays in « Mes documents »; it simply has
  no parent shown.
- The patient reads, never uploads: no write action on the link is added by this feature.

**Deleting a patient** removes their documents' rows (cascade) **and their files in the store**
(delete by the patient's prefix) in the same operation; a store failure stops the deletion rather
than leaving files behind. RETENTION's tables and cascade name documents and files.

**Decision record.** `technical/decisions` in the docs gains the files seam entry: Vercel Blob, the
private EU store, the residency and retention terms, the cap and allow-list, signed-URL lifetime.

## Acceptance criteria

- [ ] `@remi/services/files` exists: a `FileStore` interface, `registerFileStore()` / `getFileStore()`, a non-storing default with `isFileStoreConfigured()`, and one Vercel Blob adapter that is the only file naming the vendor; the store is private and in an EU region
- [ ] The Blob token variable is in `env.ts`, `turbo.json` and `.icm/docs/ENV.md`; with it unset the console says uploads are unavailable and adding a link still works
- [ ] The seam refuses a file that is not PDF, JPEG, PNG or WebP, or is over 10 MB — on the upload grant, not only in the page
- [ ] From the patient page Morgane uploads a PDF or an image, or adds a link, with a title and a Recette / Document tag, optionally attached to one goal or one recipe assignment (never both)
- [ ] She edits a document's title, tag and attachment, and removes it; a removed file is gone from the store
- [ ] Each add, edit and remove is recorded in the audit trail
- [ ] The link shows a « Mes documents » segment, present only when the patient has a document, listing every document newest first with its title and date added
- [ ] A file opens on the link only through a route that checks it belongs to the token's patient and redirects to a signed URL valid for 5 minutes; another patient's document id returns not-found
- [ ] Recipe-tagged documents (files and links) also appear under « Mes recettes »; a document attached to a recipe assignment shows under that recipe; a document attached to a goal shows beside that goal on the home
- [ ] Deleting a goal or a recipe assignment keeps its documents on the patient, unattached
- [ ] Deleting a patient deletes their document rows and their files in the store; RETENTION.md says so
- [ ] The console's patient page has a one-click « Voir comme la patiente » that opens the patient's link in a new tab
- [ ] `technical/decisions` records the files seam: Vercel Blob, private EU store, residency and retention terms, the cap and the allow-list

## Out of scope

- Patient uploads — the patient reads, never uploads here; photos on meals (`beyond-december/meal-photos`, D-12 stands).
- Parsing or extracting a document (`beyond-december/autonomous-patient-pdf-import`).
- A shared resource library across patients — her § 5, struck by her (« pas prioritaire je peux envoyer sur whatsapp »).
- HEIC and any type beyond the four above; per-document sharing outside the patient's link; versioning a file (replace = remove + add).
- Attaching a document to a library recipe (every holder) — only to one patient's assignment.
- The 15-foods list as a feature — it stays a document she writes.

## Open questions

- none
