> **2026-09-26 (icm-board decision D47):** the client's documents that lived here — the founder's braindump (`braindump/`), the collaboration decks and documents (`collaboration/`), the correspondence, the call summary, the new-development-direction note, the call transcripts under `.icm/processed/` and their originals under `.icm/raw/_processed/` — now live in icm-board at `workspaces/deals/remi-ai/remi-partnership/raw/` (documents/, transcripts/, originals/) and are purged from this repository. What remains here is what sessions wrote: `ENV.md`, `RETENTION.md`, `history/`, the status report. `.icm/raw/` and `.icm/processed/` are ignored working folders.

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

Row **5?** is a **proposal, not a decision.** `remi-v2-structure-brainstorm.docx` arrived after the
table was first settled (commit b9c8dc6, 1 September 2026) and has to rank somewhere. It is proposed
above the braindump because it is Morgane's own material and far more precise on how the V2 is
structured; it is proposed below 1–4, which settle sequencing and the working rhythm. Until she or
Arnaud confirms that, treat the rank as provisional and say so where it decides something.
Confirming it means renaming `5?` to `5`, or moving the row and renumbering.

Row **1** changed twice. On 10 September 2026 Morgane's feedback on the first version took it from
the direction letter, because it was newer, hers, and corrected one thing — the practitioner console
is not "later" (Jamie's call, 2026-09-10). On 23 September 2026 the **11 September call** — the
newest statement of direction by all three, with her **14 September answer** to what that call
asked of her — took it from the feedback (decision D-17, `.icm/intake/README.md`): the feedback
still speaks wherever the call is silent, and the call wins where they disagree. The transcript is
a machine's reading of a recording; anything a decision rests on was checked against the archived
original (`.icm/raw/_processed/`).

| #   | Source                                                                                                                                                                                                              | What it settles                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | [`../processed/2026-09-23-remi-ai-appel-11-sept.txt`](../processed/2026-09-23-remi-ai-appel-11-sept.txt) + [`collaboration/what-the-consultants-see.docx`](collaboration/what-the-consultants-see.docx)             | **The direction as of mid-September** (11 Sept call; her 14 Sept answer): the console is « le côté Morgane » until the practitioner space; tokenised links, no accounts before December; the copy-context bridge; the cheapest AI first (Vercel AI Gateway), EU later; the patient page now — 3 objectives, challenges with « acquis / prêt(e) pour le prochain », her recipe PDFs and documents, one feedback box; recipes 100 % bespoke, a seed base of ~20 as an open question. Wins over 2 where they disagree. |
| 2   | [`collaboration/remi-v2-feedback-on-first-version.docx`](collaboration/remi-v2-feedback-on-first-version.docx) + [`correspondence/03-feedback-on-first-version.md`](correspondence/03-feedback-on-first-version.md) | **What must change before Morgane can use REMI daily** (10 Sept 2026): the console follows her consultation workflow, bulk entry, the patient page carries « Je vais manger / J'ai mangé », recipes and feedback; AI-carried features tested now. Wins over 3 where they disagree.                                                                                                                                                                                                                                  |
| 3   | [`new-development-direction.docx`](new-development-direction.docx)                                                                                                                                                  | **The method** (from Morgane & Arnaud, adopted 27 Aug 2026): terrain-first, patient experience before a full practitioner space, FunMedDev test 1 Dec, open day 19 Dec                                                                                                                                                                                                                                                                                                                                              |
| 4   | [`call-summary.pdf`](call-summary.pdf)                                                                                                                                                                              | The 25 Aug team call: Slack working rhythm, the beta patient-profile admin due Friday 29 Aug, weekly Friday calls, access list (GoDaddy, DigitalOcean, emails)                                                                                                                                                                                                                                                                                                                                                      |
| 5?  | [`collaboration/remi-v2-structure-brainstorm.docx`](collaboration/remi-v2-structure-brainstorm.docx)                                                                                                                | **Proposed rank — the owner confirms it in the PR.** How the V2 is structured (Morgane, Sept 2026): the ten data blocks, the weekly loop, § 7's what-not-to-build                                                                                                                                                                                                                                                                                                                                                   |
| 6   | [`collaboration/remi-v2-explication-systeme.docx`](collaboration/remi-v2-explication-systeme.docx)                                                                                                                  | **The old version's product logic** (Morgane, filed 10 Sept 2026): practitioner onboarding, invitation, patient onboarding, « Je vais manger / J'ai mangé », check-ins, recipes, autonomous patient. A source of _flows to learn from_, never a spec to reproduce — her own words.                                                                                                                                                                                                                                  |
| 7   | [`collaboration/remi-v2-features.docx`](collaboration/remi-v2-features.docx)                                                                                                                                        | **The 20 Aug V2 / POC catalogue** (Morgane & Arnaud): 41 sections with P0 / P1 / P2 and a V3 vision. **Superseded on sequencing, priorities and billing by 1–4** (the direction letter of 24 Aug stepped back from it); a reference for feature ideas and its § 30 export principle.                                                                                                                                                                                                                                |
| 8   | [`braindump/`](braindump/)                                                                                                                                                                                          | What REMI is: vision, positioning, the V2 feature ideas, business model. **On sequencing and priorities, 1–4 win.**                                                                                                                                                                                                                                                                                                                                                                                                 |
| 9   | [`remi-status-report.html`](remi-status-report.html)                                                                                                                                                                | The 18 Aug plan (Phases A–F). **Its phase ordering is superseded by 1–3** — the backlog has been re-cut, three times.                                                                                                                                                                                                                                                                                                                                                                                               |
| 10  | [`correspondence/`](correspondence/)                                                                                                                                                                                | What Morgane actually asked for, in her words (03 is also row 2's covering message)                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| 11  | the four August transcripts under [`../processed/`](../processed/) — 20, 25, 28 Aug and 1 Sept                                                                                                                      | Context: how the direction was reached. Where a later row speaks, it wins; what only they said is in `.icm/intake/README.md` D-21 … D-23. Machine transcripts — check the original before deciding on one.                                                                                                                                                                                                                                                                                                          |
| 12  | [`ENV.md`](ENV.md)                                                                                                                                                                                                  | Environment variables and secrets — the only catalogue                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| 13  | [`RETENTION.md`](RETENTION.md)                                                                                                                                                                                      | What is held about a patient, what deleting removes, what the audit trail keeps, and how long ended patients are kept                                                                                                                                                                                                                                                                                                                                                                                               |
| 14  | [`history/`](history/)                                                                                                                                                                                              | Engineering findings and the v1 record. **Superseded wherever it touches direction.**                                                                                                                                                                                                                                                                                                                                                                                                                               |

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

Eight binary documents: three added 1 September 2026 (commit b9c8dc6), two on 10 September 2026,
three on 23 September 2026 (through `.icm/raw/`; the extracted text sits under `.icm/processed/`).
They are not diffable and not edited here — they are read, and quoted like the braindump.

- [`what-the-consultants-see.docx`](collaboration/what-the-consultants-see.docx) — **row 1, with the
  11 September call.** « Ce que les consultants doivent voir » (Morgane, 14 September 2026), her
  written answer to what the call asked her for [35:59]: the three objectives always visible (a
  weekly 0–5 score as a question), personalised challenges with « Challenge acquis » / « Prêt(e)
  pour le prochain », her recipes in REMI or as the PDFs she sends today, personal documents (the
  15-foods list is a document, not a feature), one general feedback box, and what she needs to see
  on her side. Her § 5 « Mes ressources » is struck by her — WhatsApp. Text:
  `.icm/processed/2026-09-23-remi-ai-ce-que-les-consultants-voient.txt`. The `challenges`,
  `patient-documents-and-links` and `general-feedback` stubs of
  [`patient-loop/`](../intake/patient-loop/breakdown.md) are cut from it.
- [`remi-v2-feedback-on-first-version.docx`](collaboration/remi-v2-feedback-on-first-version.docx) —
  **row 2.** Morgane's verdict on the first console (10 September 2026), in French: the data
  structure is right, the interaction layer is not usable — a page built around encoding, not
  around her consultation work (understand → decide → act → follow). Nine sections: what is
  positive; the encoding problem; the three experiences to separate (admin console, practitioner
  space, patient page); the at-a-glance first screen; bulk entry before any AI; the patient page as
  the November priority (« Je vais manger » / « J'ai mangé »); recipe generation from profile +
  recommendations with a check before display; meal suggestions as the central workflow; and § 9,
  her definition of "usable for me". The [`practitioner-workflow/`](../intake/practitioner-workflow/breakdown.md),
  [`patient-loop/`](../intake/patient-loop/breakdown.md), [`nutrition-knowledge/`](../intake/nutrition-knowledge/breakdown.md)
  and [`ai-assist/`](../intake/ai-assist/breakdown.md) epics are cut from it.
- [`remi-v2-explication-systeme.docx`](collaboration/remi-v2-explication-systeme.docx) — **row 6.**
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
- [`remi-v2-features.docx`](collaboration/remi-v2-features.docx) — **row 7.** « REMI V2 — Vision
  produit, fonctionnalités & priorités du Proof of Concept » (Morgane with Arnaud, the evening of
  20 August 2026): the complete catalogue in 41 sections with P0 / P1 / P2 and a V3 vision — sign-up
  and pilot, onboarding, 100 % personalised recipes, weekly generation, shopping list, weekly
  reviews, a follow-up board, synthesis between consultations, questionnaires, export of the
  record, the AI principles. The direction letter of 24 August stepped back from it, so on
  sequencing, priorities and billing it is superseded; it is kept for its ideas. Text:
  `.icm/processed/2026-09-23-remi-v2-features.txt`.
- [`startup-boost-technical-roadmap.docx`](collaboration/startup-boost-technical-roadmap.docx) —
  « Roadmap technique & utilisation du financement Startup Boost » (≈ 12–15 September 2026, on
  Jamie's input from the 11 September call): technical positioning, MVP-1 learnings, the new product
  logic, the foundation before automation, a human-in-the-loop scoring grid, a validation layer, a
  roadmap Q4 2026 → 2028, the genotype's place, a proposed split of the €100 000, and § 13's points
  to finalise. Text: `.icm/processed/2026-09-23-remi-roadmap-technique-startup-boost.txt`.
  Outward-facing like the deck and the playbook: no precedence row.
- [`pitch-deck.pptx`](collaboration/pitch-deck.pptx) — twelve slides for the September 2026 Fagron
  Genomics discussion: why REMI exists, the product model, real-life personalisation, market
  sizing, the 2026 → 2027/28 roadmap, the team, and four backup slides held for the open discussion.
- [`fagron-meeting-playbook.docx`](collaboration/fagron-meeting-playbook.docx) — the rehearsal
  script for that meeting: per-slide speaker, timing, objective and wording, the three messages,
  and the stated best-case and minimum-acceptable outcomes.

The deck, the playbook and the Startup Boost roadmap are **outward-facing preparation, not sources
of direction** — they say how REMI is presented, not what gets built — so none has a precedence row. Where the deck's
roadmap and the documents above it disagree, the documents above it win.

### `../processed/` — the call transcripts

Five calls, transcribed by machine and extracted through `.icm/raw/` on 23 September 2026
(`.icm/raw/README.md`; the originals sit in `.icm/raw/_processed/`, the manifest in
`.icm/processed/manifest.json`). They are quoted by `[m:ss]` timestamp.

- `2026-09-23-remi-ai-appel-11-sept.txt` — **row 1.** Morgane, Arnaud, Jamie, ~87 min: the copy-context
  bridge and why AI stays out of the platform until the prompts are proven; the cheapest AI first
  (the Vercel AI Gateway), EU sovereignty later; the patient page now; recipes bespoke, a seed base
  as a question; the Startup Boost answers; « Rémi ne peut jamais donner des recommandations, elle
  aide à appliquer les recommandations »; the forum and speech-to-text ideas, recorded not built.
- `…-appel-20-aout.txt`, `…-appel-25-aout.txt`, `…-appel-28-aout.txt`, `…-appel-1-sept.txt` —
  **row 11.** How the direction was reached: Startup Boost and the stack (20 Aug), Slack and the
  admin console (25 Aug), Neon confirmed, pseudonymisation, the 18+ rule, the genotype-test rule
  (28 Aug), the pitch rehearsal and the view-only link (1 Sept).

The Scope run that read them all is
[`.icm/runs/september-sources/`](../runs/september-sources/01_scope/output/scope.md): the story
records each one, the scope settles what changed (D-16 … D-24).

### `remi-status-report.html` — the direction report

Written 18 August 2026 from the braindump. Reads the whole of it, answers Morgane's two emails,
states plainly where the build diverged from her vision, and proposes **Phases A–F**, which are
what [`.icm/intake/`](../intake/README.md) is cut from. Part five is the short list of what is
still needed from her.

### `correspondence/`

- [`01-startup-boost.md`](correspondence/01-startup-boost.md) — the Startup Boost call and its criteria
- [`02-onenote-and-tools.md`](correspondence/02-onenote-and-tools.md) — the OneNote handover and the tools question (Supabase, DigitalOcean, Mistral, Euria)
- [`03-feedback-on-first-version.md`](correspondence/03-feedback-on-first-version.md) — the covering message for row 2: the console is unusable as it stands, the old version's logic is to be learned from not reproduced, AI-carried features tested now
- [`04-reply-on-the-old-version.md`](correspondence/04-reply-on-the-old-version.md) — Jamie's answer to her four questions about the old version (keep / simplify / drop / rebuild), prepared for the 11 September call; draft until sent. Its « Le modèle est Mistral, hébergé en Europe » line is superseded by D-16 (the gateway first, EU later)

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
