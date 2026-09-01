# Stub: The living summary — Morgane writes what the AI will one day draft

- feature-slug: living-summary
- sequence: 5 of 6
- depends-on: none
- priority: P1
- size: S
- sources: v2 brainstorm § C (PATIENT_SUMMARY) + § J (patient output includes the summary) ·
  scope answers 2026-09-01 (breakdown.md § Decisions, #7)

## What this is

§ C's PATIENT_SUMMARY is the synthesis of a patient — context and motif, points of vigilance,
current medications by name, main difficulties, useful habits and constraints, what is already
going well, what still needs clarifying. In the target model the AI drafts it and Morgane
validates; the decision of record makes it manual-first: **one living summary per patient, written
by Morgane, revised at each consultation** (decision #7). No per-consultation history — the
consultation notes already carry history; this is the current state of the file.

It is also the first record block that is patient-visible by design: the link's opening segment
will render it alongside the goals (§ J). That render belongs to the `patient-surface` epic; this
stub delivers the table, the service, and the admin editing surface — one generous text area on
the patient page, placed above the recommendations, because it is what she re-reads first at the
start of a consultation.

Because a patient will read it, the admin UI says so where she edits it ("visible sur le lien
patient une fois les segments en ligne") — the one summary serving both readers is the point:
writing it *for* the patient is what § C's "pas de ressaisie" becomes without an AI to do the
translating.

## Worth knowing

- One column on `patient_profiles` versus a one-row-per-patient table: the spec decides, but note
  the AI round will want draft-vs-validated states on this content — leave room for that to be a
  column addition, not a re-model.
- Keep § C's checklist of what a summary covers as *guidance in the UI* (placeholder or helper
  text), not as separate fields — § 4's principle: background tables must not become a manual
  entry burden.
- Writes audit via `lib/audit.ts`.

## Open questions — flag these on pickup

- Does Morgane want a lightweight "reviewed at" stamp she bumps when she re-reads without editing
  (so a stale summary is visible as stale), or is updated-at enough?
- Sections within the summary (§ C's bullet list) as headings she types, or truly free text?
  Confirm with her before adding any structure.

## Prompt

Run `/pipeline new .icm/intake/patient-record/living-summary.md` in the remi-ai repo and follow
the pipeline from there. Read the stub and its epic's `breakdown.md` first. Scope: one living,
patient-readable summary per patient — storage + migration, service behind the seam, an editing
block near the top of the admin patient page labelled as patient-visible; the actual patient-link
render is the patient-surface epic's, not this stub's. Raise the stub's open questions rather than
answering them.
