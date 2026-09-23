# .icm — this repo's work layer (Layer 1)

This folder is a context workspace: **the folder structure is the orchestration.** It holds the
product knowledge (`docs/`), the ordered backlog (`intake/`) and the delivery pipeline that walks
it — a feature flows through ordered stages, one skill (`/pipeline`) routes between them, and each
stage's contract is a numbered folder under `stages/`. You review a stage's output before running
the next — that pause is the human gate. Every rule an agent needs is inlined in these contracts.

Every estate repo carries this one pipeline (estate decision D22); `complexity` in `project.json`
is the only weight. The contracts, the lanes, the shared doctrine, the capability skills and the
factory scripts are **template-owned** — byte-identical in every pipeline repo, listed in
`MANIFEST`, synced from `icm-board/_system/template/icm-pipeline/` (`template-version` says which
template this copy was last brought up to; estate decision D20) — and carry no repo identity.
What is true of _this_ repo lives in the project-owned files: `project.json` (the values a
script reads), `_shared/project-rules.md` (the rules a stage reads), `_shared/knowledge-map.md`
(the doc pages), `scripts/{format,lint,validate-knowledge-map,report}.sh` and `runs/README.md`.
`/setup` (`.claude/skills/setup/SKILL.md` → `scripts/setup.sh`) says whether the repo is
complete, current and configured. Canonical contracts: `_system/contracts/PIPELINE.md` and
`TICKETS.md` in icm-board.

**One skill, many stages.** Adding a stage means adding a folder here, not a skill. The
pipeline's own **capability** skills live in `skills/` (three seeded, template-owned, loaded only
when a trigger matches the step — `skills/README.md`); one-job repo skills would live flat in
`.claude/skills/` and be _called by_ stages (none yet — `.claude/SKILLS.md`).

## The spine — four stages, three hard gates

| `/pipeline …`    | Stage folder         | Job                                                                                                                                     | Gate after                                                                           |
| ---------------- | -------------------- | --------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| `scope <input>`  | `stages/01_scope/`   | record the source; settle the scope in session; write `scope.md` with its `D-n` decisions; cut the intake batch                         | ✅ the operator reviews `scope.md` + the batch on `main` before running `new`        |
| `new` (per stub) | `stages/02_define/`  | stub + `scope.md` → approvable `spec.md`, opens the one feature PR; `revise <slug> "<change>"` edits it and re-projects the PR          | ✅ **Spec approved** PR checkbox (the operator ticks)                                |
| `build <slug>`   | `stages/03_build/`   | implement the spec on the run's branch; flip draft PR → open                                                                            | ✅ **Ready to merge** PR checkbox (the operator ticks, after a smoke of the preview) |
| `release <slug>` | `stages/04_release/` | CI green · reviews · docs + changelog + close-out → squash-merge → one production read; the release workflow calls `report.sh announce` | — (the merge ends the run)                                                           |

Release is **one stage, one decision**. The operator smoke-tests the preview after Build and ticks
**Ready to merge**; Release takes that tick as the full manual-testing attestation, holds the
merge only for a blocking CI failure, a security-critical finding, or deploy-breaking config,
parks every other finding as an `intake/triage/` stub, archives the run on the branch, merges,
reads production once (`deploy-status.sh` for the platform's word, `health-check.sh` for the
application's) and records `announce: deferred to CI`: `.github/workflows/release.yaml` hands
the changelog page's one-liner to `scripts/report.sh announce` on the merge
(`_shared/project-rules.md` → Reporting).

Only two gates are PR checkboxes — **Spec approved** (before Build) and **Ready to merge**
(before the squash-merge). Those two are the only **binding** approvals in the whole system, and
both are the operator's: the business's involvement ends when the scope is settled at Scope. The
agent **reads** checkboxes, never ticks them, and never self-advances across any gate.

**Scope takes input in any medium** — a pasted message from Morgane, a document under
`docs/collaboration/`, a call, a prototype, a prompt written after the Friday call — and settles
it with the operator in session, in rounds of questions; there is no question sheet and nothing
is answered out of band. What the operator cannot settle goes into `scope.md` as **Open for
Define**, never assumed. `run.md`'s `author/source:` records where the input came from.

**One PR regime** (detail in `_shared/github.md`): Scope is the **front** — it pushes
`story.md`, `scope.md`, `run.md` and the intake cut straight to `main`, no PR, touching only
`.icm/runs/<scope-slug>/**` and `.icm/intake/<scope-slug>/**`. From Define onward it is the
**spine** — exactly **one feature PR** through Release. The **slug**, picked at Scope, names
everything: run folder, intake folder, branch, PR, preview. The cut — the last thing Scope does
(`stages/01_scope/CONTEXT.md` step 6; formats in `intake/CONTEXT.md`) — turns every settled
scope into `intake/<slug>/`: one stub per future feature PR, however many the scope needs; `new`
walks them into Define in order.

**Scope may read the codebase.** Its questions are asked through the lens of the business _and_
the code; what it writes stays plain — one writing rule, simplicity — and the implementation
design is still Define's and Build's.

## Fast lanes — skip the front; one invocation ends in a PR the operator merges

| `/pipeline …`                            | Contract                     | For                                                                                                                       |
| ---------------------------------------- | ---------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| `bug "<report>"` / `bug <stub-name>`     | `lanes/bug/CONTEXT.md`       | reproduce → fix → green PR (+ changelog if user-visible)                                                                  |
| `tweak "<change>"` / `tweak <stub-name>` | `lanes/tweak/CONTEXT.md`     | tiny fully-specified adjustment → small green PR                                                                          |
| `chore "<task>"` / `chore <stub-name>`   | `lanes/chore/CONTEXT.md`     | refactor / dep-bump / migration — no behaviour change, no changelog                                                       |
| `knowledge add\|edit\|remove "<what>"`   | `lanes/knowledge/CONTEXT.md` | one `apps/docs` business or technical page changed outside a Release → docs-only PR; no run                               |
| `hotfix "<incident>"` (human-invoked)    | `lanes/hotfix/CONTEXT.md`    | production is wrong after a merge → fix-forward, or the revert / Vercel rollback `rollback.sh` prepared → PR opened READY |
| `handover`                               | `lanes/handover/CONTEXT.md`  | the deal's last lane: accounts, `env.sh doc`, `setup.sh` OK, the record into the deal folder                              |

A lane is **one agent invocation**: fix → draft PR → GREEN → changelog (bug/tweak, when
user-visible) → `close-out.sh` on the branch → push → flip ready → GREEN → stop. Lane PR bodies
carry **no gate checkboxes** — the merge button is the gate: the operator smoke-tests the preview
and squash-merges from GitHub; the agent never merges a lane PR and a lane is never resumed. A
lane that grows product decisions gets routed to `scope`. Lanes also start from a **triage
stub** by name — `intake/triage/` is the parking lane for off-ticket findings any stage cuts
instead of fixing in place (`intake/CONTEXT.md` → Triage), capped at 60 active stubs, with three
verbs of its own: `triage report`, `triage batch <area|lane> "<epic-title>"`, `triage prune` —
none of which opens a run. The `knowledge` lane is the odd one out: no run folder, no close-out —
it routes through `_shared/knowledge-map.md` to one docs page and opens a plain docs-only PR. It
is **the one sanctioned way to change project knowledge outside a Release**.

## Layers (what each stage loads — keep context small)

- **Layer 0** — `/AGENTS.md` (repo identity + routing; `/CLAUDE.md` imports it).
- **Layer 1** — this file + `.claude/skills/pipeline/SKILL.md` (the router).
- **Layer 2** — each `stages/NN_*/CONTEXT.md` / `lanes/*/CONTEXT.md` (Inputs / Process / Outputs /
  Verify).
- **Layer 3** —
  `_shared/{project-rules,knowledge-map,github,ci,stage-preamble,scope-template,conventions}.md`
  · `/CONVENTIONS.md` · the `apps/docs` pages a stage names · the subtree `AGENTS.md` files.
  Stable across runs.
- **Layer 4** — `runs/<slug>/**/output/` + `intake/<slug>/`, and the run's seven canonical files
  (`status.md` and `handoff.md` first — `runs/README.md`). This feature's working files.

**Context budget (canonical — contracts reference it in one line):** every stage targets a
**2–8k-token** working set, and the contract's **Inputs** table _is_ the budget. Reaching past
it — the wider docs site, unrelated source, another run's outputs — is scope creep: record it on
a one-line `Context budget:` note in the stage output (advisory, not a hard fail). Don't reload
the monorepo "to be safe".

## Layout

```text
.icm/
  CONTEXT.md               # this file (L1 map)
  MANIFEST                 # the ownership list: T template-owned · P project-owned (template-owned; icm-sync.sh reads it)
  template-version         # which icm-board template this copy was last brought up to (written by the sync)
  project.json             # the manifest: name, complexity, docs_path, checks, personas, archives, deploy, reporting, migrations, database, support, uat (project-owned)
  docs/                    # the product knowledge — client words, reports, ENV, RETENTION (docs/README.md: precedence)
  intake/                  # the work: epics + triage
    CONTEXT.md               # the breakdown + stub formats, the triage stub shape, the archive rules (template-owned)
    README.md                # this repo's backlog: the epics, the decisions of record, the milestones
    <epic-slug>/             # breakdown.md + one stub per feature (+ _done/ once spun out)
    triage/                  # off-ticket findings parked as lane stubs (+ _done/ once picked up)
    _done/                   # completed epics, moved whole by close-out.sh
  stages/                  # the spine — add a folder to add a stage
    01_scope/CONTEXT.md      02_define/CONTEXT.md     03_build/CONTEXT.md     04_release/CONTEXT.md
  lanes/                   # fast lanes — bug / tweak / chore · knowledge (docs-only, no run) · hotfix (human-invoked) · handover
  uat/CONTEXT.md           # the persistent client UAT environment — inert here: uat is undeclared in project.json
  skills/                  # the pipeline's capability skills, three-tier, loaded on a trigger (template-owned)
    README.md  security-audit/  database-migration/  preview-deploy/
  _shared/                 # L3: project-rules · knowledge-map (project-owned) · github · ci · stage-preamble · scope-template · conventions
    run-pack/                # the seven canonical run files run-pack.sh seeds into every run (template-owned)
  scripts/                 # the deterministic factory — one job, one RESULT line, env config
    lib/{gh,changed-files,project,vercel}.sh  lib/model-prices.json
    resolve-run.sh validate-spec.sh validate-intake.sh validate-decisions.sh new-run.sh run-pack.sh
    project-body.sh project-labels.sh ci-status.sh close-out.sh triage-report.sh env-check.sh env.sh setup.sh
    select-model.sh check-migrations.sh db-branch.sh security-check.sh process-raw.sh list-skills.sh
    deploy-status.sh health-check.sh rollback.sh usage-snapshot.sh retrospective.sh client-status.sh promote-uat.sh
    format.sh lint.sh validate-knowledge-map.sh report.sh      # project-owned: this repo's own hooks
  raw/  processed/         # what a client sent, and the text process-raw.sh extracted from it (media never committed)
  output/                  # client-status.sh → client-status-latest.md, the client's view
  runs/<slug>/             # L4 working artifacts — in-flight runs only (runs/README.md)
    run.md                   # pointer index (template below)
    usage.md                 # one `- usage:` line per stage start/end (usage-snapshot.sh)
    project.md plan.md tasks.md decisions.md status.md handoff.md FAILURE.md   # the canonical file pack
    01_scope/_source/story.md        # the source as received — never edited
    01_scope/output/scope.md         # the settled scope: source + addendum, by Scope
    02_define/output/spec.md
    03_build/output/notes.md         # Build's notes + Release's appended `## Release` record
    03_build/output/error.log        # every error a stage fixed, and how (retrospective.sh reads it)
    lane/output/notes.md             # fast-lane runs use this instead of the numbered folders
  runs/_done/<slug>/       # the archive — moved here by close-out.sh, on the branch, before the merge
```

The one announcement artifact — the changelog page — lives outside the run folder, at
`apps/docs/app/changelog/<YYYY-MM-DD>-<slug>/page.mdx` (`_shared/project-rules.md` → Announcing
owns its shape); its H1 is the one-liner the release workflow posts through `scripts/report.sh announce` after the merge.

## State lives in two homes

1. **The git run folder** — `runs/<slug>/**`. Stage outputs live here, and **the canonical scope
   moves through two homes in turn, never both at once**:

   | From          | Until                   | Canonical  |
   | ------------- | ----------------------- | ---------- |
   | Scope pushes  | Define writes `spec.md` | `scope.md` |
   | Define onward | Release                 | `spec.md`  |

   Before Scope pushes there is no canonical scope — only `01_scope/_source/story.md` (the source
   as received, never edited). `scope.md` is **derived, not a copy**: Scope reproduces the source
   and appends an addendum — assumptions, the `D-n` decisions table, out-of-scope, and what is
   open for Define — which is the audit trail standing in for a merged rewrite. A scope that is
   wrong in substance is deleted — run folder and intake folder — and Scope is run again from the
   source. There is no revise path for a scope.

2. **The PR** — the run's GitHub home from Define onward. Its lifecycle _is_ the run state
   (draft → open → merged), its labels are projected one-way from `spec.md`, its body carries the
   two gate checkboxes, its timeline is the log. The body is a **Summary + a link to `spec.md`**
   (never a copy — nothing to drift). **Pipeline PRs are never subscribed to PR activity** — CI
   is read via one blocking `ci-status.sh` call per push, so the Vercel event churn never reaches
   a session (`_shared/github.md`).

## `run.md` template (pointer index — one per run)

```md
# Run: <slug>

- lane: feature # or front | bug | tweak | chore | hotfix | handover
- story: 01_scope/_source/story.md # front runs only — the source as received
- author/source: Morgane | call with … | prototype | document # front runs only
- personas: patient, practitioner # front runs only — the repo's vocabulary
- scope-agreed: 2026-09-18 # front runs only — the day Scope settled it in session
- stubs: 3 (.icm/intake/<slug>/) # front runs only — written by Scope
- branch: claude/<slug> # recorded, not enforced — written by new-run.sh
- pr: #456 # the ONE PR — written by new-run.sh (a front has none)
```

Scope writes down to `stubs:`; `new-run.sh` appends `branch:` + `pr:` at Define (lane runs get
all of theirs at once).

## Starting and resuming

- **New scope:** `/pipeline scope <input>` — records the source, settles the scope with you in
  session, writes `scope.md`, cuts the stubs and pushes it all to `main`. Review it there.
- **Per feature:** `/pipeline new` (next stub in the batch) or `new <stub-name>` (a stub picked
  by name). `new` takes a stub, never a request — a request with no stub behind it is new content
  and goes to `scope`. Define commits the run and opens the draft PR, so the run is in git from
  the start. The epics cut before the front existed (`intake/README.md`) carry no `scope.md`;
  Define proceeds from the stub alone, as its contract says.
- **Change a spec:** `revise <slug> "<what to change>"` — the only way an existing spec changes.
  It edits `spec.md`, validates it, and re-projects the PR body and labels from the file; a
  ticked **Spec approved** box is unticked and the operator re-ticks it.
- **Continue on any device:** pass the slug to the next subcommand — the shared preamble
  (`_shared/stage-preamble.md`) resolves the run via `run.md` or the PR and checks out its branch.
- **No slash needed.** The bare forms route the same as `/pipeline …`: `new`, `new <stub-name>`,
  `build <slug>`, `release <slug>`, `revise <slug> "<what to change>"`,
  `bug|tweak|chore <stub-name or "report">`, `hotfix "<incident>"`, `handover`,
  `scope <anything>`, `triage report|batch|prune`, `knowledge add|edit|remove "<what>"`,
  `status` (the client's view — `client-status.sh`). `uat status|approve|sync` exist only where
  `project.json` declares a UAT environment, which this repo does not. There is no router hook in
  this repo; the skill's own description carries the routing, and `/pipeline <sub>` remains the
  explicit form.
- **Pre-flight:** `.icm/scripts/env-check.sh` → `RESULT: PASS` says this machine or session can
  drive the pipeline at all — binaries, a GitHub route, the folder shape, executable bits.
  `/setup` (`.icm/scripts/setup.sh`) is the fuller question — is the repo complete, current and
  configured — and the one that asks for what is missing.

## Conventions for this workspace

- Slugs are kebab-case and short (`csv-export`).
- Outputs are markdown; **editing an output file is how you steer the next stage.**
- Nothing runs end to end automatically — you invoke each stage; the gates are the boundaries.
- **Runs are tracked in git** and ride in the feature PR from Define onward; the squash-merge in
  Release carries the completed run onto `main` as the durable record — **the close-out
  included**. Release's last commit before the merge runs `close-out.sh`, which moves the run to
  `runs/_done/` and, when its every stub has shipped, the intake epic to `intake/_done/`, taking
  the front run that cut it along. The merge is what publishes the move. `intake/` and `runs/`
  hold only live work — a merged run still sitting in `runs/` means Release skipped the step, and
  nothing sweeps it afterwards (`runs/README.md`).
- **GitHub issues are not an agent drop-zone.** Specs, audits and findings live in `scope.md`,
  `spec.md`, and the PR — never in issues. Off-ticket findings go to `intake/triage/`.
- **Template-owned files are never edited here.** A contract that needs fixing is fixed in
  icm-board's template and synced back with `icm-sync.sh`; `icm-check.sh` reports a diverged copy
  as drift. The `.prettierignore` entries for those paths are what keep the formatter from
  re-drifting them on commit.

## The rules that travel with this folder

- **Identity is the path** — a ticket is `<epic-slug>/<feature-slug>`; no numbers.
- **Status is positional** — where a file sits is its state; `git mv` to `_done/` is "done".
  Nothing is deleted; dropped work carries a `> Dropped: <reason, date>` line.
- **Planning lives here** — never a loose `TODO.md` or `BACKLOG.md` at the root.
- **The board reads `main`** — an unpushed stub does not exist.

## Where each thing is defined (edit exactly one home)

| To change…                                                                  | Edit                                                                                             |
| --------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| Routing / a subcommand                                                      | `.claude/skills/pipeline/SKILL.md` (template-owned)                                              |
| A stage's or lane's behaviour                                               | `.icm/stages/NN_*/` · `.icm/lanes/*/CONTEXT.md` (template-owned)                                 |
| What is true of this repo — people, factory, announcing                     | `.icm/_shared/project-rules.md`                                                                  |
| The values a script reads — checks, personas, docs path, archives           | `.icm/project.json`                                                                              |
| Revising a spec (`revise <slug>`)                                           | `.icm/stages/02_define/CONTEXT.md` step 6 + `.icm/scripts/project-body.sh`                       |
| The breakdown/stub formats · triage                                         | `.icm/intake/CONTEXT.md` (template-owned)                                                        |
| This repo's backlog, decisions of record, milestones                        | `.icm/intake/README.md`                                                                          |
| GitHub calls, gates, labels, the PR regime                                  | `.icm/_shared/github.md` (+ `.github/labels.yml`)                                                |
| What the checks are / what green means                                      | `.icm/_shared/ci.md` (+ `.icm/scripts/ci-status.sh`)                                             |
| What is announced where (the hook is complete as seeded)                    | `.icm/project.json` → `reporting` · `.icm/_shared/project-rules.md` → Reporting                  |
| Who calls the hook on a merge                                               | `.github/workflows/release.yaml` (seeded once, this repo's own)                                  |
| Where the repo deploys, its health endpoints, migrations, database, support | `.icm/project.json` → `deploy` · `migrations` · `database` · `support`                           |
| The changelog page's shape                                                  | `.icm/_shared/project-rules.md` → Reporting                                                      |
| Is the repo complete, current, configured                                   | `/setup` → `.icm/scripts/setup.sh`                                                               |
| The client's status report                                                  | `status` → `.icm/scripts/client-status.sh` → `.icm/output/client-status-latest.md`               |
| The pipeline's capability skills                                            | `.icm/skills/<name>/SKILL.md` (template-owned)                                                   |
| What a run learned                                                          | `.icm/_shared/project-rules.md` → Learned rules (`retrospective.sh`, `run-pack.sh --sync-rules`) |
| Which doc pages a stage reads                                               | `.icm/_shared/knowledge-map.md`                                                                  |
| Project knowledge outside a Release                                         | `knowledge add\|edit\|remove "<what>"` → `.icm/lanes/knowledge/CONTEXT.md`                       |
| Run adoption                                                                | `.icm/_shared/stage-preamble.md`                                                                 |
| The shape of the settled scope                                              | `.icm/_shared/scope-template.md`                                                                 |
| Local feedback before a push                                                | `.icm/scripts/format.sh` · `.icm/scripts/lint.sh`                                                |
| The labels job and the advisory checks                                      | `.github/workflows/pipeline.yaml` · `.github/workflows/gates.yaml`                               |
| How a source becomes `scope.md` + a batch                                   | `.icm/stages/01_scope/CONTEXT.md`                                                                |
| What may stop a merge                                                       | `.icm/stages/04_release/CONTEXT.md`                                                              |
| Code rules                                                                  | `/CONVENTIONS.md` + `apps/*/AGENTS.md` · `packages/*/AGENTS.md`                                  |
