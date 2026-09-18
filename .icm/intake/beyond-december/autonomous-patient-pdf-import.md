# Stub: Autonomous patient — no practitioner in REMI, a PDF of recommendations, REMI structures it

- feature-slug: autonomous-patient-pdf-import
- scope: beyond-december
- personas: patient
- initiative: a patient experience validated on real terrain, in time for the December open day / objective: a usable patient version for the partner clinic to test on 1 December
- depends-on: patient-accounts
- sequence: 2 of 6
- priority: P2
- size: L
- sources: V2 explication (« Profil Patient autonome FunMedDev qui n'utilise pas le côté
  praticien … importe le PDF … REMI lit et structure directement ») · direction letter ("le
  patient doit pouvoir … intégrer les recommandations reçues de son médecin, nutrithérapeute ou
  autre praticien") · braindump `developpement-produit/ai.md` (the recommendations parser) ·
  decision D-10 (not needed for 1 December)

## Problem

The direction letter's first-version patient « intègre les recommandations reçues de son praticien »; the old version did it with a PDF upload. For December Morgane encodes; the FunMedDev patients whose practitioner is outside REMI have no self-serve path.

## Proposed change

The direction letter's first-version patient "intègre les recommandations reçues de son
praticien" — the old version did it with a PDF upload. For December Morgane encodes; this stub is
the self-serve path for the FunMedDev patients who have a practitioner outside REMI:

- **Self-onboarding**: sign-up without an invitation (accounts from `patient-accounts`), the
  profile the patient fills (`patient-loop/patient-profile-edit`'s fields plus identity).
- **PDF import**: upload a recommendations document; a files seam (blob storage — an owner
  vendor decision shared with `meal-photos`) stores it; a parse step (PDF → text; a structured
  `balanced` call → recommendation, supplement and essentials rows in the section schemas) fills
  a review screen; the patient accepts rows into their own record. The braindump's parser, at
  patient scale.
- **No practitioner attached**: the patient's record exists with `practitioner: none`; the
  console lists them under a filter so Morgane can see the population without owning them.

## Acceptance criteria (rough)

- [ ] Self-serve sign-up without an invitation, and a profile the patient fills
- [ ] A recommendations PDF is uploaded through a files seam, parsed to text, and one structured `balanced` call fills a review screen with recommendation, supplement and essentials rows the patient accepts into their record
- [ ] A record with no practitioner attached exists and is visible in the console under a filter
- [ ] A patient-supplied PDF is treated as untrusted input: the parse runs with no patient context and its output is rows for review, never a write

## Out of scope (this feature)

- Choosing the blob-storage or PDF-extraction vendor in passing — both are owner decisions; answering an autonomous patient's meals with the model alone (D-6 extended, needs its own yes)

## Notes for Define

- **Decisions that bind** ([`README.md § Decisions of record`](../README.md)): D-10 (not needed for 1 December) · D-6 (the model answering with no practitioner needs a separate decision).

- Two vendor questions gate it — blob storage and PDF text extraction (the v1 report records
  LlamaParse; a plain extractor may do for typed PDFs). Both are owner decisions, flagged, never
  picked in passing.
- A patient-supplied PDF is untrusted input into a prompt; the parse runs with no patient context
  beyond the file and its output is rows for review, never a write.

**Open for Define** — settled with the operator before the spec is approved, never assumed:

- Is the autonomous patient a FunMedDev-only pilot (a code at sign-up) or public?
- Who answers an autonomous patient's meal entries when there is no Morgane — the model alone?
  That is decision D-6 extended and needs its own yes.

## Prompt

Run `/pipeline new autonomous-patient-pdf-import` in the remi-ai repo — **only after the owner has moved this stub onto the live path and answered the blob and PDF-extraction vendor questions**. Define reads this stub, its epic's `breakdown.md` and the decisions of record in `.icm/intake/README.md`, and asks the points under **Open for Define** rather than answering them. Scope is the Proposed change and nothing under Out of scope.
