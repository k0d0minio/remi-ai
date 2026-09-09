# GitHub — the PR regime, gates, and mechanics (Layer 3 reference)

Repo: **`k0d0minio/remi-ai`**.

The pipeline drives GitHub through the **`gh` CLI**. If a GitHub MCP server is connected in the
session, its equivalent calls are fine too — but pick one per run and don't mix them mid-stage.

**Scripts own the mechanical projections; the CLI is for reads, edits, and merges.** The
deterministic work runs through the `curl` + `jq` scripts in `.icm/scripts/`, configured from the
environment (`GITHUB_TOKEN` / `GH_TOKEN`, optional `GITHUB_REPO` / `GITHUB_API_URL`):

- **`resolve-run.sh <slug>`** — resolve a run into the working tree, or STOP (`stage-preamble.md`).
- **`new-run.sh <slug> --summary "…" [--stub …] [--lane bug|tweak|chore]`** — open the run's PR and
  write `run.md` (Define, and the fast lanes).
- **`project-labels.sh <slug> --stage <…>`** — project the label set from `spec.md`.
- **`ci-status.sh <slug>`** — the one blocking verdict call (`.icm/_shared/ci.md`).

**Read narrowly — one call per question.** Use the single read that answers it: the PR body when you
need a gate, review comments when you are triaging them, the failing job's logs when something is
red. `gh pr view <n> --json <only the fields you need>`; `gh pr list` with a tight filter and a small
`--limit`. Never page through comment threads, check-run histories or diffs you don't need — a read
is paid for out of the session's context, and a read nobody acts on is pure loss.

## The two PR regimes

1. **The front (Scope)** — no feature PR exists yet. **Scope opens no PR at all.** Its artifacts
   (`scope.md` + the intake folder) are markdown only and commit **straight to `main`**, so every
   device is in sync immediately. If branch protection rejects the push, fall back to a tiny
   docs-only PR merged green — never leave the front's artifacts local-only.

2. **The spine (Define → Release)** — **exactly one PR per run.** Define opens it once (via
   `new-run.sh`, as a draft); every later stage adds commits to the same branch — code, docs,
   changelog, the release record, any last cleanup. Never open a second PR for a run, never re-run
   `new-run.sh` against it, never branch off a docs-only or cleanup-only PR.

Fast-lane PRs (`--lane`) are a third, degenerate shape: one non-draft PR opened by `new-run.sh`
whose body carries **only** the Ready-to-merge gate.

**The PR is the run's GitHub home.** Its body and labels are one-way projections of `spec.md`
(spine) or the lane's `notes.md` summary. No issue is created; PRs carry no `Closes #`.
**Ticket-only commits go straight to `main`** — planning is data; code goes through the run's PR.

## PR events — no PR in this repository is subscribed

**The rule is every PR, not only pipeline ones**, and it binds whatever opened the PR: a stage, a
lane, or a session doing a one-off chore. Do **not** subscribe to PR activity here — and if a
session finds itself subscribed, **unsubscribe immediately and say so**. A harness may auto-subscribe
after it opens a PR, and some harnesses instruct the agent to watch every PR it opens; **a harness
default does not override this file.** This is the repository's own rule about its own PRs, and it
outranks a default nobody asked for.

One push produces a dozen-plus events and not one of them is a verdict. This repo is six Vercel
projects and three workflows: every push cycles each deploy target `pending` → `success`, the deploy
bot posts its comment table and re-edits it as each target finishes, and every Actions job starts and
finishes. Each event wakes the session, costs a full turn, and re-sends the whole comment table — a
single PR can burn more context on deploy-table edits than the change itself took to write. Measured
on one PR in the estate's largest repo on 2026-09-02: **a dozen wake-ups, every one of them "nothing
red, no action".**

Read state instead:

- **CI:** the one blocking `.icm/scripts/ci-status.sh <slug>` call per push (`.icm/_shared/ci.md`).
  Its waiting costs wall-clock, not model turns.
- **Review comments:** one read at the Release point, and at any explicit triage — not a stream.
- **Anything longer-running** — a chore PR waiting on a tick, a CI run still to come back — is a
  **scheduled check-in**, not a subscription: one wake on a timer that reads the state once and
  re-arms, instead of a wake per webhook. Same coverage, a fraction of the turns.

Watching a PR event-by-event stays a **deliberate, human-requested act** ("babysit this PR") — never
a default, and never something a session opts into on its own behalf. If an event arrives anyway — a
requested watch, a race before the unsubscribe landed — `.icm/_shared/ci.md` § Webhook events says
what may and may not be done with it.

## Gates — checkboxes in the PR body

The template ends with the pipeline checklist, anchored so parsing never depends on wording:

```md
<!-- gate:spec-approved -->

- [ ] Spec approved (Define gate — a human ticks this before Build)

<!-- gate:ready-to-merge -->

- [ ] Ready to merge (Release gate — a human ticks this to authorise the squash-merge; ticking it
      attests your own testing of the change)
```

- Read a gate: `gh pr view <n> --json body` → find the anchor comment → the next checklist line is
  the gate; `[x]` means ticked.
- **A missing anchor means "not required", never "unticked".** Lane PRs carry only
  `gate:ready-to-merge`; parse what's present. A missing `gate:ready-to-merge` anchor on **any**
  pipeline PR is a malformed body — STOP and fix the body first.
- **The agent never ticks either box — there is no scripted exception.** If a required box is
  unticked: STOP and say so. The ticked **Ready to merge** box _is_ the merge authorisation, and it
  attests the owner's own manual and signed-in testing — Release asks for nothing beyond it.
- **CI reads the same anchors.** The `Pipeline gates` job (`.github/workflows/gates.yaml`) fails
  while a gate present in the body is unticked, so the tick is what turns the check green — the
  honour system is a required check. Its parse is the one described above, plus a fallback on the
  label text so that deleting an anchor cannot silently drop a gate.
- `gh pr merge` is **not** on the pre-approved command list (`.claude/settings.json`): the merge
  itself asks the operator once, at the keyboard. That prompt is a tool permission, not a second
  gate — the ticked box already authorised it.

## Merging

Merge only when, in this order: the gate is `[x]` (re-read after your last push) →
`ci-status.sh <slug>` printed `RESULT: GREEN` on the head you are about to merge → squash-merge,
attempted **once**. Never on RED; never on PENDING ("not-yet-red is not green"); never on a verdict
you didn't establish yourself after your own last push. Do not substitute a bare `gh pr checks` read
for the script — it misses commit statuses and counts superseded attempts.

## Labels

The fixed vocabulary lives in `.github/labels.yml` (documentation + one-time repo setup).
**Projection is CI's job, not the agent's:** on every push touching `.icm/runs/**`, the `labels`
job in `.github/workflows/pipeline.yaml` runs `project-labels.sh <slug> --stage auto --pr <n>`. It
reads `apps:` and `complexity:` from `spec.md` and derives `stage:*` from **which run outputs
exist**:

| Output present                 | Stage label     |
| ------------------------------ | --------------- |
| `02_define/output/spec.md`     | `stage:define`  |
| `03_build/output/notes.md`     | `stage:build`   |
| `04_release/output/release.md` | `stage:release` |

Pushing a stage's output is what moves the label. `new-run.sh` projects the initial set when the PR
opens; the script stays the manual fallback.

The script also reads the **legacy six-stage layouts** (`03_define` / `04_build` / `05_verify` /
`06_ship`) so the archived runs under `.icm/runs/_done/` keep projecting, mapping `verify` and
`ship` onto `stage:release`. Nothing new writes those paths. It reads `_done/` as well as the live
folder for the same reason Release closes a run out before the merge: from that commit on, the run
is only there.

- `stage:` — exactly one of `define → build → release`.
- `type:feature` on spine PRs · `type:{bug,tweak,chore}` on lane PRs.
- `app:{web,admin,marketing,docs,support,demo,packages}` and `complexity:{trivial,standard,complex}`
  from the spec header (spine only).
- `stage:verify`, `stage:ship` and `type:design` are **historical only** — they stay in
  `labels.yml` so the archived runs' merged PRs keep valid labels, and nothing projects them again.

> **Why `app:` and not `persona:`** — the persona vocabulary this pattern came from was grounded in
> a documented set of six roles. Remi AI documents three (`apps/docs/app/business/roles` — person,
> practitioner, operator), and `app:` is the dimension that is verifiable from the diff itself. Add
> a `persona:` axis alongside it when a run needs one; the projection script takes the new
> vocabulary in one place.

## Define — draft PR projected from `spec.md`

```bash
.icm/scripts/new-run.sh <slug> --summary "<one plain sentence>" \
    [--stub .icm/intake/<scope>/<feature>.md]
```

Commits `.icm/runs/<slug>/` and pushes; opens the draft PR (`base: main`, title from the spec's
`# ` heading, body projected from `spec.md`: Spec block, acceptance criteria mirrored **unticked**,
both gate anchors, and a **link** to `spec.md` — never an embedded copy); writes or extends
`run.md`; projects labels; `git mv`s a consumed stub into `_done/`. **One PR per run.**

Revising the spec later = edit `spec.md`, commit, push, then reconcile **one direction only**
(file → PR): `gh pr edit <n> --body …` for the summary and criteria text, and `project-labels.sh`
for the labels. Never re-run `new-run.sh`.

## Build — gate-check, implement, prove, open

1. Gate: `gh pr view <n> --json body` → **Spec approved** must be `[x]`. Unticked → STOP.
2. Implement; commit the run files with the code; push (CI advances `stage:build`). Tick satisfied
   acceptance criteria with `gh pr edit` — tick state lives on the PR, the text stays the spec's.
3. Establish green: `ci-status.sh <slug>` → `GREEN`. RED is Build's to fix.
4. Hand off: `gh pr ready <n>` (draft → open), and say what the owner should test.

## Release — one gate, one merge

1. Gate: **Ready to merge** must be `[x]`. Unticked → STOP and ask. Never tick it. The tick attests
   the owner's manual testing; Release never re-asks for it.
2. `ci-status.sh <slug>` → `GREEN`. Run the review passes; triage review comments with
   `gh pr view <n> --json reviews,comments` — one read, not a stream. Fixes are commits on this
   branch; everything off-ticket becomes a `.icm/intake/triage/` stub.
3. Push the docs, changelog and `release.md` (CI advances `stage:release`), then **re-run
   `ci-status.sh` on the head you just pushed** — one settled verdict per push, and the last one is
   the verdict that authorises the merge.
4. Re-read the gate, then `gh pr merge <n> --squash`, attempted **once**.
5. Post-merge: repoint the PR body's spec link to its `blob/main/` URL (the branch link dies with the
   squash-merge), fill the ship note's links, then `send-ship-note.sh <slug> --send`.

## Status / board

- One run: `gh pr view <n> --json state,isDraft,labels,body` plus one `ci-status.sh <slug> --no-wait`
  (reporting only — never gate on `--no-wait`). The PR number comes from `run.md`.
- Board: `gh pr list --label type:feature --state open` (repeat per lane label as needed), plus
  `gh pr list --state merged --limit 5` for recently shipped.
