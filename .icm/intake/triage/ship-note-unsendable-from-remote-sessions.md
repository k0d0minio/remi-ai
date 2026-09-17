# ship-note-unsendable-from-remote-sessions

- epic: triage
- lane: chore
- status: active
- created: 2026-09-17
- size: S
- depends-on: none

## Problem

Release's step 12 sends the ship note with `.icm/scripts/send-ship-note.sh <slug> --send`. In a
Claude Code remote session — the environment the pipeline is actually run from — **none** of the
four variables that step needs is present:

- `RESEND_API_KEY`
- `SHIP_NOTE_RECIPIENTS`
- `SHIP_NOTE_FROM` / `EMAIL_FROM`

So the script dies on `EMAIL_FROM (or SHIP_NOTE_FROM) is not set` and the note is never sent.
Found releasing `copy-context` (#96), which merged green; the send is the one step of that release
that did not happen.

This is a factory gap, not a per-run one: every release run from a remote session hits it, and the
failure lands _after_ the merge, where the contract says nothing else runs. That timing is what
makes it worth a ticket — an agent that reaches step 12 has no branch left to fix anything on, and
the run record has already been archived onto `main` saying the note was sent.

`.icm/docs/ENV.md` lists all four as Vercel-scoped. The pipeline does not run on Vercel.

## Acceptance

- [ ] The four ship-note variables are available to the environment the pipeline runs in, or
      `send-ship-note.sh` is changed to fail the release _before_ the merge when it cannot send.
- [ ] `.icm/docs/ENV.md` records which environment each of the four has to be set in — not just
      "Vercel" — so the gap is visible from the catalogue rather than from a dead release step.
- [ ] Release's contract says what to do when the send is impossible: either the step is optional
      and the run record must say "not sent, and why", or it is required and the check moves ahead
      of the merge.

## Notes

The `copy-context` run record (`.icm/runs/_done/copy-context/04_release/output/release.md`) was
corrected in the same commit as this stub: its `sent:` line now records that the note was written
but not sent, with the reason. The note itself is complete and sitting at
`.icm/runs/_done/copy-context/04_release/output/ship-note.md` with both its links filled and
verified, so it can be sent by hand or by a later run of the script with the variables present.
