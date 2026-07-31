# Lane — Tweak (contract)

Invoked via `/pipeline tweak "<small adjustment>"`. A fast lane for tiny, low-risk, already-clear
changes — copy, spacing, a label, a default, a threshold. No scope, no spec, no Spec-approved gate.
One small PR, one gate — **Ready to merge**.

If it needs a decision the user hasn't already made, or it touches data, auth or payments, it isn't
a tweak — STOP and route to `/pipeline scope` (or `bug` / `chore` if that's what it really is).

## Inputs (read only these)

- The user's request.
- `/CONVENTIONS.md` plus the relevant `apps/*/AGENTS.md` — sentence case, `Typography`, tokens.
  Most tweaks live entirely inside those rules.
- `pipeline/_shared/github.md` — the lane-PR regime and merge mechanics.
- Only the file(s) being adjusted.

Context budget: the Inputs above are the budget (`pipeline/CONTEXT.md` → Layers).

## Process

1. **Pick a slug** (kebab-case) and confirm the change is fully specified by the request — a tweak
   has no open questions by definition. If you find yourself choosing between two reasonable
   readings, it isn't a tweak.

2. **Make the adjustment** — the smallest possible diff, house style. A copy change stays sentence
   case; a colour change becomes a token, not a raw class.

3. **Open the lane PR:**

   ```bash
   pipeline/scripts/new-run.sh <slug> --lane tweak --summary "<the adjustment in one sentence>"
   ```

   Write `notes.md` first (template below). The PR opens ready (non-draft), its body carries only
   the Ready-to-merge gate, labelled `type:tweak`.

4. **Stop.** CI and the Vercel preview verify. On the ticked **Ready to merge** box, merge per
   `_shared/github.md` — squash, once, no polling.

## Outputs

`pipeline/runs/<slug>/run.md` (with `- lane: tweak`) and
`pipeline/runs/<slug>/lane/output/notes.md`:

```md
# Tweak: <slug>

- change: <file/area>: <before → after, one line>
- changelog: <not warranted for tweaks unless user-visible enough to announce — then entry added>
```

## Verify

- The diff is as small as the request; nothing was decided on the user's behalf.
- One PR, `type:tweak`, no Spec-approved anchor; the merge only ever happens on the ticked box.
