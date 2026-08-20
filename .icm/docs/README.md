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

| #   | Source                                               | What it settles                                                                        |
| --- | ---------------------------------------------------- | -------------------------------------------------------------------------------------- |
| 1   | [`braindump/`](braindump/)                           | What REMI is: vision, positioning, pivots, the V2 feature set, business model, roadmap |
| 2   | [`remi-status-report.html`](remi-status-report.html) | The plan derived from it — Phases A–F — and the open questions still outstanding       |
| 3   | [`correspondence/`](correspondence/)                 | What Morgane actually asked for, in her words                                          |
| 4   | [`ENV.md`](ENV.md)                                   | Environment variables and secrets — the only catalogue                                 |
| 5   | [`history/`](history/)                               | Engineering findings and the v1 record. **Superseded wherever it touches direction.**  |

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

### `remi-status-report.html` — the direction report

Written 18 August 2026 from the braindump. Reads the whole of it, answers Morgane's two emails,
states plainly where the build diverged from her vision, and proposes **Phases A–F**, which are
what [`.icm/intake/`](../intake/README.md) is cut from. Part five is the short list of what is
still needed from her.

### `correspondence/`

- [`01-startup-boost.md`](correspondence/01-startup-boost.md) — the Startup Boost call and its criteria
- [`02-onenote-and-tools.md`](correspondence/02-onenote-and-tools.md) — the OneNote handover and the tools question (Supabase, DigitalOcean, Mistral, Euria)

### `ENV.md`

The single catalogue of environment variables and secrets. The three-list rule
(`CONVENTIONS.md`) binds it to the zod schema in `packages/services` and `globalEnv` in
`turbo.json`: a variable that is not in all three does not exist.

### `slack.md` — how the team runs, day to day

The Slack workspace: the channel map, the scoping loop, the product board, the alerts, the forms
and the cadence. It is **operational, not product truth** — it holds no claim about what REMI is,
and it sits outside the precedence table above.

It exists because this folder has one audience and the company has three people. Everything here is
written for Jamie and the agents; Morgane and Arnaud work in Slack and do not open the repository.
So the Slack side is written to be **read on its own, in French** — the state of every feature, what
was decided, what is expected of whom — rather than as an index pointing back here. The two surfaces
stay honest through fixed crossing points (a scope agreed, a decision taken, a question answered, the
fortnightly bet, a ship note) and a monthly check that they still agree.

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
edited, so the correction stays visible. The database question is likewise closed: the braindump
names **Supabase**.
