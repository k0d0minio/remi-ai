---
name: pipeline
description: The delivery pipeline. Routes work through the six-stage spine — Scope, Design, Define, Build, Verify, Ship — plus the bug/tweak/chore fast lanes, each with a human gate at its boundary. Use when the user types /pipeline, or asks to scope an idea, design a prototype, start/spec/build/verify/ship a feature, fix a bug, make a tweak, run a chore, or check a feature's status. Subcommands - "scope" <topic>, "design" <slug>, "new"/"define" <request|stub>, "build" <slug>, "verify" <slug>, "ship" <slug>, "bug"/"tweak"/"chore" <request>, "status" [slug].
---

# /pipeline — the delivery pipeline router

The single entry point. It does **not** contain the work — each stage or lane contract lives under
`pipeline/stages/` or `pipeline/lanes/`. Parse the subcommand, load the right contract, follow it.
That keeps the skills list to one pipeline entry no matter how many stages exist.

Argument form: `<subcommand> [slug, "request", or stub path]`. The argument is: `$ARGUMENTS`

**Auto-routing hint:** the `route-request.sh` `UserPromptSubmit` hook may have injected an advisory
`[pipeline-router]` line classifying the user's prompt. Announce the suggested lane in one line and
proceed with it — unless the user named a different subcommand or overrides. Their word always wins;
the hint is advice, not authority.

## Routing table

| Subcommand                             | Contract to read & follow                 |
| -------------------------------------- | ----------------------------------------- |
| `scope "<topic>"` / `scope <slug>`     | `pipeline/stages/01_scope/CONTEXT.md`     |
| `design <slug>`                        | `pipeline/stages/02_design/CONTEXT.md`    |
| `new` (all forms — see below)          | `pipeline/stages/03_define/CONTEXT.md`    |
| `define "<request>"` / `define <slug>` | `pipeline/stages/03_define/CONTEXT.md`    |
| `build <slug>`                         | `pipeline/stages/04_build/CONTEXT.md`     |
| `verify <slug>`                        | `pipeline/stages/05_verify/CONTEXT.md`    |
| `ship <slug>`                          | `pipeline/stages/06_ship/CONTEXT.md`      |
| `bug "<report>"` / `bug <slug>`        | `pipeline/lanes/bug/CONTEXT.md`           |
| `tweak "<change>"` / `tweak <slug>`    | `pipeline/lanes/tweak/CONTEXT.md`         |
| `chore "<task>"` / `chore <slug>`      | `pipeline/lanes/chore/CONTEXT.md`         |
| `status [slug]`                        | — handled here, below                     |
| _(empty / unclear)_                    | read `pipeline/CONTEXT.md`, show the help |

Stages are discovered by folder order: `ls pipeline/stages/` → `NN_<name>/CONTEXT.md`; a subcommand
maps to the `<name>` part. Lanes likewise under `pipeline/lanes/`.

## How to run a stage or lane

1. Read `pipeline/CONTEXT.md` once this session if you haven't — the workspace map (Layer 1).
2. Resolve the `<slug>` (kebab-case). Scope picks new slugs; `new` / `define "<request>"` picks one
   only when no front exists behind the request.
3. For the **adopting** stages — `build`, `verify`, `ship`, and a lane resumed by slug — run the
   shared preamble first: `pipeline/_shared/stage-preamble.md` ("resolve the run or STOP"). Never
   recreate a missing run.
4. **Read the matching contract in full and follow it exactly.** Inputs / Process / Outputs / Verify
   are the instructions. Load only the files its Inputs section names.
5. **Respect gates — never auto-advance.** The five: scope agreed (conversation), design approved
   (the live demo URL — recorded by the operator proceeding), **Spec approved** (PR checkbox),
   Verify passed (conversation), **Ready to merge** (PR checkbox). You only ever **read** the
   checkboxes (`pipeline/_shared/github.md`) — never tick one, and never start the next stage on
   your own.

   After each stage, say what's done, where the output is, and which `/pipeline <next>` comes when
   the human is ready.

## Resolving `new` (one procedure, three selectors)

`new`'s argument decides how the stub is found; the candidate set is always the same.

**Candidate set = active stubs.** Glob `pipeline/intake/*/*.md`, excluding every `breakdown.md` and
anything under `_done/` (already spun out):

```bash
ls pipeline/intake/*/*.md 2>/dev/null | grep -v '/breakdown.md$' | grep -v '/_done/'
```

- **`new "<request>"`** (has spaces or quotes) — a plain-English request, no stub: hand it straight
  to the Define contract; it picks the slug.
- **`new <stub-path>`** (contains `/` or ends `.md`) — explicit stub: hand the path to Define.
- **`new <bare-name>`** (single token) — the user names a stub from memory:
  1. Exact filename match `<bare-name>.md` in the candidate set → use it.
  2. Else substring match: exactly one → use it and say which; several → `AskUserQuestion` (label =
     feature slug, description = scope folder). **Never guess.**
  3. No match → do **not** treat it as a fresh request. List the active stubs grouped by scope and
     ask.
- **`new`** (no argument) — walk the active batch in order:
  1. Group candidates by scope folder. One active scope → that's the batch; several →
     `AskUserQuestion` (label = scope-slug, description = "N stubs left"); none → say intake is
     empty and suggest `/pipeline scope "<topic>"`, then stop.
  2. Pick the lowest `sequence: n of m` (fallback: `## Build order` position, then filename).
  3. **Dependency check.** `_done/` means **spun out, not shipped**: if the pick's `depends-on` names
     a stub not yet in `_done/`, warn that the batch is out of order. If the dependency _is_ in
     `_done/`, confirm its PR actually **merged** before offering the pick — a dependent branched off
     `main` won't build until the dependency's code is on `main`. Unmerged → say so and recommend
     waiting; the user may still override.
  4. **Announce the pick and stop for confirmation** — opening a run and a draft PR is a real side
     effect. On confirmation, hand the path to Define.

Either way, Define pre-seeds the spec from the stub and `new-run.sh --stub` marks it `_done/`.

## `status` subcommand

All GitHub reads per `pipeline/_shared/github.md` — narrow queries, small limits.

- **`status <slug>`** → resolve the PR from `pipeline/runs/<slug>/run.md` (shared preamble first if
  the run isn't in the checkout). One `gh pr view --json state,isDraft,labels,body` plus one
  `gh pr checks`. Report: lane, stage label, each gate's state (the two checkboxes from the body;
  the conversational gates from which outputs exist — `scope.md` → agreed, `design-notes.md` →
  approved, `verify.md` → pending confirmation), PR state, CI rollup.
- **`status`** (no slug) → the board: `gh pr list --state open --label type:feature` (repeat per
  lane label if lanes are in flight), plus `gh pr list --state merged --limit 5`. One line per PR:
  title, type and stage labels, draft/open, checks. Then list `pipeline/intake/*/` folders with
  stubs remaining vs `_done/` — the filesystem _is_ the intake state.

## Help (when the subcommand is empty or unclear)

```text
/pipeline — delivery pipeline
  Spine (one scope → N feature PRs):
  /pipeline scope "<topic>"     interrogate + write the scope + cut the intake batch (gate: agreed)
  /pipeline design <slug>       prototype in apps/demo, live via demo PRs (gate: signed off from the URL)
  /pipeline new                 take the next pending stub into Define (also: new <name> | <path> | "<request>")
  /pipeline define <slug>       revise an existing spec
  /pipeline build <slug>        implement the approved spec (needs the Spec-approved tick)
  /pipeline verify <slug>       quality gate: readiness · review · security · DoD smoke (gate: you confirm)
  /pipeline ship <slug>         docs + changelog → gated squash-merge → ship note
  Fast lanes (single merge gate):
  /pipeline bug "<report>"      reproduce → fix → PR
  /pipeline tweak "<change>"    tiny adjustment → small PR
  /pipeline chore "<task>"      refactor / dep bump / migration → PR
  /pipeline status [slug]       where a feature (or everything) stands
```

When listing what's available — helping pick a stub, or when no batch is active — show the active
intake stubs grouped by scope folder, marking each scope's next stub (lowest `sequence`).

## Adding a stage or lane later

Add a numbered folder `pipeline/stages/NN_<name>/CONTEXT.md` (or `pipeline/lanes/<name>/`) and a row
to the routing table above. No new skill is created — the pipeline grows in the folder tree, not the
skills list.
