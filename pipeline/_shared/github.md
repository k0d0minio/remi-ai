# GitHub — the calls, the gates, the labels (Layer 3 reference)

Repo: **`k0d0minio/remi-ai`**.

The pipeline drives GitHub through the **`gh` CLI**. If a GitHub MCP server is connected in the
session, its equivalent calls are fine too — but pick one per run and don't mix them mid-stage.

**Token discipline:** one narrow call per question. `gh pr view <n> --json <only the fields you
need>`; `gh pr list` with a tight filter and a small `--limit`. Never page through comment threads
or diffs you don't need.

**Scripts own the mechanical projections; the CLI is for reads, edits, and merges.** The
deterministic work runs through the `curl` + `jq` scripts in `pipeline/scripts/`, configured from
the environment (`GITHUB_TOKEN` / `GH_TOKEN`, optional `GITHUB_REPO` / `GITHUB_API_URL`):

- **`resolve-run.sh <slug>`** — resolve a run into the working tree, or STOP (`stage-preamble.md`).
- **`new-run.sh <slug> --summary "…" [--stub …] [--lane bug|tweak|chore]`** — open the run's PR and
  write `run.md` (Define, and the fast lanes).
- **`project-labels.sh <slug> --stage <…>`** — project the label set from `spec.md`.

## The two PR regimes

1. **The front (Scope + Design)** — no feature PR exists yet.
   - **Scope opens no PR at all.** Its artifacts (`scope.md` + the intake folder) are markdown only
     and commit **straight to `main`**, so every device is in sync immediately. If branch protection
     rejects the push, fall back to a tiny docs-only PR merged green — never leave the front's
     artifacts local-only.
   - **Design opens its own small PRs** against `main`. Each touches only `apps/demo/**` plus this
     run's `pipeline/runs/<slug>/**` and `pipeline/intake/<slug>/**` files, is labelled
     `type:design`, and carries a body of one summary line plus the demo path to review — **no gate
     anchors**. Design may **merge these autonomously** when the path guard holds and CI is green:
     squash, attempted once, no polling. A branch-protection rejection means fix → push → retry
     once. Every demo PR is recorded in `run.md` under `preview-prs:`.

2. **The spine (Define → Ship)** — **exactly one PR per run.** Define opens it once (via
   `new-run.sh`, as a draft); every later stage adds commits to the same branch — code, verify
   record, docs, changelog, cleanup. Never open a second PR for a run, never re-run `new-run.sh`
   against it, never branch off a docs-only or cleanup-only PR.

Fast-lane PRs (`--lane`) are a third, degenerate shape: one non-draft PR opened by `new-run.sh`
whose body carries **only** the Ready-to-merge gate.

**The PR is the run's GitHub home.** Its body and labels are one-way projections of `spec.md`
(spine) or the lane's `notes.md` summary. No issue is created; PRs carry no `Closes #`.

## Gates — checkboxes in the PR body

The template ends with the pipeline checklist, anchored so parsing never depends on wording:

```md
<!-- gate:spec-approved -->

- [ ] Spec approved (Define gate — a human ticks this before Build)

<!-- gate:ready-to-merge -->

- [ ] Ready to merge (Ship gate — a human ticks this to authorise the squash-merge)
```

- Read a gate: `gh pr view <n> --json body` → find the anchor comment → the next checklist line is
  the gate; `[x]` means ticked.
- **A missing anchor means "not required", never "unticked".** Lane PRs carry only
  `gate:ready-to-merge`; parse what's present. A missing `gate:ready-to-merge` anchor on **any**
  pipeline PR is a malformed body — STOP and fix the body first.
- **The agent never ticks either box.** If a required box is unticked: STOP and say so. The ticked
  **Ready to merge** box _is_ the merge authorisation — no further prompt is needed.
- Both boxes are the owner's to tick. There is no scripted exception.

## Labels

The fixed vocabulary lives in `.github/labels.yml` (documentation + one-time repo setup).
**Projection is CI's job, not the agent's:** on every push touching `pipeline/runs/**`, the `labels`
job in `.github/workflows/pipeline.yaml` runs `project-labels.sh <slug> --stage auto --pr <n>`. It
reads `apps:` and `complexity:` from `spec.md` and derives `stage:*` from **which run outputs
exist**:

| Output present                     | Stage label     |
| ---------------------------------- | --------------- |
| `03_define/output/spec.md`         | `stage:define`  |
| `04_build/output/notes.md`         | `stage:build`   |
| `05_verify/output/verify.md`       | `stage:verify`  |
| `06_ship/output/release.md`        | `stage:ship`    |

Pushing a stage's output is what moves the label. `new-run.sh` projects the initial set when the PR
opens; the script stays the manual fallback.

- `stage:` — exactly one of `define → build → verify → ship`.
- `type:feature` on spine PRs · `type:{bug,tweak,chore}` on lane PRs · `type:design` on demo PRs.
- `app:{web,admin,marketing,docs,demo,packages}` and `complexity:{trivial,standard,complex}` from
  the spec header (spine only).

> **Why `app:` and not `persona:`** — the persona vocabulary this pattern came from was grounded in
> a documented set of six roles. Remi AI's roles aren't written yet
> (`apps/docs/app/business/roles`). `app:` is a dimension that is verifiably true today. Add a
> `persona:` axis once that page is real; the projection script takes it in one place.

## Define — draft PR projected from `spec.md`

```bash
pipeline/scripts/new-run.sh <slug> --summary "<one plain sentence>" \
    [--stub pipeline/intake/<scope>/<feature>.md]
```

Commits `pipeline/runs/<slug>/` and pushes; opens the draft PR (`base: main`, title from the spec's
`# ` heading, body projected from `spec.md`: Spec block, acceptance criteria mirrored **unticked**,
both gate anchors, and a **link** to `spec.md` — never an embedded copy); writes or extends
`run.md`; projects labels; `git mv`s a consumed stub into `_done/`. **One PR per run.**

Revising the spec later = edit `spec.md`, commit, push, then reconcile **one direction only**
(file → PR): `gh pr edit <n> --body …` for the summary and criteria text, and `project-labels.sh`
for the labels. Never re-run `new-run.sh`.

## Build — gate-check, implement, open

1. Gate: `gh pr view <n> --json body` → **Spec approved** must be `[x]`. Unticked → STOP.
2. Implement; commit the run files with the code; push (CI advances `stage:build`). Tick satisfied
   acceptance criteria with `gh pr edit` — tick state lives on the PR, the text stays the spec's.
3. Hand off: `gh pr ready <n>` (draft → open).

## Verify — evidence on the branch

Push `verify.md` (CI advances `stage:verify`). Triage review comments with
`gh pr view <n> --json reviews,comments`. Fixes are commits on the same branch.

## Ship — gated merge, then the note

1. Push the ship outputs (CI advances `stage:ship`); triage remaining review comments.
2. Gate: **Ready to merge** must be `[x]`. Unticked → STOP and ask. Never tick it; never merge
   without it.
3. **Check first, then merge — Ship refuses to merge on red.** `gh pr checks <n>` once. Any failing
   check → **STOP**: read the failing run (`gh run view <id> --log-failed`), fix, push, and re-check
   once CI finishes (a re-read after completion is not polling). Green →
   `gh pr merge <n> --squash`, attempted **once**.
4. Post-merge: repoint the PR body's spec link to its `blob/main/` URL (the branch link dies with
   the squash-merge), fill the ship note's links, then `send-ship-note.sh <slug> --send`.

## Status / board

- One run: `gh pr view <n> --json state,isDraft,labels,body` plus `gh pr checks <n>`. The PR number
  comes from `run.md`.
- Board: `gh pr list --label type:feature --state open` (repeat per lane label as needed), plus
  `gh pr list --state merged --limit 5` for recently shipped.
