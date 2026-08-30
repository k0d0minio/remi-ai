# Delivery pipeline — workspace map (Layer 1)

This folder is a context workspace: **the folder structure is the orchestration.** A feature flows
through ordered stages; one skill, `/pipeline`, routes between them; each stage's contract is a
numbered folder under `stages/`. You review a stage's output before running the next — that pause
is the human gate. Every rule an agent needs is inlined in these contracts.

**One skill, many stages.** Adding a stage means adding a folder here, not a skill. One-job
**capability** skills live flat in `.claude/skills/` and are _called by_ stages.

## The spine — six stages, five gates

| `/pipeline …`               | Stage folder        | Job                                                                | Gate after                           |
| --------------------------- | ------------------- | ------------------------------------------------------------------ | ------------------------------------ |
| `scope "<topic>"`           | `stages/01_scope/`  | interrogate the business logic → `scope.md` → cut the intake batch | ✅ scope agreed (in conversation)    |
| `design <slug>`             | `stages/02_design/` | prototype in `apps/demo`, live via its own small demo PRs          | ✅ demo signed off from the live URL |
| `new` / `define` (per stub) | `stages/03_define/` | stub → approvable `spec.md`; opens the run's **one** feature PR    | ✅ **Spec approved** PR checkbox     |
| `build <slug>`              | `stages/04_build/`  | implement the spec on the run's branch; draft PR → open            | — (flows into Verify)                |
| `verify <slug>`             | `stages/05_verify/` | readiness · code review · security · DoD smoke on the preview      | ✅ quality gate confirmed            |
| `ship <slug>`               | `stages/06_ship/`   | docs + changelog in-PR → gated squash-merge → ship note            | ✅ **Ready to merge** PR checkbox    |

Only two gates are PR checkboxes — **Spec approved** (before Build) and **Ready to merge** (before
the squash-merge). Those two are the only **binding** approvals in the system, and both are the
owner's to tick. The other three are stop-and-wait confirmations in conversation. **The agent reads
checkboxes, never ticks them, and never self-advances across any gate.**

**Two PR regimes** (detail in `_shared/github.md`): Scope and Design are the **front** — Scope opens
no PR at all (its artifacts commit straight to `main`), Design merges its own small `apps/demo`-only
PRs so the demo is reviewed live. From Define onward it is the **spine**: exactly **one feature PR**
through Ship.

The **slug**, picked at Scope, names everything: the scope file, the intake folder, the branch, the
PR, and the Vercel preview. One string traces a feature end to end. Scope's cut turns every agreed
scope into `pipeline/intake/<slug>/` — one stub per future feature PR, however many the scope needs;
`new` walks them into Define in order.

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
- **Layer 3** — `_shared/{knowledge-map,github,stage-preamble,conventions}.md` · `/CONVENTIONS.md` ·
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
pipeline/
  CONTEXT.md               # this file (L1 map)
  intake/                  # Scope's cut — one folder per agreed scope
    CONTEXT.md               # the cut contract (invoked by Scope; no subcommand of its own)
    <scope-slug>/            # breakdown.md + one stub per feature (+ _done/ once spun out)
  stages/                  # the spine — add a folder to add a stage
    01_scope/CONTEXT.md      02_design/CONTEXT.md     03_define/CONTEXT.md
    04_build/CONTEXT.md      05_verify/CONTEXT.md     06_ship/CONTEXT.md
  lanes/                   # fast lanes — bug / tweak / chore
  _shared/                 # L3: knowledge-map · github · stage-preamble · conventions
  _design/                 # human-only notes, never loaded at runtime
  scripts/                 # the deterministic factory — one job each, one RESULT line, env config
    resolve-run.sh  new-run.sh  project-labels.sh  validate-spec.sh  send-ship-note.sh
  runs/<slug>/             # L4 working artifacts
    run.md                   # pointer index
    01_scope/output/scope.md          02_design/output/design-notes.md
    03_define/output/spec.md          04_build/output/notes.md
    05_verify/output/verify.md        06_ship/output/{release,changelog,ship-note}.md
    lane/output/notes.md              # fast-lane runs use this instead of the numbered folders
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
- demo: throwaway | seed | none # the Design → Build relationship
- preview-prs: #12, #14 # Design's demo PRs — front runs only
- branch: claude/<slug> # written by Define
- pr: #21 # the ONE feature PR — written by Define
```

Scope and Design write the top lines; `new-run.sh` appends `branch:` and `pr:` at Define (lane runs
get all of theirs at once).

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
  Ship carries the completed run onto `main` as the durable record; completed runs are periodically
  archived to `apps/docs/archive/` (see `runs/README.md`).
- **GitHub issues are not an agent drop-zone.** Specs, audits and findings live in `scope.md`,
  `spec.md`, and the PR — never in issues.

## Where each thing is defined (edit exactly one home)

| To change…                                 | Edit                                                    |
| ------------------------------------------ | ------------------------------------------------------- |
| Routing / a subcommand                     | `.claude/skills/pipeline/SKILL.md`                      |
| A stage's or lane's behaviour              | `pipeline/stages/NN_*/` · `pipeline/lanes/*/CONTEXT.md` |
| The cut (breakdown / stub shape)           | `pipeline/intake/CONTEXT.md`                            |
| GitHub calls, gates, labels, PR regimes    | `pipeline/_shared/github.md` (+ `.github/labels.yml`)   |
| Which doc pages a stage reads              | `pipeline/_shared/knowledge-map.md`                     |
| Run adoption                               | `pipeline/_shared/stage-preamble.md`                    |
| Factory scripts / CI offload               | `pipeline/scripts/` + `_design/automation-offload.md`   |
| The Definition of Ready / the scope freeze | `pipeline/stages/01_scope/CONTEXT.md`                   |
| The Definition of Done / the quality gate  | `pipeline/stages/05_verify/CONTEXT.md`                  |
| Code rules                                 | `/CONVENTIONS.md` + the subtree `AGENTS.md` files       |
