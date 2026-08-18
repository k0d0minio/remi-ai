# REMI-014 · Model the V2 loop — practitioner, patient, recommendation, rule, micro-action, feedback

|                |                                                                        |
| -------------- | ------------------------------------------------------------------------ |
| Status         | ready                                                                  |
| **Type**       | feature (modelling)                                                    |
| **Priority**   | P0 — Phase B; it shapes the schema, so it precedes the adapter         |
| **Size**       | A few days                                                             |
| **Depends on** | REMI-008 (scope frozen)                                                |
| **Blocked by** | —                                                                      |
| **Sources**    | Status report Phase B bullet 2 · audit F-14, F-16, F-17, F-18          |

## Problem statement

The entities the V2 loop runs on do not exist. Neither do the ones the repo's own documents call
decided: the practitioner↔person access-control record (audit F-14), consent capture, the audit
trail, and the AI-generation record (audit F-16). The admin console's whole domain lives outside
the shared model layer (F-15), several relationships are stored twice or as prose and can drift
(F-17), and some primitive choices will calcify if not fixed now (F-18).

Model against the **braindump's concepts, not v1's tables**. v1's schema is evidence of shape, not
a specification — it belonged to a product with a 7-day diary and rigid weekly plans.

## Required steps

1. Model the V2 loop as its own thing: **practitioner**, **patient profile**, **recommendation**
   (what the practitioner prescribed), **rule** (the structured, machine-actionable form of it),
   **micro-action** (what the patient is asked to do, with its *why*), and **feedback** (what came
   back — done, skipped, difficult).
2. Add the entities the docs already promised: the practitioner↔patient care relationship as a
   first-class record, consent capture with its timestamp, an audit trail, and an AI-generation
   record (prompt, model, cost, outcome) — the last of these is also what makes REMI-022's cost
   tracking possible.
3. Bring the admin console's entities into the shared model layer instead of app-local fixtures.
4. Fix the drift risks: store each relationship once; choose primitives deliberately (identifiers,
   money, dates, enumerations) rather than inheriting them.
5. Write the model down where a stage can read it, and keep it the single definition the migrations
   in REMI-013 are generated against.

## Open questions — flag these on pickup

- **What is a "recommendation" exactly?** A free-text instruction from a practitioner, a structured
  rule, or both with the parser (REMI-029) mapping one to the other? The braindump implies both;
  the boundary between recommendation and rule is undecided and shapes the parser's contract.
- **Does a patient belong to exactly one practitioner?** Multi-practitioner patients are real in
  functional medicine, and the answer changes the access model.
- **What is retained, and for how long?** Health data retention is REMI-015's decision, but the
  model has to be able to express it — a schema with no deletion path cannot be made compliant
  later.
- **Is patient data pseudonymised before reaching the AI provider?** Audit D-5 is open, and it
  changes what the AI-generation record may hold.

## Acceptance criteria

- [ ] Every entity in the V2 loop is modelled, named as the braindump names the concept.
- [ ] Care relationship, consent, audit trail and AI-generation records all exist.
- [ ] The admin console's entities are in the shared model layer, not app-local.
- [ ] No relationship is stored in two places.
- [ ] Deletion and export are expressible in the model, whatever the retention decision turns out to be.

## Agent prompt

```text
Work in the remi-ai monorepo. Read CLAUDE.md and CONVENTIONS.md, then .icm/docs/braindump/
roadmap/features.md and developpement-produit/fonctionnalites.md for the concepts, then
.icm/docs/history/audit-report.md findings F-14 to F-18, then .icm/docs/history/v1-report.md
sections 5.1 and 8 — read v1's schema as evidence of shape and its defects as a list of mistakes,
never as a specification.

Task: model the V2 loop before the adapter exists.
1. Define practitioner, patient profile, recommendation, rule, micro-action and feedback, using the
   braindump's own vocabulary.
2. Add the care relationship, consent capture with timestamp, the audit trail, and the
   AI-generation record (prompt, model, cost, outcome).
3. Move the admin console's entities into the shared model layer.
4. Store every relationship exactly once. Choose primitives deliberately.
5. Make deletion and export expressible in the model even though the retention policy is not yet
   decided.
Do not run build/lint/typecheck/format locally. Push a branch, open a PR, git mv this ticket into
.icm/intake/_done/, and list in the PR body which open questions above you had to assume answers
to and what you assumed.
```
