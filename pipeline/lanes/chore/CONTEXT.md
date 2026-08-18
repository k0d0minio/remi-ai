# Lane — Chore (contract)

Invoked via `/pipeline chore "<task>"`. A fast lane for work with **no user-facing behaviour
change**: refactors, dependency bumps, migrations, cleanups, CI and tooling. No scope, no spec, no
Spec-approved gate. One PR, one gate — **Ready to merge**.

If behaviour would change for anyone, it isn't a chore — route to the spine (or `bug`).

## Inputs (read only these)

- The user's request.
- `/CONVENTIONS.md` plus the relevant `apps/*/AGENTS.md` or `packages/*/AGENTS.md`.
- `pipeline/_shared/github.md` — the lane-PR regime and merge mechanics.
- Only the source the task names. For a migration, also the `db/migrations` conventions in
  `packages/services/AGENTS.md`.

Context budget: the Inputs above are the budget (`pipeline/CONTEXT.md` → Layers).

## Process

1. **Pick a slug** (kebab-case) and **state the invariant**: what must be true before and after —
   behaviour unchanged, only `<X>` differs. A dep bump names the version delta; a refactor names the
   shape change; a migration names the data delta **and its `down`**.

2. **Do the work.** Keep it single-purpose — a chore PR that also "fixes a few things on the way" is
   two PRs pretending to be one, and it is the shape of PR that gets merged without real review.

   Two chores in this repo have extra weight because the structure depends on them:
   - **A dependency bump** to a shared runtime dep updates the pnpm `catalog:` entry, not an app's
     own pin. If an app has its own pin, removing it is part of the chore.
   - **An env var change** touches three files in one PR: the zod schema in
     `packages/services/src/server/env.ts`, a row in `.icm/docs/ENV.md`, and `globalEnv` in `turbo.json`
     — plus the value set in Vercel and Actions.

3. **Open the lane PR:**

   ```bash
   pipeline/scripts/new-run.sh <slug> --lane chore --summary "<the invariant in one sentence>"
   ```

   Write `notes.md` first (template below). The PR opens ready (non-draft), its body carries only
   the Ready-to-merge gate, labelled `type:chore`.

4. **Stop.** CI verifies — never local checks. Migrations and env-var changes deserve a readiness
   pass before the tick; say so when handing over. On the ticked **Ready to merge** box, merge per
   `_shared/github.md` — squash, once, no polling.

## Outputs

`pipeline/runs/<slug>/run.md` (with `- lane: chore`) and
`pipeline/runs/<slug>/lane/output/notes.md`:

```md
# Chore: <slug>

- invariant: <behaviour unchanged; what differs>
- change: <file/area>: <what and why>
- rollback: <migration down / revert — how this is undone if needed>
```

## Verify

- No user-facing behaviour changed; the invariant holds.
- Migrations have a working `down`; new env vars are in all three files **and** set in both
  dashboards.
- One PR, `type:chore`, no Spec-approved anchor; the merge only ever happens on the ticked box.
