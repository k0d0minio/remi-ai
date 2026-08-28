# Intake — the ordered backlog

> This folder follows the estate-wide ticket standard (`.icm/intake/`, canonical spec:
> `_system/contracts/TICKETS.md` in the Apps estate). One markdown ticket per unit of work,
> each with a pasteable agent prompt; finished tickets are `git mv`'d to `_done/` by the PR
> that implements them. The admin dashboard's tickets board reads this folder from `main`.

## Where these tickets come from

Morgane's braindump landed on 18 August 2026 and is the **source of truth** for what REMI is
([`.icm/docs/braindump/`](../docs/braindump/) — 40 documents on vision, positioning, pivots, the
V2 feature set, business model, roadmap and priorities). The direction report read the whole of it
and proposed six phases: [`.icm/docs/remi-status-report.html`](../docs/remi-status-report.html)
§ "A new plan".

**REMI-007 … REMI-033 are those phases, cut into tickets.** The 33 tickets that lived here before
were derived from the pre-build audit and the v1 analysis, both written from assumptions the
braindump superseded — most visibly a "signed pilot billing from 1 September" that was demo fixture
data. They were wiped in one commit and remain recoverable in git history. The six tickets in
[`_done/`](_done/) are kept: they record work that actually merged, and none of it is invalidated.

## The phases

| Phase | What it is                                       | Tickets        |
| ----- | ------------------------------------------------ | -------------- |
| **A** | Decide and clear the ground — days               | REMI-007 … 012 |
| **B** | Foundation — 1–2 weeks                           | REMI-013 … 017 |
| **C** | The patient core loop — the heart of V2          | REMI-018 … 022 |
| **D** | The practitioner dashboard — the strategic build | REMI-023 … 027 |
| **E** | The parser — the proprietary core                | REMI-028, 029  |
| **F** | Money and the beta — validation                  | REMI-030 … 032 |
| **∥** | Startup Boost, in parallel with A/B              | REMI-010, 033  |

### Phase A · Decide & clear the ground

| Ticket                                         | What                                                     |
| ---------------------------------------------- | -------------------------------------------------------- |
| [REMI-007](_done/REMI-007-adopt-supabase.md)   | Dropped — the answer is Neon, not Supabase               |
| [REMI-008](REMI-008-freeze-v2-scope.md)        | Freeze the V2 scope; fix the docs that contradict it     |
| [REMI-009](REMI-009-estate-footprint.md)       | Decide how much of the six-app estate survives           |
| [REMI-010](REMI-010-startup-boost-gates.md)    | Startup Boost eligibility gates and go / no-go           |
| [REMI-011](REMI-011-v1-estate.md)              | Settle the v1 estate — old data first, then the accounts |
| [REMI-012](REMI-012-tool-and-cost-register.md) | Build the tool and cost register                         |

### Phase B · Foundation

| Ticket                                             | What                                                    |
| -------------------------------------------------- | ------------------------------------------------------- |
| [REMI-013](_done/REMI-013-connect-supabase.md)     | Dropped — superseded by connecting Neon                 |
| [REMI-014](REMI-014-v2-data-model.md)              | Model the V2 loop                                       |
| [REMI-015](REMI-015-data-protection-groundwork.md) | Data-protection groundwork before the first real record |
| [REMI-016](REMI-016-test-harness.md)               | Stand up the test harness                               |
| [REMI-017](REMI-017-error-tracking.md)             | Wire error tracking and the missing safety nets         |

### Phase C · The patient core loop

| Ticket                                                  | What                                                       |
| ------------------------------------------------------- | ---------------------------------------------------------- |
| [REMI-018](REMI-018-patient-onboarding.md)              | Ultra-simple onboarding — a first micro-action immediately |
| [REMI-019](REMI-019-ameliore-mon-assiette.md)           | "Améliore mon assiette" — the central V2 feature           |
| [REMI-020](REMI-020-daily-hub.md)                       | The daily hub and "je mange autre chose"                   |
| [REMI-021](REMI-021-supplement-journal-and-tracking.md) | Smart supplement journal and micro-action tracking         |
| [REMI-022](REMI-022-ai-cost-discipline.md)              | AI cost discipline from day one                            |

### Phase D · The practitioner dashboard

| Ticket                                                   | What                                                      |
| -------------------------------------------------------- | --------------------------------------------------------- |
| [REMI-023](REMI-023-practitioner-cohort-view.md)         | Cohort view — adherence at a glance                       |
| [REMI-024](REMI-024-patient-detail-view.md)              | Per-patient detail view                                   |
| [REMI-025](REMI-025-remote-recommendation-adjustment.md) | Adjust recommendations remotely and regenerate guidance   |
| [REMI-026](REMI-026-practitioner-messaging.md)           | Quick feedback and group messages                         |
| [REMI-027](REMI-027-qr-invite-onboarding.md)             | QR and invite-link onboarding — the acquisition mechanism |

### Phase E · The parser

| Ticket                                                 | What                                                        |
| ------------------------------------------------------ | ----------------------------------------------------------- |
| [REMI-028](REMI-028-collect-practitioner-documents.md) | Collect the real practitioner document formats              |
| [REMI-029](REMI-029-recommendation-parser.md)          | The recommendation parser — documents into structured rules |

### Phase F · Money and the beta

| Ticket                                             | What                                                  |
| -------------------------------------------------- | ----------------------------------------------------- |
| [REMI-030](REMI-030-practitioner-subscriptions.md) | Practitioner subscriptions — first revenue            |
| [REMI-031](REMI-031-founding-practitioner-beta.md) | Recruit and onboard the ~15 founding practitioners    |
| [REMI-032](REMI-032-kpi-instrumentation.md)        | Instrument the KPIs                                   |
| [REMI-033](REMI-033-startup-boost-dossier.md)      | Write the Startup Boost dossier (if REMI-010 says go) |

## Open questions are deliberate

Every ticket carries an **"Open questions — flag these on pickup"** section, and every agent prompt
ends by telling the agent to raise those questions rather than answer them. That is on purpose:
the phases were proposed from the braindump before the owner had reviewed them, and a number of
things the braindump does not settle — how a meal is described, what counts as adherence, whether
patients can have two practitioners, what the AI provider is — would be decided by accident if an
implementation just picked one.

So the rule for anyone picking up a ticket: **do the work that does not depend on the open
question; raise the question; do not invent an answer and bury it in code.** Where an assumption is
unavoidable to make progress, state it in the PR body.

## Four facts that keep getting re-invented

Worth knowing before reading any older document in this repository:

1. **There is no signed pilot.** ~15 practitioners is a beta **recruitment target**. Nobody has
   signed anything.
2. **There is no billing date and no revenue.** The "€24.50/practitioner/month from 1 September
   2026" was demo fixture data that an earlier audit read as a contract.
3. **The database question is closed — Neon.** The braindump named Supabase; the owner settled on
   Neon on 27 August 2026 and it is being connected in a separate session. REMI-007 (record the
   Supabase decision) and REMI-013 (connect Supabase) were both dropped for that reason — see
   REMI-013's banner for the foundation work that went down with it and has not been re-cut.
4. **V2 is not a port of v1.** The 7-day food diary, the psychological questionnaire, the
   nutrigenomics engine and rigid weekly plan generation are all out of scope.

The precedence order between documents is in [`.icm/docs/README.md`](../docs/README.md).
