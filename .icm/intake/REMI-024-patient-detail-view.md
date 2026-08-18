# REMI-024 · Per-patient detail view for the practitioner

|                |                                                                            |
| -------------- | -------------------------------------------------------------------------- |
| Status         | ready once REMI-023 lands                                                  |
| **Type**       | feature                                                                    |
| **Priority**   | P0 — Phase D                                                               |
| **Size**       | A week                                                                     |
| **Depends on** | REMI-023                                                                   |
| **Blocked by** | —                                                                          |
| **Sources**    | Status report Phase D bullet 2 · `.icm/docs/braindump/roadmap/features.md` |

## Problem statement

The cohort view says _who_ needs attention; this one says _why_. The braindump asks for four things
a practitioner can see per patient: actions actually completed, difficulties encountered, food
habits, and the patient's own feedback.

This is where REMI earns _gain de temps_: a practitioner opening a consultation should already know
what happened since the last one, without asking the patient to recall it.

## Required steps

1. Timeline of micro-actions: done, skipped, marked difficult — and the reason given.
2. Food habits as observed, from the "Améliore mon assiette" and daily-hub interactions, not from a
   questionnaire.
3. Supplement observance from REMI-021.
4. The patient's own feedback, verbatim, not summarised into a score.
5. Make it readable in the minute before a consultation. Density beats completeness here.
6. Same access enforcement as REMI-023, server-side.

## Open questions — flag these on pickup

- **How much history is shown by default?** Since the last consultation, a fixed window, or
  everything. REMI does not currently know when consultations happen.
- **Should the practitioner see the raw meal descriptions?** They are the richest signal and also
  the most personal thing the patient writes. Whether the patient knows their practitioner reads
  them is a consent question, not a UI one.
- **Is there an AI summary?** Tempting and expensive, and a summary that misleads a practitioner is
  worse than no summary. If yes, it belongs behind REMI-022's cost and safety layer.
- **Does the patient see what the practitioner sees?** Transparency is defensible and changes what
  patients write.

## Acceptance criteria

- [ ] A practitioner can see completed actions, difficulties, observed habits and feedback for one patient.
- [ ] Feedback appears in the patient's own words, not only as a metric.
- [ ] The screen is usable in under a minute before a consultation.
- [ ] Access is enforced server-side; no patient detail is reachable without a care relationship.

## Agent prompt

```text
Work in the remi-ai monorepo. Read CLAUDE.md and CONVENTIONS.md, then .icm/docs/braindump/
roadmap/features.md ("Vue détaillée patient").

Task: build the per-patient detail view.
1. Micro-action timeline with done / skipped / difficult and the reasons given.
2. Observed food habits from real interactions, not from a questionnaire.
3. Supplement observance.
4. The patient's feedback verbatim, alongside any metric — never instead of it.
5. Enforce the care relationship server-side, exactly as REMI-023 does.
Optimise for the minute before a consultation: dense and scannable beats complete. Do not run
build/lint/typecheck/format locally. Push a branch, open a PR, git mv this ticket into
.icm/intake/_done/, and raise the consent question about raw meal descriptions explicitly — whether
patients know their practitioner reads them is not a UI decision.
```
