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

| Epic                                                           | What it is                                                                                                                                                      |
| -------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [`practitioner-workflow/`](practitioner-workflow/breakdown.md) | The console follows the consultation — at-a-glance page, bulk entry, recipes in place, reuse, one post-consultation screen, details behind the working view.    |
| [`patient-loop/`](patient-loop/breakdown.md)                   | The link the patient writes into — token read + write, today's home, « Je vais manger / J'ai mangé », recipe feedback, profile edit, check-ins and progression. |
| [`nutrition-knowledge/`](nutrition-knowledge/breakdown.md)     | What REMI knows about food — CIQUAL imported and queryable, Morgane's own nutrition rules authored, validated and retrieved by tag.                             |
| [`ai-assist/`](ai-assist/breakdown.md)                         | The model arrives — Mistral behind the seam, meal suggestions to the patient, recipe generation into the library, a summary draft for Morgane; one P2 parked.   |
| [`beyond-december/`](beyond-december/breakdown.md)             | The old version's flows that are right and not for now — accounts, autonomous patient + PDF, practitioner space, photos, groups, genotype. All P2.              |

Order: **`practitioner-workflow` → `patient-loop` → `ai-assist`**; `nutrition-knowledge` runs
alongside the first two and gates `ai-assist/recipe-generation`. `practitioner-workflow` and
`patient-loop` share tables but no components, so they can run side by side once each trunk stub
has landed. Nothing in `beyond-december` is "next" until the owner moves it. The target is
Morgane's § 9 — "utilisable pour moi" — in November, and a patient experience FunMedDev's team can
test on 1 December.

One-off findings sit in [`triage/`](triage/); finished ones in its `_done/`.

## Milestones

Dated 2026-09-11 (decision #15 in
[`practitioner-workflow/breakdown.md`](practitioner-workflow/breakdown.md)), for the call with
Morgane and Arnaud that day. The two fixed points come from the direction letter: FunMedDev's team
tests on **1 December**, the open day is **19 December**. Everything else is derived backwards at
one stub a day, one person, agents in parallel where the epics allow it. A missed date is reported
on the Friday call, not absorbed silently.

| By            | Milestone                                                   | Stubs                                                                                                                     |
| ------------- | ----------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| 30 September  | **Console usable for Morgane** — her § 9.1 to 9.4           | `practitioner-workflow/*` (copy-context, bulk-entry, recipe-in-place, reuse-and-duplicate, consultation-update, secondary-sections) |
| 15 October    | **The patient writes into the link** — home, meals, recipes | `patient-loop/link-writes`, `patient-home-today`, `meal-entry`, `recipe-feedback-and-favourites`                          |
| 31 October    | **REMI answers a meal** — Mistral live, her knowledge in    | `nutrition-knowledge/*`, `ai-assist/mistral-adapter`, `meal-suggestions` · `free-text-to-rows` P2 re-examined here        |
| 15 November   | **REMI proposes recipes** — the loop closes                 | `ai-assist/recipe-generation`, `summary-draft`, `patient-loop/patient-profile-edit`, `check-in-and-progression`           |
| 30 November   | **Freeze** — fixes only until the open day                  | triage                                                                                                                    |
| 1 December    | FunMedDev's team tests                                      | —                                                                                                                         |
| 19 December   | Open day                                                    | —                                                                                                                         |

Mistral starts mid-October by choice, not by capacity (decision #14): a suggestion needs a meal
entry to land in, and a generated recipe needs the library-and-assign path. Until then Morgane
tests generation through `copy-context` with the model she already uses.

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
