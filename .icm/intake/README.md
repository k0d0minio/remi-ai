# Intake — the ordered backlog

> This folder follows the estate-wide ticket standard (canonical spec:
> `_system/contracts/TICKETS.md` in the icm-board repo; working knowledge:
> `.claude/skills/ticket-craft/`). Related work is an **epic** — a folder holding a
> `breakdown.md` and one sequenced stub per unit of work; one-off findings are **triage stubs**
> under [`triage/`](triage/). Identity is the path — no ticket numbers. Done is a folder move:
> the PR that implements a stub `git mv`'s it to `_done/`, never a follow-up sweep. The admin
> dashboard's tickets board reads this folder from `main`.

## The backlog

Re-cut 2026-09-10 from Morgane's feedback on the first version
([`.icm/docs/collaboration/remi-v2-feedback-on-first-version.docx`](../docs/collaboration/remi-v2-feedback-on-first-version.docx),
precedence row 1). The decisions of record that bind all five epics live in
[`practitioner-workflow/breakdown.md § Decisions`](practitioner-workflow/breakdown.md).

| Epic                                                       | What it is                                                                                                                                                       |
| ---------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [`practitioner-workflow/`](practitioner-workflow/breakdown.md) | The console follows the consultation — at-a-glance page, bulk entry, recipes in place, reuse, one post-consultation screen, details behind the working view. |
| [`patient-loop/`](patient-loop/breakdown.md)               | The link the patient writes into — token read + write, today's home, « Je vais manger / J'ai mangé », recipe feedback, profile edit, check-ins and progression. |
| [`nutrition-knowledge/`](nutrition-knowledge/breakdown.md) | What REMI knows about food — CIQUAL imported and queryable, Morgane's own nutrition rules authored, validated and retrieved by tag.                               |
| [`ai-assist/`](ai-assist/breakdown.md)                     | The model arrives — Mistral behind the seam, meal suggestions to the patient, recipe generation into the library, a summary draft for Morgane; one P2 parked.    |
| [`beyond-december/`](beyond-december/breakdown.md)         | The old version's flows that are right and not for now — accounts, autonomous patient + PDF, practitioner space, photos, groups, genotype. All P2.               |

Order: **`practitioner-workflow` → `patient-loop` → `ai-assist`**; `nutrition-knowledge` runs
alongside the first two and gates `ai-assist/recipe-generation`. `practitioner-workflow` and
`patient-loop` share tables but no components, so they can run side by side once each trunk stub
has landed. Nothing in `beyond-december` is "next" until the owner moves it. The target is
Morgane's § 9 — "utilisable pour moi" — in November, and a patient experience FunMedDev's team can
test on 1 December.

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

## Where the previous backlogs went

Three epics shipped and sit in [`_done/`](_done/): `patient-record` and `patient-surface` (the
manual-first record and the read-only link, cut from the v2 structure brainstorm) and
`patient-workspace`, which was **dropped whole** on 2026-09-10 — a re-layout of the admin patient
page with nothing changed in what it does, superseded by Morgane's feedback that the page must be
rebuilt around her workflow. Each of its stubs carries a `> Dropped:` line; its research (R1–R30)
is still cited by `practitioner-workflow`.

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
4. **V2 is not a port of v1, nor of the old V2.** The 7-day food diary, the psychological
   questionnaire, the nutrigenomics engine and rigid weekly plan generation are all out of scope;
   the old V2's flows (`remi-v2-explication-systeme.docx`) are inputs to learn from, at Morgane's
   own request, never a spec.

The precedence order between documents is in [`.icm/docs/README.md`](../docs/README.md).
