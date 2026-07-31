# Lane — Bug (contract)

Invoked via `/pipeline bug "<what's broken>"`. A fast lane, not the spine: no scope, no demo, no
spec, no Spec-approved gate. One PR, one gate — **Ready to merge**. If the "bug" turns out to need
product decisions, or touches more than it fixes, STOP and route to `/pipeline scope` instead.

## Inputs (read only these)

- The user's report, and the reproduction it leads you to.
- `/CONVENTIONS.md` plus the relevant `apps/*/AGENTS.md` or `packages/*/AGENTS.md`.
- `pipeline/_shared/github.md` — the lane-PR regime (single gate) and merge mechanics.
- Only the source files the reproduction implicates.

Context budget: the Inputs above are the budget (`pipeline/CONTEXT.md` → Layers).

## Process

1. **Pick a slug** (`fix-<what>`, kebab-case) and **reproduce first.** State the observed and the
   expected behaviour in one line each. Can't reproduce → STOP and report what you tried. Don't fix
   blind: a fix with no reproduction behind it is a guess that removes the evidence.

2. **Fix the cause, not the symptom** — minimal diff, no drive-by refactors. If the same defect
   could exist elsewhere in the codebase, say so in the notes rather than expanding this PR to chase
   it.

3. **Verify against the reproduction** — on the code path now, and on the Vercel preview after the
   push. If the bug was user-visible, note whether a changelog entry is warranted, and include it in
   this same PR if so.

4. **Open the lane PR:**

   ```bash
   pipeline/scripts/new-run.sh <slug> --lane bug --summary "<what was broken → what's true now>"
   ```

   Write `notes.md` first (template below). The script commits `pipeline/runs/<slug>/`, pushes,
   opens a ready (non-draft) PR whose body carries **only** the Ready-to-merge gate, and labels it
   `type:bug`.

5. **Stop.** CI and the preview verify — never run local checks. Say the PR is up and that ticking
   **Ready to merge** authorises the squash-merge; then re-invoke `/pipeline bug <slug>` to merge per
   `_shared/github.md`: read the gate, ticked → squash-merge once, no polling.

## Outputs

`pipeline/runs/<slug>/run.md` (with `- lane: bug`) and `pipeline/runs/<slug>/lane/output/notes.md`:

```md
# Bug: <slug>

- observed: <what happened> · expected: <what should happen>
- cause: <one line — the actual defect>
- fix: <file/area>: <what changed>
- same defect elsewhere: <checked — none | possibly in <where>, not in this PR>
- changelog: <entry added | not user-visible>
```

## Verify

- The reproduction is recorded and the fix addresses its **cause**; the diff is minimal.
- One PR, `type:bug`, no Spec-approved anchor in its body; the merge only ever happens on the ticked
  box.
- Anything that grew beyond a fix was STOPped and routed to Scope, not absorbed here.
