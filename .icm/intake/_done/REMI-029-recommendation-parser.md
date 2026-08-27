> Dropped: parked practitioner phase — the 2026-08-27 direction of record says the practitioner space will be specified from Morgane's terrain experience, so this braindump-era spec would be re-cut rather than picked up as written. 2026-08-27 estate ticket audit.

# REMI-029 · The recommendation parser — practitioner documents into structured rules

> **Deferred (2026-08-27):** practitioner-phase / later-phase work. Per `.icm/docs/new-development-direction.docx`, the patient experience is built and validated first (FunMedDev test 1 Dec, open day 19 Dec); the practitioner space, parser, subscriptions and practitioner beta come after, informed by Morgane's own terrain experience with 10-15 patients. Was higher priority under the retired Phase A-F plan.

|                |                                                                                   |
| -------------- | --------------------------------------------------------------------------------- |
| Status         | ready once REMI-028 provides a corpus                                             |
| **Type**       | feature                                                                           |
| **Priority**   | P2 — parked until the patient experience is validated (new development direction) |
| **Size**       | Weeks                                                                             |
| **Depends on** | REMI-014 (the rule entity), REMI-022 (cost and safety), REMI-028 (the corpus)     |
| **Blocked by** | The corpus, and the AI provider choice                                            |
| **Sources**    | Status report Phase E · `.icm/docs/braindump/developpement-produit/ai.md`         |

## Problem statement

A practitioner writes recommendations as prose in a PDF or consultation note. REMI needs them as
structured rules it can act on daily. Today that translation happens in a human's head or not at
all, and it is the bottleneck between "the practitioner recommended something" and "the patient
does something about it tonight".

The braindump names this as one of the two priority AI components, and the report names it as the
strongest proprietary-technology exhibit REMI has — building it early serves the product and the
funding pitch at once. It is also what makes REMI-025's remote adjustment meaningful: rules a
practitioner can edit are rules that came from somewhere.

## Required steps

1. Ingest a PDF or consultation note. Extract text reliably — including from scans, which is a
   materially harder problem than from digital PDFs.
2. Extract the recommendations from the prose.
3. Structure them into the rule entity from REMI-014 — machine-actionable, so
   "Améliore mon assiette" can evaluate a meal against them.
4. **Never silently guess.** A recommendation the parser is unsure about must surface for the
   practitioner to confirm, not enter the patient's rules unreviewed. This is health guidance.
5. Give the practitioner a review-and-correct step, and use the corrections as evaluation data.
6. Measure accuracy against REMI-028's held-out set, and publish the figure internally rather than
   claiming quality.
7. Run through REMI-022's seam so every call is cost-tracked and safety-constrained.

## Open questions — flag these on pickup

- **What extracts the text?** v1 used LlamaParse; whether it survives (REMI-011) or is replaced
  matters, and scanned documents may need OCR that nothing currently provides.
- **How is a rule represented?** REMI-014 defines the entity; whether it is expressive enough for
  real recommendations only becomes clear against real documents. Expect to feed changes back.
- **What is the confidence threshold for auto-accepting?** A clinical safety decision, not a tuning
  parameter. It should be set by the owner with practitioner input.
- **What happens to a hand-edited rule on the next parse?** REMI-025 lets practitioners edit rules
  directly; the parser must not overwrite deliberate corrections.
- **Does the document itself get retained?** It is a medical document about an identified patient.
  Retention is REMI-015's decision and it applies here in full.

## Acceptance criteria

- [ ] A practitioner document produces structured rules the patient loop can evaluate against.
- [ ] Nothing uncertain enters a patient's rules without practitioner confirmation.
- [ ] A review-and-correct step exists and its corrections are captured.
- [ ] Accuracy is measured against a held-out set and the figure is recorded.
- [ ] Every call is cost-tracked; document retention follows the data-protection decision.
- [ ] Hand-edited rules survive a re-parse.

## Agent prompt

```text
Work in the remi-ai monorepo. Read CLAUDE.md and CONVENTIONS.md, then .icm/docs/braindump/
developpement-produit/ai.md, then Phase E of .icm/docs/remi-status-report.html, then
.icm/docs/history/v1-report.md section 5.2 — v1's document ingestion and validation contract is
the closest prior art and its defects are documented in section 8.

Task: build the recommendation parser.
1. Ingest PDFs and consultation notes; extract text reliably, including from scans.
2. Extract recommendations from prose and structure them into REMI-014's rule entity.
3. Surface anything uncertain for practitioner confirmation. NEVER let an unreviewed guess become
   a rule that drives someone's health guidance.
4. Build the review-and-correct step and capture corrections as evaluation data.
5. Measure accuracy against REMI-028's held-out set. Record the figure; do not assert quality.
6. Route every call through REMI-022's seam so it is cost-tracked and safety-constrained.
7. Do not overwrite rules a practitioner has hand-edited.
Start narrow — the formats the beta practitioners actually produce — and widen later. Do not run
build/lint/typecheck/format locally. Push a branch, open a PR, git mv this ticket into
.icm/intake/_done/, and put the auto-accept confidence threshold to the owner: it is a clinical
safety decision.
```
