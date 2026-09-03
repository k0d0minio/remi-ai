# `.icm/docs` — the project's source of truth

Everything that decides **what REMI is** lives here. Code rules stay in
[`CONVENTIONS.md`](../../CONVENTIONS.md); delivery mechanics stay in
[`pipeline/`](../../pipeline/). This folder is the product knowledge, and the ordered backlog next
to it in [`.icm/intake/`](../intake/README.md) is cut from it.

There is no root `docs/` folder any more — it moved here on 18 August 2026, so that one directory
holds both the knowledge and the work derived from it.

## Precedence

When two documents disagree, the one higher in this list wins. This ordering is the whole point of
the folder.

Row **3?** is a **proposal, not a decision.** `remi-v2-structure-brainstorm.docx` arrived after the
table was last settled (commit b9c8dc6, 1 September 2026) and has to rank somewhere. It is proposed
above the braindump because it is Morgane's own material, newer, and far more precise on how the V2
is structured; it is proposed below 1 and 2, which settle sequencing and the working rhythm. Until
she or Arnaud confirms that, treat the rank as provisional and say so where it decides something.
Confirming it means renaming `3?` to `3`, or moving the row and renumbering.

| #   | Source                                                                                               | What it settles                                                                                                                                                                |
| --- | ---------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1   | [`new-development-direction.docx`](new-development-direction.docx)                                   | **The current direction** (from Morgane & Arnaud, adopted 27 Aug 2026): terrain-first, patient experience before the practitioner space, FunMedDev test 1 Dec, open day 19 Dec |
| 2   | [`call-summary.pdf`](call-summary.pdf)                                                               | The 25 Aug team call: Slack working rhythm, the beta patient-profile admin due Friday 29 Aug, weekly Friday calls, access list (GoDaddy, DigitalOcean, emails)                 |
| 3?  | [`collaboration/remi-v2-structure-brainstorm.docx`](collaboration/remi-v2-structure-brainstorm.docx) | **Proposed rank — the owner confirms it in the PR.** How the V2 is structured (Morgane, Sept 2026): the ten data blocks, the weekly loop, § 7's what-not-to-build              |
| 4   | [`braindump/`](braindump/)                                                                           | What REMI is: vision, positioning, the V2 feature ideas, business model. **On sequencing and priorities, 1–2 win.**                                                            |
| 5   | [`remi-status-report.html`](remi-status-report.html)                                                 | The 18 Aug plan (Phases A–F). **Its phase ordering is superseded by 1** — the backlog has been re-cut.                                                                         |
| 6   | [`correspondence/`](correspondence/)                                                                 | What Morgane actually asked for, in her words                                                                                                                                  |
| 7   | [`ENV.md`](ENV.md)                                                                                   | Environment variables and secrets — the only catalogue                                                                                                                         |
| 8   | [`RETENTION.md`](RETENTION.md)                                                                       | What is held about a patient, what deleting removes, what the audit trail keeps, and how long ended patients are kept                                                          |
| 9   | [`history/`](history/)                                                                               | Engineering findings and the v1 record. **Superseded wherever it touches direction.**                                                                                          |

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

Three binary documents, added 1 September 2026 (commit b9c8dc6). They are not diffable and not
edited here — they are read, and quoted like the braindump.

- [`remi-v2-structure-brainstorm.docx`](collaboration/remi-v2-structure-brainstorm.docx) —
  Morgane's patient-first structure for the V2, in French, and the newest statement of what she
  wants built. The flow (questionnaire → recorded consultation → REMI extracts → practitioner
  validates → patient output → weekly follow-up), the ten data blocks — `PATIENT_PROFILE`,
  `ANAMNESIS`, `PATIENT_SUMMARY`, `PRIORITY_GOALS`, `PRACTITIONER_INSTRUCTION`, `RECOMMENDATIONS`,
  `SUPPLEMENTS`, `PANTRY_ESSENTIALS`, `RECIPES`, `PATIENT_OUTPUT` — the weekly photo → feedback →
  new-recipes loop, and § 7, the list of what is deliberately **not** being built now. The
  [`patient-record/`](../intake/patient-record/breakdown.md) and
  [`patient-surface/`](../intake/patient-surface/breakdown.md) epics are cut from it. It carries a
  precedence row, and that row's rank is a proposal — see above.
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
