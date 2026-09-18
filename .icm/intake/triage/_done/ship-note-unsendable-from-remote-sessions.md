> Done: 2026-09-18 — with the pipeline template sync. The ship note is now the changelog page's one-liner, handed to the project-owned `.icm/scripts/notify.sh`, which sends it through Resend where `RESEND_API_KEY`, `SHIP_NOTE_RECIPIENTS` and `EMAIL_FROM` are set and otherwise prints it and reports `RESULT: SKIPPED` — « written, not sent » is a normal outcome, not a failed step; there is no `release.md` and no `sent:` line to correct afterwards. `.icm/docs/ENV.md` § Pipeline says where the variables live.

# Stub: Release's ship note cannot be sent from a remote Claude Code session

- feature-slug: ship-note-unsendable-from-remote-sessions
- lane: chore
- priority: P3
- found-by: the `ciqual-import` Release, 2026-09-17 — step 12 refused after a successful merge ·
  then independently by the `copy-context` Release (#96) the same day, which is what settles it as
  systemic rather than one run's bad luck
- sources: `.icm/scripts/send-ship-note.sh` · `.icm/stages/04_release/CONTEXT.md` § step 12 ·
  `.icm/docs/ENV.md` § ship note

## What this is

`/pipeline release` ends by sending the ship note, and the contract is explicit that running
Release **is** the authorisation — there is no prompt, and the no-flag dry run exists only for
debugging. In a Claude Code remote session none of the four variables it needs is present:
`RESEND_API_KEY`, `SHIP_NOTE_RECIPIENTS`, `SHIP_NOTE_FROM` and `EMAIL_FROM` are all unset, so the
script refuses before it can even render a sender.

This is not specific to `ciqual-import`. Every release run from a remote session will merge
successfully and then fail its last step, which makes the last step something people learn to
ignore — and a step that is routinely skipped is a step that stops being true in `release.md`.

Two runs reached it the same day and both had to correct their own record afterwards. That is the
sharp edge: the step fails **after** the merge, where the contract says nothing else runs, so the
agent has no branch left to fix anything on and the archive has already landed on `main`. Both
records were written from the contract's template before the step ran, and so both asserted a send
that had not happened until someone went back and corrected them.

## Proposed change

Pick one, deliberately:

- **Put the variables in the environment** the sessions run in, the way `GITHUB_TOKEN` already is.
  Smallest change; means a session can send mail, which is worth being a conscious choice rather
  than a side effect.
- **Move the send off the session** — a GitHub Actions step on merge that reads the archived ship
  note and sends it with repository secrets. The note is on `main` by then, and Actions already
  holds the secrets.
- **Say the send is optional** in the contract, and have the script exit 0 with a clear "not
  configured here" rather than an error, so Release can report « written, not sent » as a normal
  outcome instead of a failure.

The third is the cheapest and the worst: it makes the ship note something nobody receives.

Whichever is chosen, the template line is worth fixing too: `release.md`'s `sent:` should not be
fillable before the step it describes has run.

## Acceptance criteria (rough)

- [ ] A release run either sends the note or reports plainly that sending is not configured here
- [ ] `release.md`'s `sent:` line is true without a human remembering to correct it
- [ ] `.icm/docs/ENV.md` says where these four variables are expected to be set, and where they are not

## Notes

Both affected records have been corrected by hand, and both ship notes are complete with their
links filled, so either can be sent once the variables exist:

- `.icm/runs/_done/ciqual-import/04_release/output/`
- `.icm/runs/_done/copy-context/04_release/output/`
