# Stage 02 — Define (contract)

Invoked via `/pipeline new "<request>"`, `/pipeline new [<stub>]`, or `/pipeline define <slug>`.
Your job is **one thing**: produce a spec the human can approve, and open the run's **single feature
PR** — the spine regime, one PR and one branch from here to Release. **No code here.**

## Inputs (read only these)

- The user's request (the argument / conversation).
- **The intake stub, when one was passed** (`.icm/intake/<scope-slug>/<feature-slug>.md`) — it
  pre-seeds most of the spec from settled scope.
- **The front's artifact, when it exists for the stub's scope:**
  `.icm/runs/<scope-slug>/01_scope/output/scope.md` — the agreed logic. Scope commits it straight
  to `main`, so a missing file after a fresh `git pull` means Scope never ran for this epic — not
  a wrong checkout. Work that arrived pre-agreed needs no front at all.
- `.icm/_shared/knowledge-map.md` — from it, only `business/initiatives/`, `business/roles/`,
  and `technical/architecture` (to fill `touches:` and `apps:` with real paths).
- `.icm/_shared/github.md` — the PR projection contract and the revise path.
- If revising: the existing `.icm/runs/<slug>/02_define/output/spec.md`.

Do **not** load `_shared/conventions.md` (that's Build's) and do not read the wider codebase. A few
targeted greps to confirm where something lives are fine.

Context budget: the Inputs above are the budget (`.icm/CONTEXT.md` → Layers). Record overruns on
a one-line `Context budget:` note in `spec.md`.

## Process

1. **Resolve the slug.** A stub's `feature-slug` is the slug; pre-seed the spec from it — `apps`,
   Problem, Proposed change, Acceptance criteria, Out of scope, and the initiative link all carry
   over (`depends-on` and `sequence` are context, not spec fields). For a plain-English request with
   no front behind it, pick a short kebab-case slug yourself: the full front isn't mandatory for
   work that arrives pre-agreed.

2. **Resolve every remaining requirement here — Define is the last stage that gathers them.** Scope
   settled the business logic; your job is the spec-level residue: exact behaviour, `touches:`, edge
   cases. If something that affects _what gets built_ is still ambiguous, ask sharp questions
   (`AskUserQuestion`) until nothing is open. Don't invent requirements, don't defer decisions to
   Build, and don't re-ask what the stub already settled. Deliberate deferrals go under **Out of
   scope**, never left open.

3. **Write the spec** to `.icm/runs/<slug>/02_define/output/spec.md` (template below) — the
   canonical spec; the PR only links to it. In **Problem**, connect the need to the initiative it
   advances (or say plainly that `business/initiatives` is still a stub — don't invent one).

4. **Validate structurally — script, not eyeball:**

   ```bash
   .icm/scripts/validate-spec.sh <slug>
   ```

   `RESULT: OK`, or fix what it lists and re-run. Heed its open-questions advisory.

5. **Open the run — script, not by hand:**

   ```bash
   .icm/scripts/new-run.sh <slug> --summary "<one plain sentence — what a user can now do>" \
       [--stub .icm/intake/<scope-slug>/<feature-slug>.md]
   ```

   It commits the run and pushes, opens the draft PR with a body projected from `spec.md`, writes or
   extends `run.md`, projects labels, and `git mv`s the consumed stub into `_done/`. Pass `--stub`
   whenever the spec came from one. Skip the script **only** for explicitly throwaway work — then
   write `run.md` by hand.

   **Branch check first:** the script opens the PR from the _current_ branch. Scope commits its
   artifacts straight to `main`, so start from a fresh branch off `origin/main` before running the
   script — never a branch whose PR has already merged.

6. **Revising an existing spec?** Edit `spec.md`, commit, push, re-run `validate-spec.sh`, then
   reconcile **one direction only** (file → PR): `gh pr edit` for the summary and criteria text,
   `project-labels.sh <slug> --stage define` for the labels. Never re-run `new-run.sh` — one PR per
   run.

7. **Stop.** Point at the spec path and the draft PR URL. Editing the spec is how you steer Build;
   **ticking "Spec approved" on the PR is the gate** — Build won't start without it, and you never
   tick it.

## Outputs

`.icm/runs/<slug>/02_define/output/spec.md`:

```md
# Spec: <feature title>

- slug: <slug>
- apps: <web | admin | marketing | docs | support | demo | packages — comma-separated>
- touches: <e.g. apps/web/app/(app)/billing, packages/services/src/db>
- complexity: trivial | standard | complex

## Problem

<what's wrong or missing today, and why it matters — 2–4 sentences>

## Proposed change

<what we'll build, functionally — not implementation detail>

## Acceptance criteria

- [ ] <observable, testable outcome 1>
- [ ] <outcome 2>

## Out of scope

- <things we are explicitly NOT doing this run>

## Open questions

- <only non-blocking notes, or "none" — anything affecting what gets built is decided before
  approval, or moved to Out of scope. Build will not answer it for you.>
```

Plus `run.md` (extended with `branch:` and `pr:` if the front already created it), the run committed
and pushed, and a **draft PR** whose body and labels are projected from `spec.md`.

## Verify (before handing off)

- Acceptance criteria are observable and checkable; no open question blocks one.
- `apps:` names real workspace apps and `touches:` names real paths.
- `validate-spec.sh` returns `RESULT: OK`.
- The draft PR exists, its body **links** to `spec.md` (no embedded copy), both gate boxes are
  present and unticked, and the labels match the spec header; `run.md` records branch and PR.
- The run is committed and pushed — resumable from any device.
- You stopped for human review. You did not start building.
