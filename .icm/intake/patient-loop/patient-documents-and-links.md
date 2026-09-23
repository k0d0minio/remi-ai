# Stub: Patient documents and links — her PDFs and links on the patient's page, through a files seam

- feature-slug: patient-documents-and-links
- scope: patient-loop
- personas: practitioner, patient
- initiative: a patient experience validated on real terrain, in time for the December open day / objective: the patient loop working end to end for one real patient
- depends-on: link-writes
- sequence: 5 of 9
- priority: P1
- size: M
- complexity: high
- sources: « Ce que les consultants doivent voir » § 3 option 2, § 4 and § 7 (Morgane, 2026-09-14 —
  `.icm/docs/collaboration/what-the-consultants-see.docx`) · 11 Sept call [28:21] (« mettre du texte
  ou figer des documents ou des liens vers des documents ») · decisions D-18 (Vercel Blob behind a files
  seam, EU region), D-19 · `.icm/docs/RETENTION.md` · `beyond-december/meal-photos.md` (the seam it
  described, built here instead)

## Problem

She sends recipes as PDFs and keeps per-person documents — « sa liste personnalisée des 15 aliments », a meal feedback, specific recommendations — on WhatsApp. The link has nowhere to put a file or a link, and there is no files seam in the services package.

## Proposed change

Her § 4: « Je voudrais pouvoir ajouter certains documents propres au consultant … Un document
accessible dans son espace est suffisant. » And her § 3, option 2: « Je peux simplement ajouter les
PDF des recettes que je leur envoie actuellement. » This stub gives her both, and the platform its
fourth seam:

- **A files seam** in `packages/services` — an interface, `registerFileStore()`, one adapter for
  **Vercel Blob** (decision D-18), EU region, private access, signed URLs with a short life, size cap
  and type allow-list in the seam, deleted with the patient (RETENTION's cascade updated in the same
  PR). The token variable follows the three-list rule (`env.ts`, `turbo.json`, `ENV.md`).
- **On the console**, on the patient page: « Documents » — upload a file (PDF, image) or add a link
  with a title, optionally tagged as a recipe or a document; edit the title, remove. A removed file is
  deleted from the store.
- **On the link**: « Mes documents » lists them newest first; a file opens through a signed URL, a
  link opens in a new tab. Recipe-tagged PDFs also appear under « Mes recettes », so her option 2 and
  option 1 (recipes in REMI) live on the same segment.
- **« Voir le profil comme lui le voit »** (her § 7): a « Voir comme la patiente » action on the
  console opens the patient's link in a new tab — the token is already hers to copy; this makes it
  one click.

## Acceptance criteria (rough)

- [ ] A files seam in the services package (interface, registration, one Vercel Blob adapter in the EU region); the token variable is in all three lists; RETENTION names files and the cascade deletes them
- [ ] From the patient page Morgane uploads a PDF or an image, or adds a link with a title, tags it as recipe or document, edits the title and removes it; a removed file is gone from the store
- [ ] The link shows « Mes documents » newest first; a file opens through a short-lived signed URL; recipe-tagged files also appear under « Mes recettes »
- [ ] The console has a one-click « Voir comme la patiente » that opens the patient's link
- [ ] Size cap and type allow-list are enforced in the seam, not the page

## Out of scope (this feature)

- Patient uploads (the patient reads, never uploads here); photos on meals (`beyond-december/meal-photos`,
  D-12 stands); parsing a document (`beyond-december/autonomous-patient-pdf-import`); a shared
  resource library — her § 5, struck by her (« pas prioritaire je peux envoyer sur whatsapp »)

## Notes for Define

- **Decisions that bind** ([`README.md § Decisions of record`](../README.md)): D-18 (Vercel
  Blob behind a files seam, EU region, an owner decision made 2026-09-23) · D-2 (the same token) ·
  D-19 (cut from her 14 Sept document, before any model).

- `touches:` the dependency manifest and lockfile (`@vercel/blob`), the env schema, `turbo.json`,
  `ENV.md`, the schema and the migrations journal (`patient_documents`: patient, kind, title, url or
  blob key, mime, size, added_by, added_on) — every shared file at once, which is why it is
  sequenced right after `challenges` and before `general-feedback`.
- Health data in files: the store's residency and retention terms are part of the decision D-18
  records; write them into the docs' `technical/decisions` in the same PR.
- The 15-foods list stays a document she writes, not a feature — her own words.

**Open for Define** — settled with the operator before the spec is approved, never assumed:

- Accepted file types and the size cap (PDF and images are the ask; propose 10 MB).
- Whether a document attaches to the patient only, or also to a goal or a recipe.
- Whether the patient sees a document's date and who added it.

## Prompt

Run `/pipeline new patient-documents-and-links` in the remi-ai repo. Define reads this stub, its epic's `breakdown.md` and the decisions of record in `.icm/intake/README.md`, and asks the points under **Open for Define** rather than answering them. Scope is the Proposed change and nothing under Out of scope.
