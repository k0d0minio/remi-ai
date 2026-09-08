# .icm — this repo's work layer (Layer 1)

- profile: pipeline

This folder is a context workspace: **the folder structure is the orchestration.** It holds both the
ordered backlog (`intake/`) and the delivery pipeline that walks it — a feature flows through ordered
stages, one skill (`/pipeline`) routes between them, and each stage's contract is a numbered folder
under `stages/`. You review a stage's output before running the next — that pause is the human gate.
Every rule an agent needs is inlined in these contracts.

The profile line above is read by the estate conformance tooling (`icm-check.sh`); `pipeline` is what
makes this repo receive and be checked against the run spine. Canonical contracts:
`_system/contracts/TICKETS.md` and `_system/contracts/PIPELINE.md` in the icm-board estate;
`intake/README.md` here is the self-contained micro-copy of the ticket standard.

**One skill, many stages.** Adding a stage means adding a folder here, not a skill. One-job
**capability** skills live flat in `.claude/skills/` and are _called by_ stages.

## The spine — four stages, three gates

| `/pipeline …`               | Stage folder         | Job                                                                | Gate after                        |
| --------------------------- | -------------------- | ------------------------------------------------------------------ | --------------------------------- |
| `scope "<topic>"`           | `stages/01_scope/`   | interrogate the business logic → `scope.md` → cut the intake batch | ✅ scope agreed (in conversation) |
| `new` / `define` (per stub) | `stages/02_define/`  | stub → approvable `spec.md`; opens the run's **one** feature PR    | ✅ **Spec approved** PR checkbox  |
| `build <slug>`              | `stages/03_build/`   | implement the spec on the branch; prove CI green; draft PR → open  | ✅ **Ready to merge** PR checkbox |
| `release <slug>`            | `stages/04_release/` | reviews · docs + changelog in-PR → gated squash-merge → ship note  | — (the stage ends at the merge)   |

Two gates are PR checkboxes — **Spec approved** (before Build) and **Ready to merge** (before the
squash-merge). Those two are the only **binding** approvals in the system, and both are the owner's
to tick. The scope gate is a stop-and-wait confirmation in conversation. **The agent reads
checkboxes, never ticks them, and never self-advances across any gate.**

**One gate before the merge, not two.** Verify and Ship used to be separate stages with a
conversational quality gate between them; they were one owner's work either way. Release is the
single stage, resting on the single tick: **ticking Ready to merge attests the owner's own manual
and signed-in testing of the change**, so Release never re-asks for it. What may still stop the
merge is only a blocking CI failure, a security-critical finding introduced by the diff, or a
deploy-breaking config finding — everything else is parked in `intake/triage/` and the merge
proceeds (`stages/04_release/CONTEXT.md`).

**Two PR regimes** (detail in `_shared/github.md`): Scope is the **front** — it opens no PR at all,
its artifacts commit straight to `main`. From Define onward it is the **spine**: exactly **one
feature PR** through Release.

The **slug**, picked at Scope, names everything: the scope file, the intake folder, the branch, the
PR, and the Vercel preview. One string traces a feature end to end. Scope's cut turns every agreed
scope into an epic under `.icm/intake/<slug>/` — one stub per future feature PR, however many the
scope needs; `new` walks them into Define in order.

## Fast lanes — skip the front, keep the merge gate

| `/pipeline …`      | Contract                 | For                                                        |
| ------------------ | ------------------------ | ---------------------------------------------------------- |
| `bug "<report>"`   | `lanes/bug/CONTEXT.md`   | reproduce → fix → verify; PR with the merge gate only      |
| `tweak "<change>"` | `lanes/tweak/CONTEXT.md` | tiny fully-specified adjustment; small PR, merge gate only |
| `chore "<task>"`   | `lanes/chore/CONTEXT.md` | refactor / dep bump / migration — no behaviour change      |

Lane PRs carry only the **Ready to merge** anchor. A missing anchor means "not required", never
"unticked" (`_shared/github.md`). A lane that grows product decisions gets routed back to `scope`.

## Layers (what each stage loads — keep context small)

- **Layer 0** — `/AGENTS.md` (repo identity + routing). It points at the code rules; it does not
  carry them.
- **Layer 1** — this file + `.claude/skills/pipeline/SKILL.md` (the router).
- **Layer 2** — each `stages/NN_*/CONTEXT.md` / `lanes/*/CONTEXT.md` — Inputs / Process / Outputs /
  Verify.
- **Layer 3** — `_shared/{knowledge-map,github,ci,stage-preamble,conventions}.md` · `/CONVENTIONS.md` ·
  the `apps/docs` pages a stage names · the subtree `AGENTS.md` files · capability skills. Stable
  across runs.
- **Layer 4** — `runs/<slug>/**/output/` + `intake/<slug>/`. This feature's working files.

**Context budget (canonical — contracts reference it in one line):** every stage targets a
**2–8k-token** working set, and the contract's **Inputs** table _is_ the budget. Reaching past it —
the wider docs site, unrelated source, another run's outputs — is scope creep: record it on a
one-line `Context budget:` note in the stage output (advisory, not a hard fail). A tight Inputs
table is what prevents the lost-in-the-middle failure. Don't reload the monorepo "to be safe".

## Layout

```text
.icm/
  CONTEXT.md               # this file (L1 map)
  project.md               # what this project is for — written by /project, never by hand
  intake/                  # the work: epics + triage (see intake/README.md)
    <epic-slug>/             breakdown.md + one stub per unit of work + _done/
    triage/                  parked one-off bug/tweak/chore stubs
    _done/                   completed epics + the legacy archive
  docs/                    # the product knowledge — client words, reports, runbooks
  stages/                  # the spine — add a folder to add a stage
    01_scope/CONTEXT.md      02_define/CONTEXT.md
    03_build/CONTEXT.md      04_release/CONTEXT.md
  lanes/                   # fast lanes — bug / tweak / chore
  _shared/                 # L3: knowledge-map · github · ci · stage-preamble · conventions
  _design/                 # human-only notes, never loaded at runtime
  scripts/                 # the deterministic factory — one job each, one RESULT line, env config
    resolve-run.sh  new-run.sh  project-labels.sh  validate-spec.sh  ci-status.sh
    send-ship-note.sh
  runs/<slug>/             # L4 working artifacts
    run.md                   # pointer index
    01_scope/output/scope.md          02_define/output/spec.md
    03_build/output/notes.md          04_release/output/{release,changelog,ship-note}.md
    lane/output/notes.md              # fast-lane runs use this instead of the numbered folders

    # Runs archived here from the six-stage pipeline keep their old layout
    # (03_define/ · 04_build/ · 05_verify/ · 06_ship/). project-labels.sh, validate-spec.sh,
    # send-ship-note.sh and pipeline.yaml all still read it; nothing new writes it.
```

## State lives in two homes

1. **The git run folder** — `runs/<slug>/**`. **`spec.md` is the canonical spec** — the only
   editable source of what gets built — from the moment Define writes it. Before that, the agreed
   `scope.md` is the frozen scope. Stage outputs live beside it.
2. **The PR** — the run's GitHub home from Define onward. Its lifecycle _is_ the run state (draft →
   open → merged), its labels are projected one-way from `spec.md`, its body carries the two gate
   checkboxes, its timeline is the log. The body is a **summary plus a link** to `spec.md` — never a
   copy, so there is nothing to drift.

## `run.md` template (pointer index — one per run)

```md
# Run: <slug>

- lane: feature # or bug | tweak | chore
- branch: claude/<slug> # written by Define
- pr: #21 # the ONE feature PR — written by Define
```

Scope writes the top line; `new-run.sh` appends `branch:` and `pr:` at Define (lane runs get all of
theirs at once).

## Starting and resuming

- **New scope:** `/pipeline scope "<topic>"` — picks the slug, writes the scope, cuts the stubs.
- **Per feature:** `/pipeline new` (next stub in the batch), or `new <stub-path>` / `new <name>` /
  `new "<request>"` for pre-agreed work that needs no front. Define commits the run and opens the
  draft PR, so the run is in git from the start.
- **Continue on any device:** pass the slug to the next subcommand — the shared preamble
  (`_shared/stage-preamble.md`) resolves the run and checks out its branch.
- **Check state:** `/pipeline status [slug]`.

## Conventions for this workspace

- Slugs are short and kebab-case (`csv-export`).
- Outputs are markdown; **editing an output file is how you steer the next stage.**
- Nothing runs end to end automatically — you invoke each stage; the gates are the boundaries.
- **Runs are tracked in git** and ride in the feature PR from Define onward. The squash-merge in
  Release carries the completed run onto `main` as the durable record; completed runs are
  periodically archived to `apps/docs/archive/` (see `runs/README.md`).
- **GitHub issues are not an agent drop-zone.** Specs, audits and findings live in `scope.md`,
  `spec.md`, and the PR — never in issues.

## The rules that travel with this folder

- **Identity is the path** — a ticket is `<epic-slug>/<feature-slug>`; no numbers.
- **Status is positional** — where a file sits is its state; `git mv` to `_done/` is "done". Nothing
  is deleted; dropped work carries a `> Dropped: <reason, date>` line.
- **Planning lives here** — never a loose `TODO.md` or `BACKLOG.md` at the root.
- **The board reads `main`** — an unpushed stub does not exist.

## Where each thing is defined (edit exactly one home)

| To change…                                  | Edit                                               |
| ------------------------------------------- | -------------------------------------------------- |
| Routing / a subcommand                      | `.claude/skills/pipeline/SKILL.md`                 |
| A stage's or lane's behaviour               | `.icm/stages/NN_*/` · `.icm/lanes/*/CONTEXT.md`    |
| The cut (breakdown / stub shape)            | `.icm/intake/README.md` + the `ticket-craft` skill |
| GitHub calls, gates, labels, PR regimes     | `.icm/_shared/github.md` (+ `.github/labels.yml`)  |
| What "CI is green" means                    | `.icm/_shared/ci.md` (+ `scripts/ci-status.sh`)    |
| Which doc pages a stage reads               | `.icm/_shared/knowledge-map.md`                    |
| Run adoption                                | `.icm/_shared/stage-preamble.md`                   |
| Factory scripts / CI offload                | `.icm/scripts/` + `_design/automation-offload.md`  |
| The Definition of Ready / the scope freeze  | `.icm/stages/01_scope/CONTEXT.md`                  |
| The Definition of Done / what stops a merge | `.icm/stages/04_release/CONTEXT.md`                |
| Code rules                                  | `/CONVENTIONS.md` + the subtree `AGENTS.md` files  |
