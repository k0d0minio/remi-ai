# Status: patient-profile-edit

Where the run is, in five lines. Updated at every stage start and stop, and whenever a flag
flips. A resuming session reads this first, then `handoff.md` (`_shared/stage-preamble.md`).

- phase: build
- step: 9 — admin preview RED on migrate; idempotent fix committed locally, push held for the operator
- ci: RED on d0fe237 (Vercel – admin, db:migrate)
- blocked: yes — operator decision: a push migrates the shared production database
- updated: 2026-09-25
