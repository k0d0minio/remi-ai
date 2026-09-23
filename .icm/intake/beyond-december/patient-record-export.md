# Stub: Patient record export — a practitioner's records are never « enfermés » in REMI

- feature-slug: patient-record-export
- scope: beyond-december
- personas: practitioner
- initiative: a patient experience validated on real terrain, in time for the December open day / objective: the database and accounts under it
- depends-on: none
- sequence: 7 of 8
- priority: P2
- size: S
- complexity: low
- sources: « REMI V2 Features » § 30 (Morgane, 2026-08-20 —
  `.icm/docs/collaboration/remi-v2-features.docx`: « Un praticien ne doit jamais avoir l'impression que
  ses dossiers patients sont « enfermés » dans REMI ») · decision D-22 (parked 2026-09-23) ·
  `.icm/docs/RETENTION.md` (what a record holds) · `_done/practitioner-workflow/_done/copy-context.md`
  (exports a pseudonymous prompt, not the record)

## Problem

Her 20 Aug catalogue makes export a P0 trust principle: a practitioner must be able to take a patient's record out, readable, at any time. Today `copy-context` exports a pseudonymous prompt context and RETENTION covers deletion; nothing exports the record itself, which is also the GDPR portability right.

## Proposed change

- **« Exporter le dossier »** on the patient page: one file, readable without REMI — a PDF or a
  printable page, and a JSON beside it — holding everything RETENTION's table says the record
  holds: profile, anamnesis, living summary, goals and instruction, recommendations, supplements,
  essentials, recipes assigned, the journal, check-ins and feedback, documents (as links). Names
  included: this is her record, not a prompt.
- Written by the practitioner's action, logged in the audit trail (who exported what, when).

## Acceptance criteria (rough)

- [ ] From the patient page, « Exporter le dossier » produces a readable file (PDF or printable page) and a JSON holding every section RETENTION names, including identity
- [ ] The export is an audited action
- [ ] The docs' `business/roles` page says the practitioner can take a record out

## Out of scope (this feature)

- A bulk export of all patients; an import into another tool; a patient-side export (accounts first)

## Notes for Define

- **Decisions that bind** ([`README.md § Decisions of record`](../README.md)): D-22 (parked P2;
  a pickup is the owner's move, not a stage's).

- The patient link's documents (`patient-loop/patient-documents-and-links`) are referenced by
  signed URL in the JSON, not embedded — the export must not become a zip of blobs.

**Open for Define** — settled with the operator before the spec is approved, never assumed:

- PDF, printable page, or both — and whether the JSON is wanted at all before a second tool exists.

## Prompt

Run `/pipeline new patient-record-export` in the remi-ai repo — **only after the owner has lifted this stub's P2**. Define reads this stub, its epic's `breakdown.md` and the decisions of record in `.icm/intake/README.md`, and asks the points under **Open for Define** rather than answering them. Scope is the Proposed change and nothing under Out of scope.
