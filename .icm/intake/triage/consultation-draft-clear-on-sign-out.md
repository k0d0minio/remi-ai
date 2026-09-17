# consultation-draft-clear-on-sign-out

- epic: triage
- lane: tweak
- status: active
- created: 2026-09-17
- size: S
- depends-on: none

## Problem

The "Nouvelle consultation" screen autosaves its draft — consultation notes, the living summary,
per-goal notes — to `localStorage` under `remi:consultation:<patientId>`, so a closed tab does not
lose a half-written write-up. It is cleared on a successful save, on "repartir de zéro", and now on
a 12-hour TTL added in the Release review of #99.

What is still missing is clearing on **sign-out**. Signing out ends the session but leaves any
abandoned draft in the browser profile until its TTL expires — on a shared clinic workstation, the
next person to use that profile can read it from devtools without authenticating. The TTL bounds
the window; it does not close it.

This was left out of #99 because clearing on sign-out means a client hook on the sign-out path,
which that PR did not otherwise touch.

## Acceptance

- [ ] Signing out of the console removes every `remi:consultation:*` key from `localStorage`.
- [ ] It happens on the client, on the same interaction that ends the session, and a failed or
      blocked storage access never blocks the sign-out itself.
- [ ] The TTL added in #99 stays — sign-out clearing is the second half, not a replacement.
