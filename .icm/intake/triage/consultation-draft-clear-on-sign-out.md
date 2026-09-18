# Stub: The consultation draft in localStorage survives a sign-out

- lane: tweak
- found-by: the `consultation-update` Release review (#99) · 2026-09-17
- size: S

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

## Proposed change

A client hook on the sign-out path removes every `remi:consultation:*` key; a blocked storage access never blocks the sign-out.

## Acceptance criteria (rough)

- [ ] Signing out of the console removes every `remi:consultation:*` key from `localStorage`.
- [ ] It happens on the client, on the same interaction that ends the session, and a failed or
      blocked storage access never blocks the sign-out itself.
- [ ] The TTL added in #99 stays — sign-out clearing is the second half, not a replacement.

## Prompt

Run `/pipeline tweak consultation-draft-clear-on-sign-out` in the remi-ai repo. The lane pre-seeds from this stub and moves it to `triage/_done/` when it opens the PR. Scope is the Proposed change and nothing wider; a question left open above is raised, not answered in code.
