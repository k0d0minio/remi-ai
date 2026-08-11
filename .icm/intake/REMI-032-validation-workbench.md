# REMI-032 · Admin validation workbench for extracted medical data

|                |                                                                                                  |
| -------------- | ------------------------------------------------------------------------------------------------ |
| **Type**       | feature                                                                                          |
| **Priority**   | P1                                                                                               |
| **Size**       | A week                                                                                           |
| **Depends on** | REMI-031 (extraction rows to validate), REMI-023 (operator auth), REMI-021 (shared admin models) |
| **Blocked by** | —                                                                                                |
| **Sources**    | v1-report §4 (Documents tab), §2 step 5, §8.4; audit F-16 (audit trail)                          |

## Problem statement

Every extracted medical item is validated by a human operator before it can influence a plan —
this human gate is part of the product's safety thesis. v1's workbench (two-pane: PDF preview
beside three sub-tabs) is the proven UX; its storage model (validation as index-arrays inside a
JSONB blob, whole-state overwrites, concurrent-edit desync) is the anti-pattern. With REMI-031's
row-per-item model, validation becomes per-row state changes with audit attribution.

## Required steps

1. Two-pane workbench in `apps/admin`: signed-URL PDF preview beside three tabs — Supplements,
   Genotypes, Recommendations — with live processing status per extraction while jobs run.
2. Supplements: per-row validate / inline edit / delete / add-manual / validate-all.
3. Genotypes: same actions with vocabulary-constrained values (APOE ∈ {E2/E2…E4/E4, E2/E4};
   DIO2/AMY1A ∈ {A, H, M}), plus the explicit **skip-genotypes** action.
4. Recommendations: free-text editing seeded from the parsed markdown, one-shot validate.
5. Every action is a targeted per-row mutation (no whole-state POSTs), attributed in the audit
   trail (who validated what, when); concurrent edits behave sanely (optimistic concurrency or
   row locking — pick and document).
6. The "fully validated" derived state (all supplements + genotypes-or-skipped + recommendations)
   is computed server-side — it is the hard gate REMI-033/034 read.
7. Operator-only authorization on every action.

## Acceptance criteria

- [ ] An operator can take a parsed document from extraction to fully-validated entirely in the
      workbench, per-row, with edits and manual additions.
- [ ] Every validation action appears in the audit trail with the actor.
- [ ] Two operators editing simultaneously cannot silently overwrite each other.
- [ ] The fully-validated gate flips only when the server-side rule says so.

## Agent prompt

```text
Work in the remi-ai monorepo. Enter through the delivery pipeline per CLAUDE.md. Read
CONVENTIONS.md, apps/admin/AGENTS.md, then docs/v1-report.md §4's Documents bullet (the proven
workbench UX) and §8.4 (the storage anti-pattern this port fixes).

Build the document-validation workbench in apps/admin against the row-per-item extraction model:
1. Layout: per-patient Documents view; two panes — PDF preview via short-lived signed URL beside
   tabs for Supplements / Genotypes / Recommandations; while extractions run, show real per-stage
   status from the job table with polling or streaming.
2. Supplements tab: rows {name, dosage, frequency} with per-row validate, inline edit, delete,
   add-manual, and validate-all. Genotypes tab: rows {code, value} with values constrained to
   the model vocabularies (APOE: E2/E2, E2/E3, E2/E4, E3/E3, E3/E4, E4/E4; DIO2/AMY1A: A, H, M),
   same actions plus an explicit skip-genotypes control. Recommendations tab: free-text seeded
   from the parsed markdown with a one-shot validate.
3. Every action is a server action mutating ONLY its row (or the skip/validate-all set),
   guarded by operator authorization, writing an AuditEntry (actor, action, row, timestamp), and
   using optimistic-concurrency (updatedAt check) so concurrent operators get a conflict, not a
   silent overwrite.
4. Compute "fully validated" (all supplement rows validated AND (all genotype rows validated OR
   genotypes skipped) AND recommendations validated) server-side as the single derived gate the
   plan-generation feature will read; expose it in the UI.
5. Design-system components; the admin app's working-language conventions apply (check
   apps/admin/AGENTS.md).
Tests for the gate computation and concurrency behaviour. Run tests only; push and open a PR
through the pipeline gates.
```
