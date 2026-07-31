# Stage 02 — Design (contract)

Invoked via `/pipeline design <slug>`. Your job is **one thing**: build a visual design and
prototype of the agreed scope in `apps/demo`, get it onto the live demo URL through the demo-PR
flow, and iterate until the owner approves it from that URL. No feature PR, no real-app code — that
starts at Define.

`apps/demo` is the safe sandbox: mock data only, no `@remi/services`, no auth (see
`apps/demo/AGENTS.md`). The demo deploys from `main`, so Design merges its own small PRs — the
**front regime** in `pipeline/_shared/github.md` — and the owner always reviews the real deployed
thing, never a screenshot.

## Inputs (read only these)

- `pipeline/runs/<slug>/01_scope/output/scope.md` — the agreed scope. **No scope.md → STOP**: send
  the user to `/pipeline scope "<topic>"` first; Design never invents scope. (Scope pushes its
  artifacts straight to `main`, so a missing file after a fresh `git pull` means Scope never ran —
  not a wrong checkout.)
- `pipeline/intake/<slug>/breakdown.md` — the cut, so the prototype covers the scoped flows.
- `apps/demo/AGENTS.md` + `/CONVENTIONS.md` — the sandbox rules and the design-system rules.
- `pipeline/_shared/github.md` — the demo-PR (front) regime.
- Capability skills, preferred over hand-rolling: `accessibility`, `dummy-dataset`,
  `webapp-testing`, and any shadcn/design skill available in the session.

Context budget: the Inputs above are the budget (`pipeline/CONTEXT.md` → Layers). Record overruns on
a one-line `Context budget:` note in `design-notes.md`.

## Process

1. **Resolve the scope** and restate in one line what the demo must let the owner experience — the
   acceptance criteria as clickable flows.

2. **Build the prototype in `apps/demo` only.** Pages, tiles, tables, flows — whatever makes the
   scope tangible. Realistic mock data in `lib/mock/` (`dummy-dataset` skill), primitives from
   `@remi/ui`, tokens not raw palette colours, no backend. Keep it honest to what Build can actually
   deliver — a prototype that promises something the real stack can't do costs more than it saves.

3. **Ship it through demo PRs — each from a fresh branch off `origin/main`.** After a demo PR
   squash-merges its branch is dead: reusing it for the next one drags merged commits along and
   conflicts. Fetch and branch anew per iteration.

   **Autonomous merge is allowed** when both hold: the diff touches only `apps/demo/**` plus this
   run's `pipeline/runs/<slug>/**` and `pipeline/intake/<slug>/**` files (check
   `git diff --name-only origin/main...HEAD`), **and** CI is green. Attempt the squash-merge once;
   branch protection rejects it while checks are red — fix and retry once, no polling. Anything
   outside those paths → **STOP and ask**. Record each PR in `run.md` under `preview-prs:`.

4. **Iterate from the live URL.** Hand over the deployed demo path; fold feedback in via further
   demo PRs. This loop *is* the stage.

5. **Declare throwaway vs seed.** Record in `design-notes.md` whether the demo is a **throwaway**
   (Build re-implements from scratch) or a **seed**, and why in one line — Define copies this into
   the spec's `demo:` field. Be honest about what "seed" means: a **visual** seed. `apps/demo` has
   no services and no auth, so Build re-implements against the real stack using the demo as
   reference-level material, not as a port.

6. **Revisit the cut.** Prototyping is where the real shape of the work shows itself. Re-read
   `pipeline/intake/<slug>/breakdown.md` against what you built: if the scope now clearly splits
   differently — one stub should be several, several should be one, the order is wrong — update the
   breakdown and stubs per `intake/CONTEXT.md` **before** handing to Define. A single-PR scope
   keeping its single stub is the common case; say which happened in `design-notes.md` either way.
   Define consumes exactly one stub per run, in sequence, so this is the last cheap moment to fix
   the cut.

7. **Gate.** Hand over the live demo URL and stop this stage's loop there. Sign-off needs no
   ceremony: **the operator proceeding to `/pipeline new` is the record that the demo was approved.**
   Record the URL and the date in `design-notes.md`. If changes are wanted, they arrive as feedback
   and the loop in step 4 continues instead.

8. **Stop.** Say where the notes are, and that `/pipeline new` walks the intake batch into Define —
   running it is what closes this gate.

## Outputs

Demo code merged to `apps/demo` (live on the demo URL), `run.md` updated with `preview-prs:`, and
`pipeline/runs/<slug>/02_design/output/design-notes.md`:

```md
# Design notes: <slug>

- demo: throwaway | seed — <one line why>
- approved-url: <the live demo path signed off> · approved: <YYYY-MM-DD>
- preview-prs: <#12, #14 — mirror of run.md>

## What was built

- <page/flow>: <what it demonstrates>

## Notes for Define/Build

- <constraints discovered, mock-data shapes worth keeping, anything the spec must honour>
```

## Verify (before handing off)

- Every demo PR touched only `apps/demo/**` plus this run's pipeline files, and merged green — the
  autonomous-merge guard was checked per PR, and `run.md` lists them all.
- The prototype covers the scoped flows from `breakdown.md`, and the live URL was handed over.
- The demo still reaches no backend — no `@remi/services` import, no fetch, no secret. If the
  prototype needed one, that's a signal the feature has outgrown the demo, and it's recorded as such.
- The cut was revisited against the prototype — `design-notes.md` says whether the stubs changed.
- `design-notes.md` declares throwaway-vs-seed with a reason.
- No feature PR, no `apps/web` or `packages/**` changes, no spec.
