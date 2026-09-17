# Stub: Release's ship note cannot be sent from a remote Claude Code session

- feature-slug: ship-note-unsendable-from-remote-sessions
- lane: chore
- priority: P3
- found-by: the `ciqual-import` Release, 2026-09-17 — step 12 refused after a successful merge
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

## Acceptance criteria (rough)

- [ ] A release run either sends the note or reports plainly that sending is not configured here
- [ ] `release.md`'s `sent:` line is true without a human remembering to correct it
- [ ] `.icm/docs/ENV.md` says where these four variables are expected to be set, and where they are not
