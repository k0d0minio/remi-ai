# Intake — the ordered backlog

> This folder follows the estate-wide ticket standard (canonical spec:
> `_system/contracts/TICKETS.md` in the icm-board repo; working knowledge:
> `.claude/skills/ticket-craft/`). Related work is an **epic** — a folder holding a
> `breakdown.md` and one sequenced stub per unit of work; one-off findings are **triage stubs**
> under [`triage/`](triage/). Identity is the path — no ticket numbers. Done is a folder move:
> the PR that implements a stub `git mv`'s it to `_done/`, never a follow-up sweep. The admin
> dashboard's tickets board reads this folder from `main`.

## The backlog

| Epic                                               | What it is                                                                                                                                     |
| -------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| [`patient-record/`](patient-record/breakdown.md)   | The manual patient record, deepened — consent, § A profile fields, structured anamnesis, goals, summary, supplements. Admin + data layer only. |
| [`patient-surface/`](patient-surface/breakdown.md) | The content tools and the multi-page patient link — pantry essentials, recipe library, meal journal, `/p/[token]` segments.                    |

Run `patient-record` first: `patient-surface`'s link segments render its tables. Both epics are
cut from Morgane's v2 structure brainstorm
([`.icm/docs/collaboration/remi-v2-structure-brainstorm.docx`](../docs/collaboration/remi-v2-structure-brainstorm.docx)),
manual-first — **no AI in this round**; the decisions of record that bind both live in
[`patient-record/breakdown.md § Decisions`](patient-record/breakdown.md).

One-off findings sit in [`triage/`](triage/); finished ones in its `_done/`.

## Open questions are deliberate

Every stub carries an **"Open questions — flag these on pickup"** section, and every prompt ends
by telling the agent to raise those questions rather than answer them. That is on purpose: a
number of things the source documents do not settle — a vocabulary Morgane has not confirmed, a
visibility choice only she can make — would be decided by accident if an implementation just
picked one.

So the rule for anyone picking up a stub: **do the work that does not depend on the open question;
raise the question; do not invent an answer and bury it in code.** Where an assumption is
unavoidable to make progress, state it in the PR body.

## Where the previous backlog went

The numbered REMI-NNN tickets (phases A–F, cut 18 Aug 2026 from the direction report) were purged
in the 28 Aug clean slate (commit 444ecf5) after
[`new-development-direction.docx`](../docs/new-development-direction.docx) superseded their
sequencing — terrain-first, patient experience before the practitioner space. They remain
recoverable in git history.

## Four facts that keep getting re-invented

Worth knowing before reading any older document in this repository:

1. **There is no signed pilot.** ~15 practitioners is a beta **recruitment target**. Nobody has
   signed anything.
2. **There is no billing date and no revenue.** The "€24.50/practitioner/month from 1 September
   2026" was demo fixture data that an earlier audit read as a contract.
3. **The database question is closed — Neon.** The braindump named Supabase; the owner settled on
   Neon on 27 August 2026, and it is connected.
4. **V2 is not a port of v1.** The 7-day food diary, the psychological questionnaire, the
   nutrigenomics engine and rigid weekly plan generation are all out of scope.

The precedence order between documents is in [`.icm/docs/README.md`](../docs/README.md).
