# Stage 04 — Build (contract)

Invoked via `/pipeline build <slug>`. Your job: turn the approved spec into working code on the
run's branch, then flip the draft PR to open. Verification is Verify's job; merging is Ship's.

## Inputs (read only these)

- `pipeline/_shared/stage-preamble.md` — run it **first**: it resolves the run into the working tree
  or STOPs. Never recreate a missing run.
- `pipeline/runs/<slug>/03_define/output/spec.md` — the canonical spec you implement against.
- `pipeline/runs/<slug>/run.md` — branch and PR pointers.
- If the spec says `demo: seed`: the demo code under `apps/demo`. It is **reference material, not a
  port** — `apps/demo` has no services and no auth, so the real implementation is written against
  the real stack. `demo: throwaway` means look, don't copy.
- `/CONVENTIONS.md` plus the relevant `apps/*/AGENTS.md` or `packages/*/AGENTS.md` — the canonical
  code rules you must follow.
- `pipeline/_shared/knowledge-map.md` — routes to `apps/docs` technical reference. Read only what
  you need: `technical/architecture` (where code lives, which entrypoint to import), the relevant
  `technical/packages` page, `technical/development`.
- `pipeline/_shared/github.md` — the gate read and the draft → open flip.
- The specific source files named in the spec's `touches:` — those, not the whole monorepo.

Context budget: the Inputs above are the budget (`pipeline/CONTEXT.md` → Layers) — everything except
the source files you actually edit. Record overruns on a one-line `Context budget:` note in
`notes.md`.

## Process

1. **Run the shared preamble** (`pipeline/_shared/stage-preamble.md`) — resolve the run, or STOP.

2. **Gate-check.** Read the PR body: the **Spec approved** checkbox must be ticked. **If it isn't,
   STOP** — do not build against an unapproved spec, and never tick the box yourself. Tell the user
   to settle the spec (`/pipeline define <slug>`) and tick the box, then re-run Build.

3. **Stage label — CI handles it.** The `pipeline.yaml` labels job re-projects on every push and
   derives `stage:*` from which run outputs exist, so committing `notes.md` (step 8) is what moves
   the board to `stage:build`. Skip `project-labels.sh` — it is only a manual fallback.

4. **Implement the acceptance criteria, and only those.** Follow `/CONVENTIONS.md` exactly. Keep
   edits minimal and focused — no drive-by refactors.

   **Build does not gather requirements.** If the spec is ambiguous, or an `## Open questions` entry
   blocks an acceptance criterion, **do not** decide it here and do not invent an answer — **STOP**
   and send the user back to `/pipeline define <slug>`, then re-run Build.

   Watch the three rules that this repo's structure depends on, because they are the ones a focused
   implementation quietly breaks:
   - A component two apps could use goes in `packages/ui` from its first commit, never copied.
   - A new `process.env` read goes through `packages/services/src/server/env.ts`, plus a row in
     `.icm/docs/ENV.md` and a `globalEnv` entry in `turbo.json` — same PR.
   - The superseded implementation is deleted in the same change as its replacement.

5. **Use capability skills where they apply.** For repeatable work, prefer the matching skill in
   `.claude/skills/` over hand-rolling it.

6. **Self-check each acceptance criterion.** If one can't be met, note it rather than dropping it.
   Tick the satisfied criteria in the PR body — tick state lives on the PR, the text stays the
   spec's. To reword a criterion, edit `spec.md` and reconcile.

7. **Commit and push — the factory verifies, not you.** Don't run `pnpm format`, `pnpm lint`, or
   `tsc` (see Verify below). Husky formats on commit; CI runs format, lint and typecheck; the Vercel
   preview builds the PR. Spend your turns on code.

8. **Write build notes.** Commit the run files alongside the code and push, so the PR reflects
   current state.

9. **Flip the draft PR to open** (`gh pr ready <n>`). Open means "reviewable"; it is not merge
   authorisation.

10. **Stop.** Say Build is done, the PR is open, and the next step is `/pipeline verify <slug>` — the
    quality gate before anything ships.

## Outputs

- Code on the run's branch, in small conventional commits (`feat: <slug> — <what>`).
- The PR flipped from draft to open, with satisfied acceptance criteria ticked.
- `pipeline/runs/<slug>/04_build/output/notes.md`:

```md
# Build notes: <slug>

- commits: <short list>
- demo: <used the seed as reference | re-implemented (throwaway) | none>

## What changed

- <file/area>: <why>

## Acceptance criteria status

- [x] <criterion> — <how it's met>
- [ ] <criterion> — <blocked because…>

## Notes for Verify

- <anything the reviews should look at closely; a check you already know will fail, and why>
```

## Verify (owned by the factory, not this agent)

Mechanical checks are deterministic, non-AI work — they belong to the factory (Husky + CI + the
Vercel preview), not to your context window. **Do not run `pnpm format`, `pnpm lint`, or `tsc`** —
`.claude/hooks/block-local-checks.sh` blocks them. Push, and read CI back.

- **Format** — Husky pre-commit runs prettier on staged files; CI re-checks.
- **Lint / typecheck** — `.github/workflows/quality.yaml`, on every PR including docs-only ones.
- **Build** — the Vercel preview deploy compiles the whole PR.
- **Gates** — `.github/workflows/gates.yaml` reads the PR body's gate checkboxes. It is red while a
  gate is unticked, which is its job, not a failure to fix.

Verify and Ship gate on these via the PR's check runs. The one local exception: if you _already
know_ an edit introduced a type error, fix it before pushing rather than burning a CI round-trip —
but don't kick off a full-repo sweep to go looking.
