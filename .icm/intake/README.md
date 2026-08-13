# Intake — the ordered backlog to bring Remi AI to production level

> This folder follows the estate-wide ticket standard (`.icm/intake/`, canonical spec:
> `_system/TICKETS-SPEC.md` in the Apps estate). Estate conventions on top of the ticket
> format described below: an optional `Status` row (`ready` → `today` → `in-progress` →
> `blocked`; missing = `ready`; `today` marks the day's worklist), and finished tickets
> are `git mv`'d to `_done/` rather than edited. `## Agent prompt` is the accepted alias
> for the standard's `## Prompt` section. The admin dashboard's tickets board reads this
> folder from `main`.

This folder is the actionable translation of three documents into tickets:

- [`.icm/docs/audit-report.md`](../docs/audit-report.md) — the pre-build audit of this monorepo (findings F-01–F-48, decisions D-1–D-8)
- [`.icm/docs/v1-report.md`](../docs/v1-report.md) — the analysis of the deleted Lovable v1; the product spec for the feature port
- [`.icm/docs/info-gathering.md`](../docs/info-gathering.md) — the requests and decisions pending from Morgane and Arnaud (REQ-01–REQ-39)

Every ticket is one actionable unit of work with a problem statement, required steps, acceptance
criteria, and a **prompt** that can be pasted into a fresh Claude Code session to do the work.
Tickets are numbered in execution order; dependencies are explicit. Work them top to bottom unless
a ticket's **Blocked by** row says an owner decision or external input is still missing.

## How to use a ticket

1. Check **Depends on** (earlier tickets) and **Blocked by** (owner decisions / external inputs —
   these map to `.icm/docs/info-gathering.md`). Don't start a blocked ticket.
2. Hand the **Agent prompt** section to a Claude Code session, or work through the steps yourself.
3. A ticket is done when every acceptance criterion is checked and the PR is merged.
4. This repo routes feature work through the delivery pipeline (`CLAUDE.md` → "How work gets done
   here"). Phase 4 tickets should enter as `/pipeline` features; Phase 0–3 tickets are mostly
   chores/foundation work and can run through the chore lane or directly, as the prompt says.

## Phases

| Phase                        | Tickets | Theme                                                                             | Gate to the next phase                                                                       |
| ---------------------------- | ------- | --------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| **0 — Close the live risks** | 001–007 | Exposure, honesty, and safety issues that are live today. Days, not weeks.        | No confidential content reachable; contact channel records submissions; merges are protected |
| **1 — Foundation**           | 008–017 | Test harness, error tracking, cleanups. Makes everything after it safe to build.  | Tests gate every PR; a production crash is visible                                           |
| **2 — Data model & seams**   | 018–021 | The entities and interfaces real data will live in. All before the first adapter. | Schema and seams reviewed and merged                                                         |
| **3 — Infrastructure**       | 022–026 | Database, auth, headers, billing, GDPR. The decisions-heavy phase.                | Real persistence + real sign-in exist; legal groundwork done                                 |
| **4 — Feature port from v1** | 027–039 | The product itself, in dependency order per `.icm/docs/v1-report.md` §9.2.        | The pilot can run on it                                                                      |

## Owner decisions that gate tickets

These cannot be made by an agent. Each is written out in `.icm/docs/audit-report.md` §7,
`.icm/docs/v1-report.md` §9.3 and indexed in `.icm/docs/info-gathering.md` §I.

| Decision        | Question                                                | Gates tickets                            |
| --------------- | ------------------------------------------------------- | ---------------------------------------- |
| D-1 — answered  | Deployment protection on admin; docs public or private? | 001 — done                               |
| D-v1-2 / REQ-30 | Is REMI patient-facing, practitioner-facing, or both?   | 027–039 (scoping of every ported screen) |
| D-v1-1 / REQ-12 | What happens to the Python meal-plan API?               | 033, 034                                 |
| D-2             | Database vendor — Neon or Supabase?                     | 022                                      |
| D-3             | Auth implementation for the magic-link shape?           | 023                                      |
| D-4             | How does billing happen on 1 September?                 | 025                                      |
| D-5             | Pseudonymise before the AI provider? + DPAs             | 026, 034                                 |
| D-6             | Which domain is the real one?                           | 015                                      |
| REQ-26          | The original FunMedDev genotype source table            | 028                                      |
| REQ-21          | Legal validation of the CGV / privacy policy            | 039                                      |

## Ticket index

Finished tickets keep their place in the order, marked **done** and linked into
[`_done/`](_done/) — the sequence is easier to read when what has already happened is still visible.

### Phase 0 — Close the live risks

- **done** · [REMI-001](_done/REMI-001-admin-docs-exposure.md) — Verify deployment protection on admin; settle docs-site visibility
- **done** · [REMI-002](_done/REMI-002-remove-confidential-content.md) — Remove confidential negotiation content from the admin app
- **done** · [REMI-003](_done/REMI-003-deidentify-fixtures.md) — De-identify fixtures: fictional practitioner, reserved email domains
- [REMI-004](REMI-004-contact-form-delivery.md) — Give the contact form delivery and a record
- [REMI-005](REMI-005-branch-protection-ci-gaps.md) — Branch protection, required checks, squash merge; close the docs-only check gap
- [REMI-006](REMI-006-drift-batch.md) — Fix the documentation drift batch
- [REMI-007](REMI-007-dev-session-prod-guard.md) — Make the development session refuse to run in production

### Phase 1 — Foundation

- [REMI-008](REMI-008-test-harness.md) — Stand up the test harness before the first adapter
- [REMI-009](REMI-009-error-tracking.md) — Wire error tracking and the crash safety nets
- [REMI-010](REMI-010-dead-export-cleanup.md) — Delete dead exports; write down the seam exception
- [REMI-011](REMI-011-version-catalogue.md) — Consolidate version pins into the shared catalogue
- [REMI-012](REMI-012-accessibility-batch.md) — Accessibility batch: skip links, language attributes, root 404s
- [REMI-013](REMI-013-public-surface-polish.md) — Public-surface polish: social image and robots files
- [REMI-014](REMI-014-preview-crosslinks.md) — Stop preview deployments cross-linking to production
- [REMI-015](REMI-015-domain-consolidation.md) — Consolidate on the real domain
- [REMI-016](REMI-016-rollback-runbook.md) — Write the rollback runbook
- [REMI-017](REMI-017-dependency-updates.md) — Enable automated dependency updates

### Phase 2 — Data model & seams

- [REMI-018](REMI-018-model-missing-entities.md) — Model the missing entities (CareRelationship, consent, audit, AI generation, v1 schema)
- [REMI-019](REMI-019-extend-db-seam.md) — Extend the database seam: sort, range, batch, scoped queries
- [REMI-020](REMI-020-redesign-ai-seam.md) — Redesign the AI seam for structured, audited generation
- [REMI-021](REMI-021-promote-admin-entities.md) — Promote the admin console's entities into the shared model layer

### Phase 3 — Infrastructure

- [REMI-022](REMI-022-database-adapter.md) — Choose the database vendor and land the first adapter
- [REMI-023](REMI-023-real-authentication.md) — Real authentication: magic links through the session seam
- [REMI-024](REMI-024-security-headers.md) — Security headers on the authenticated surfaces
- [REMI-025](REMI-025-billing.md) — Billing for 1 September
- [REMI-026](REMI-026-gdpr-groundwork.md) — GDPR groundwork: DPAs, retention, pseudonymisation

### Phase 4 — Feature port from v1

- [REMI-027](REMI-027-psych-scoring-engine.md) — Psychological scoring engine (Nutrition Mindset, 7 profiles)
- [REMI-028](REMI-028-genotype-engine.md) — Nutrigenomic interpretation engine (ApoE × DIO2 × AMY1A)
- [REMI-029](REMI-029-onboarding-consent.md) — Onboarding funnel with real consent capture
- [REMI-030](REMI-030-profile-allergens.md) — Patient profile: biology, allergens, intolerances, preferences
- [REMI-031](REMI-031-document-pipeline.md) — Medical document pipeline: upload, parse, extract
- [REMI-032](REMI-032-validation-workbench.md) — Admin validation workbench for extracted medical data
- [REMI-033](REMI-033-supplement-calendar.md) — Supplement calendar generation
- [REMI-034](REMI-034-plan-generation.md) — Weekly plan generation and the Guardian validation loop
- [REMI-035](REMI-035-program-page.md) — Program page: meals, skip/regenerate, shopping list
- [REMI-036](REMI-036-weekly-feedback.md) — Weekly feedback, adherence medals, and the advice bank
- [REMI-037](REMI-037-discovery-diary.md) — The 7-day discovery diary
- [REMI-038](REMI-038-admin-console.md) — Admin console: user list and per-patient operations
- [REMI-039](REMI-039-legal-pages.md) — Legal pages: CGV and privacy policy

## Conventions used in tickets

- **Type**: `config` (settings outside the repo), `chore`, `feature`, `decision-support`
  (prepares an owner decision), `owner` (owner/legal work an agent can only support).
- **Size** uses the audit's estimates: minutes / hours / a day / days / a week+.
- **Sources** cite the finding (F-nn), decision (D-n) or v1-report section each requirement
  comes from — read the cited section before starting; the ticket summarises, the source governs.
