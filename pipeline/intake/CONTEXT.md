# Intake — the cut (contract)

**Invoked by the Scope stage** (`pipeline/stages/01_scope/CONTEXT.md`, step 5 — after the scope is
agreed). There is no `/pipeline decompose` subcommand; the cut is part of the front. Your job here
is **one thing**: turn the agreed scope into a sequenced batch of feature **stubs** — one per future
run, one per future PR — that `/pipeline new` walks into Define. No spec, no code, and no run is
created by the cut itself.

The stub folder is the only state. It has no branch or PR of its own; it rides into git with Scope's
commit to `main`. Re-cutting after a human edits `breakdown.md` regenerates the stubs. **Every
agreed scope gets an intake folder, however small** — a single-PR scope gets exactly one stub whose
`feature-slug` is the scope slug itself.

## Inputs (read only these)

- The agreed scope — `runs/<scope-slug>/01_scope/output/scope.md`.
- `pipeline/_shared/knowledge-map.md` — from it, only `business/roles/` and `business/initiatives/`,
  for the real product seams to cut along. Both are written; cut along the seams they describe, and
  fall back to the seams the scope itself describes only where they are silent — noting that in the
  breakdown.

Do **not** load `_shared/conventions.md` and do **not** read source code. The cut runs inside the
Scope stage and inherits its rule: seams come from the business docs and the agreed scope. If a seam
is unclear, that is a hole in the scope (Scope step 2), not something to confirm in the codebase.

Context budget: the Inputs above are the budget (`pipeline/CONTEXT.md` → Layers). Record overruns on
a one-line `Context budget:` note in `breakdown.md`.

## Process

1. **The folder is `pipeline/intake/<scope-slug>/`** — the slug picked at Scope. Reuse it when
   re-cutting.

2. **Cut-level ambiguity is resolved from the scope, not re-asked.** Who it's for, the why, and the
   in/out boundary were all settled in the Scope interrogation. If the scope leaves a hole that
   affects the _cut_, go back to Scope step 2 — don't guess, and don't ask new questions here.
   Per-feature detail stays Define's job.

3. **Cut along product seams.** Each stub maps to **exactly one** future run and one PR, however
   many that takes. If a candidate is too big to be one feature, **flag it** in the breakdown — never
   silently nest a scope inside a stub.

4. **Put them in a strict build order** — the order `/pipeline new` walks:
   - Every stub gets a unique `sequence: n of m`, contiguous `1..m`.
   - The order is a **topological linearization** of `depends-on`: a stub's number always exceeds
     every in-scope stub it depends on.
   - Where the graph allows parallelism, still pick a deterministic tie-break (foundation first,
     then impact) and capture the parallel shape under `## Parallelizable`.

5. **Write the breakdown and stubs** (templates below). `breakdown.md` leads with what you
   understood, so a misread is caught before the cuts are made.

6. **Hand back to Scope** (step 6 of its contract): the human reviews `breakdown.md`, and editing it
   then re-running the cut is how you steer it. Stubs are spun out later, one at a time, by
   `/pipeline new` — never automatically.

## Outputs

`pipeline/intake/<scope-slug>/breakdown.md` — the single review surface:

```md
# Breakdown: <scope title>

- scope-slug: <slug>
- initiative: <name, or "business/initiatives is still a stub">

## What I understood

<3–6 sentences restating the intent — so a misread is caught before the cuts>

## Build order

<The exact order `/pipeline new` walks — a strict total order, one stub per line.>

1. <feature-slug> — <one line> — depends-on: <none / other feature-slugs>
2. <feature-slug> — <one line> — depends-on: <…>

## Parallelizable

<Optional — the dependency shape behind the linear order. Omit if it's a plain chain.>

## Out of scope (whole scope)

- <carried from the scope — what no stub covers this round>
```

`pipeline/intake/<scope-slug>/<feature-slug>.md` — one per feature. This is the **handoff
contract**: its fields map mechanically onto Define's `spec.md`.

```md
# Stub: <feature title>

- feature-slug: <kebab>
- scope: <scope-slug>
- apps: <web | admin | marketing | docs | support | demo | packages>
- initiative: <name, or none yet>
- depends-on: <other feature-slugs, or none>
- sequence: <n of m> # what `/pipeline new` reads to find "next"

## Problem

<one-liner → seeds the spec's Problem>

## Proposed change

<what we'll build, functionally — not implementation detail>

## Acceptance criteria (rough)

- [ ] <observable, testable outcome>

## Out of scope (this feature)

- <things this feature explicitly won't do>

## Notes for Define

<scope-level decisions Define must honour; an optional `touches:` guess>
```

## Verify (before handing back to Scope)

- Every stub is **independently shippable** — one stub, one future run, one PR.
- Each stub names the app(s) it lands in and sits on a real product seam; nothing stub-sized is
  actually scope-sized (if it is, it's flagged, not nested).
- The order is **strict and dependency-respecting**: `sequence` is unique and contiguous, every
  stub's number exceeds its `depends-on`, `## Build order` and the stubs' `sequence:` agree, and
  re-cutting the same graph reproduces the same order.
- No run, branch, or PR was created by the cut.
