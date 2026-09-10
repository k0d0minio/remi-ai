# Stub: Autonomous patient — no practitioner in REMI, a PDF of recommendations, REMI structures it

- feature-slug: autonomous-patient-pdf-import
- sequence: 2 of 6
- depends-on: patient-accounts
- priority: P2
- size: L
- sources: V2 explication (« Profil Patient autonome FunMedDev qui n'utilise pas le côté
  praticien … importe le PDF … REMI lit et structure directement ») · direction letter ("le
  patient doit pouvoir … intégrer les recommandations reçues de son médecin, nutrithérapeute ou
  autre praticien") · braindump `developpement-produit/ai.md` (the recommendations parser) ·
  decision #10 (not needed for 1 December)

## What this is

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

## Worth knowing

- Two vendor questions gate it — blob storage and PDF text extraction (the v1 report records
  LlamaParse; a plain extractor may do for typed PDFs). Both are owner decisions, flagged, never
  picked in passing.
- A patient-supplied PDF is untrusted input into a prompt; the parse runs with no patient context
  beyond the file and its output is rows for review, never a write.

## Open questions — flag these on pickup

- Is the autonomous patient a FunMedDev-only pilot (a code at sign-up) or public?
- Who answers an autonomous patient's meal entries when there is no Morgane — the model alone?
  That is decision #6 extended and needs its own yes.

## Prompt

Run `/pipeline new .icm/intake/beyond-december/autonomous-patient-pdf-import.md` in the remi-ai
repo and follow the pipeline from there — only after the owner has moved this stub onto the live
path and answered the blob and PDF-extraction vendor questions. Read the stub and its epic's
`breakdown.md` first. Scope: self-serve sign-up, a PDF upload through a files seam, a parse step
producing protocol rows for the patient's review, records with no practitioner attached visible in
the console under a filter. Raise the stub's open questions rather than answering them.
