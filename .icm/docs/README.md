# `.icm/docs` — the project's source of truth

Everything that decides **what REMI is** lives here. Code rules stay in
[`CONVENTIONS.md`](../../CONVENTIONS.md); delivery mechanics stay in
[`.icm/CONTEXT.md`](../CONTEXT.md). This folder is the product knowledge, and the ordered
backlog next to it in [`.icm/intake/`](../intake/README.md) is cut from it.

There is no root `docs/` folder any more — it moved here on 18 August 2026, so that one directory
holds both the knowledge and the work derived from it.

## Precedence

When two documents disagree, the one higher in this list wins. This ordering is the whole point of
the folder.

Row **4?** is a **proposal, not a decision.** `remi-v2-structure-brainstorm.docx` arrived after the
table was last settled (commit b9c8dc6, 1 September 2026) and has to rank somewhere. It is proposed
above the braindump because it is Morgane's own material, newer, and far more precise on how the V2
is structured; it is proposed below 1–3, which settle sequencing and the working rhythm. Until she
or Arnaud confirms that, treat the rank as provisional and say so where it decides something.
Confirming it means renaming `4?` to `4`, or moving the row and renumbering.

Row **1** moved on 10 September 2026: Morgane's feedback on the first version outranks the
direction letter because it is newer, hers, and explicitly reaffirms that letter's method
(terrain-first, patient experience, December) while correcting one thing in it — the practitioner
console is not "later": she cannot run the field test on a console she cannot encode into. Where
the two disagree, the feedback wins (Jamie's call, 2026-09-10).

| #   | Source                                                                                                                                                                                             | What it settles                                                                                                                                                                                                                                                                       |
| --- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | [`collaboration/remi-v2-feedback-on-first-version.docx`](collaboration/remi-v2-feedback-on-first-version.docx) + [`correspondence/03-feedback-on-first-version.md`](correspondence/03-feedback-on-first-version.md) | **What must change before Morgane can use REMI daily** (10 Sept 2026): the console follows her consultation workflow, bulk entry, the patient page carries « Je vais manger / J'ai mangé », recipes and feedback; AI-carried features tested now. Wins over 2 where they disagree. |
| 2   | [`new-development-direction.docx`](new-development-direction.docx)                                                                                                                                 | **The method** (from Morgane & Arnaud, adopted 27 Aug 2026): terrain-first, patient experience before a full practitioner space, FunMedDev test 1 Dec, open day 19 Dec                                                                                                                |
| 3   | [`call-summary.pdf`](call-summary.pdf)                                                                                                                                                             | The 25 Aug team call: Slack working rhythm, the beta patient-profile admin due Friday 29 Aug, weekly Friday calls, access list (GoDaddy, DigitalOcean, emails)                                                                                                                         |
| 4?  | [`collaboration/remi-v2-structure-brainstorm.docx`](collaboration/remi-v2-structure-brainstorm.docx)                                                                                               | **Proposed rank — the owner confirms it in the PR.** How the V2 is structured (Morgane, Sept 2026): the ten data blocks, the weekly loop, § 7's what-not-to-build                                                                                                                      |
| 5   | [`collaboration/remi-v2-explication-systeme.docx`](collaboration/remi-v2-explication-systeme.docx)                                                                                                 | **The old version's product logic** (Morgane, filed 10 Sept 2026): practitioner onboarding, invitation, patient onboarding, « Je vais manger / J'ai mangé », check-ins, recipes, autonomous patient. A source of _flows to learn from_, never a spec to reproduce — her own words.       |
| 6   | [`braindump/`](braindump/)                                                                                                                                                                         | What REMI is: vision, positioning, the V2 feature ideas, business model. **On sequencing and priorities, 1–3 win.**                                                                                                                                                                    |
| 7   | [`remi-status-report.html`](remi-status-report.html)                                                                                                                                               | The 18 Aug plan (Phases A–F). **Its phase ordering is superseded by 1–2** — the backlog has been re-cut, twice.                                                                                                                                                                        |
| 8   | [`correspondence/`](correspondence/)                                                                                                                                                               | What Morgane actually asked for, in her words (03 is also row 1's covering message)                                                                                                                                                                                                   |
| 9   | [`ENV.md`](ENV.md)                                                                                                                                                                                 | Environment variables and secrets — the only catalogue                                                                                                                                                                                                                                |
| 10  | [`RETENTION.md`](RETENTION.md)                                                                                                                                                                     | What is held about a patient, what deleting removes, what the audit trail keeps, and how long ended patients are kept                                                                                                                                                                  |
| 11  | [`history/`](history/)                                                                                                                                                                             | Engineering findings and the v1 record. **Superseded wherever it touches direction.**                                                                                                                                                                                                  |

## The contents

### `braindump/` — the source of truth

Morgane's 40 documents, received 18 August 2026, in French, organised as she wrote them:
`vision-strategy/`, `business/`, `developpement-produit/`, `marketing-growth/`, `roadmap/`,
`idees-opportunites/`, `journal-du-createur/`. Nothing in this folder is edited — it is her
material, and it is quoted, never rewritten.

The five pages the rest of the project leans on most:

- [`roadmap/court-term.md`](braindump/roadmap/court-term.md) — what the V2 must do in the next months
- [`roadmap/features.md`](braindump/roadmap/features.md) — the V2 feature set, patient and practitioner
- [`developpement-produit/ai.md`](braindump/developpement-produit/ai.md) — the parser, micro-action generation, and the "Supabase + targeted AI calls + cost control" architecture
- [`business/pricing.md`](braindump/business/pricing.md) — €39/€79/€199 practitioner tiers, ~€9.99 patient premium (proposals, not final)
- [`developpement-produit/tests.md`](braindump/developpement-produit/tests.md) — what the FunMedDev patient tests actually taught

### `collaboration/` — the material written with and for Morgane and Arnaud

Five binary documents: three added 1 September 2026 (commit b9c8dc6), two on 10 September 2026.
They are not diffable and not edited here — they are read, and quoted like the braindump.

- [`remi-v2-feedback-on-first-version.docx`](collaboration/remi-v2-feedback-on-first-version.docx) —
  **row 1.** Morgane's verdict on the first console (10 September 2026), in French: the data
  structure is right, the interaction layer is not usable — a page built around encoding, not
  around her consultation work (understand → decide → act → follow). Nine sections: what is
  positive; the encoding problem; the three experiences to separate (admin console, practitioner
  space, patient page); the at-a-glance first screen; bulk entry before any AI; the patient page as
  the November priority (« Je vais manger » / « J'ai mangé »); recipe generation from profile +
  recommendations with a check before display; meal suggestions as the central workflow; and § 9,
  her definition of "usable for me". The [`practitioner-workflow/`](../intake/practitioner-workflow/breakdown.md),
  [`patient-loop/`](../intake/patient-loop/breakdown.md), [`nutrition-knowledge/`](../intake/nutrition-knowledge/breakdown.md)
  and [`ai-assist/`](../intake/ai-assist/breakdown.md) epics are cut from it.
- [`remi-v2-explication-systeme.docx`](collaboration/remi-v2-explication-systeme.docx) — **row 5.**
  The product logic of the version Morgane built before this repository: practitioner sign-up →
  admin approval → Stripe → active; add patient → raw notes → « Structurer avec IA » → invite by
  email; patient onboarding (profile, diet, allergies, cooking time, budget, 3 months free); the
  home with « Je vais manger / J'ai mangé », quick feedback and a check-in every 1–2 days; the
  recommendations page as the reference the AI personalises from; 7-day recipe generation with
  favourites; the autonomous FunMedDev patient who imports a PDF. She asks that it not be
  reproduced as is — its flows are inputs, and the [`beyond-december/`](../intake/beyond-december/breakdown.md)
  epic parks the ones not built now.
- [`remi-v2-structure-brainstorm.docx`](collaboration/remi-v2-structure-brainstorm.docx) —
  Morgane's patient-first structure for the V2, in French, and until 10 September the newest
  statement of what she wanted built. The flow (questionnaire → recorded consultation → REMI
  extracts → practitioner validates → patient output → weekly follow-up), the ten data blocks —
  `PATIENT_PROFILE`, `ANAMNESIS`, `PATIENT_SUMMARY`, `PRIORITY_GOALS`, `PRACTITIONER_INSTRUCTION`,
  `RECOMMENDATIONS`, `SUPPLEMENTS`, `PANTRY_ESSENTIALS`, `RECIPES`, `PATIENT_OUTPUT` — the weekly
  photo → feedback → new-recipes loop, and § 7, the list of what is deliberately **not** being
  built now. The shipped [`patient-record/`](../intake/_done/patient-record/breakdown.md) and
  [`patient-surface/`](../intake/_done/patient-surface/breakdown.md) epics were cut from it. It
  carries a precedence row, and that row's rank is a proposal — see above.
- [`pitch-deck.pptx`](collaboration/pitch-deck.pptx) — twelve slides for the September 2026 Fagron
  Genomics discussion: why REMI exists, the product model, real-life personalisation, market
  sizing, the 2026 → 2027/28 roadmap, the team, and four backup slides held for the open discussion.
- [`fagron-meeting-playbook.docx`](collaboration/fagron-meeting-playbook.docx) — the rehearsal
  script for that meeting: per-slide speaker, timing, objective and wording, the three messages,
  and the stated best-case and minimum-acceptable outcomes.

The deck and the playbook are **outward-facing preparation, not sources of direction** — they say
how REMI is presented, not what gets built — so neither has a precedence row. Where the deck's
roadmap and the documents above it disagree, the documents above it win.

### `remi-status-report.html` — the direction report

Written 18 August 2026 from the braindump. Reads the whole of it, answers Morgane's two emails,
states plainly where the build diverged from her vision, and proposes **Phases A–F**, which are
what [`.icm/intake/`](../intake/README.md) is cut from. Part five is the short list of what is
still needed from her.

### `correspondence/`

- [`01-startup-boost.md`](correspondence/01-startup-boost.md) — the Startup Boost call and its criteria
- [`02-onenote-and-tools.md`](correspondence/02-onenote-and-tools.md) — the OneNote handover and the tools question (Supabase, DigitalOcean, Mistral, Euria)
- [`03-feedback-on-first-version.md`](correspondence/03-feedback-on-first-version.md) — the covering message for row 1: the console is unusable as it stands, the old version's logic is to be learned from not reproduced, AI-carried features tested now

### `RETENTION.md`

The written answer to "what do you hold about me, and what happens if I ask you to delete it?" —
the data a patient profile carries, what the deletion cascade removes, what the audit trail keeps
on purpose, and how long an `ended` patient is kept. It describes what the code does, so a change
to the cascade or to the trail changes this file in the same PR.

### `ENV.md`

The single catalogue of environment variables and secrets. The three-list rule
(`CONVENTIONS.md`) binds it to the zod schema in `packages/services` and `globalEnv` in
`turbo.json`: a variable that is not in all three does not exist.

### `history/` — retained, but not authoritative on direction

| File                                             | Still load-bearing for                                                             | Superseded on                                                      |
| ------------------------------------------------ | ---------------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| [`audit-report.md`](history/audit-report.md)     | Code-level findings F-01 … F-48, read out of the repository                        | What to build and in what order; anything about a pilot or billing |
| [`v1-report.md`](history/v1-report.md)           | The v1 estate (vendors, accounts, data), the schema/contract evidence, the defects | v1 as V2's spec — the porting map is retired                       |
| [`info-gathering.md`](history/info-gathering.md) | The full inventory of accesses and documents still needed                          | Every row that rested on a signed pilot — struck in place          |

**What was wrong in them.** All three were written before the braindump, and an earlier audit read
demo fixture data in the admin console as fact: a signed pilot of fifteen practitioners at
€24.50/month with billing from 1 September 2026. None of that existed. The ~15 practitioners are a
**beta-recruitment target**. Those claims have been struck from these files rather than quietly
edited, so the correction stays visible. The database question is likewise closed — though not the
way the braindump has it: the braindump names Supabase, and the owner settled on **Neon** on
27 August 2026.
