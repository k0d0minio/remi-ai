# REMI-017 · Wire error tracking and the missing safety nets

|                |                                                                |
| -------------- | ---------------------------------------------------------------- |
| Status         | ready                                                          |
| **Type**       | chore                                                          |
| **Priority**   | P0 — Phase B; the beta must not be debugged through practitioners |
| **Size**       | A day                                                          |
| **Depends on** | —                                                              |
| **Blocked by** | An error-tracking account (Sentry or equivalent)               |
| **Sources**    | Status report Phase B bullet 4 · audit F-27, F-28, F-29        |

## Problem statement

A production crash is invisible today. There is no error tracking, no health check, no uptime probe
and no alert anywhere in the code. The repo's own environment catalogue calls this "the top
unstarted ops item" and has reserved the variable names — nothing reads them.

Two safety nets are also missing in every app: `global-error.tsx` (an exception in a root layout
bypasses every existing error boundary and renders Next.js's unstyled crash page) and
`instrumentation.ts` — which is, conveniently, also where error tracking and the adapter
registration from REMI-013 both want to live. One file, three reasons.

The beta gives fifteen practitioners to REMI. Finding out it broke by being told is not acceptable.

## Required steps

1. Wire error tracking via `instrumentation.ts` in each app. Server and client both.
2. Add the missing `global-error.tsx` to every app.
3. Add a health check endpoint per deployed app, and something that actually probes it — an alert
   nobody receives is not monitoring.
4. Make sure errors carry enough context to be actionable (release, app, route) and **no personal
   data** — this is health data; scrub before sending.
5. Three-list rule for the DSN and any new variable. Never commit it.

## Open questions — flag these on pickup

- **Sentry, or something else?** The names are reserved for Sentry but nothing is chosen or paid
  for. An EU-hosted option is worth weighing against the sovereignty posture (REMI-015).
- **Who receives the alerts, and where?** An alert with no recipient is decoration. Email, Slack,
  or both — and at what threshold.
- **What is scrubbed?** Health data must never reach the tracker. The scrubbing rules need writing
  down before the first real record exists, not after.
- **Does uptime probing need a separate vendor?** Possibly free, possibly already available through
  the host — check before adding a line item.

## Acceptance criteria

- [ ] A real exception in any app produces a tracked, attributable event.
- [ ] Every app has `global-error.tsx` and `instrumentation.ts`.
- [ ] A health endpoint exists per deployed app and something probes it.
- [ ] Alerts reach a named human.
- [ ] No personal or health data appears in any tracked event.

## Agent prompt

```text
Work in the remi-ai monorepo. Read CLAUDE.md and CONVENTIONS.md, then
.icm/docs/history/audit-report.md findings F-27, F-28 and F-29, and check .icm/docs/ENV.md for the
already-reserved variable names.

Task: make a production crash visible.
1. Add instrumentation.ts to each app and wire error tracking through it, server and client. Note
   that REMI-013's adapter registration wants the same file — leave room for it.
2. Add global-error.tsx to every app.
3. Add a health endpoint per deployed app and wire something that probes it and alerts a human.
4. Scrub aggressively: this product handles health data and none of it may reach the tracker.
   Write the scrubbing rules down.
5. Keep the three-list env rule for the DSN. Never commit it.
Do not run build/lint/typecheck/format locally. Push a branch, open a PR, git mv this ticket into
.icm/intake/_done/, and state plainly in the PR whether you could verify a real captured event or
whether the owner must create the account first.
```
