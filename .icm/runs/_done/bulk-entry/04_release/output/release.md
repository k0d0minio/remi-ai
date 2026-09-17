# Release: bulk-entry

- gate: Ready to merge ticked — merge authorised
- ci: GREEN on `5771b53` (ci-status.sh, after the last push — a second `main` merge landed
  after the close-out, so the archived run carries it)
- pr: [#97](https://github.com/k0d0minio/remi-ai/pull/97) · merged: yes — squash, 2026-09-17
- code-review: high (complexity: complex) — 3 findings, all fixed on this branch; none parked
- production-readiness: run — no new environment variable, no migration, no adapter registration
  changed. The pooled WebSocket adapter this run depends on arrived on `main` from PR #99 and is
  registered exactly as before through each app's `ensureDatabase()`. The one config-shaped risk,
  Neon's connection budget under the pool, belongs to that change and is bounded there
  (`max: 5`, 30s idle timeout, an `error` listener for dropped idle connections).
- security-review: run — the diff adds three server actions and no routes. Each re-asserts
  `requireOperator()`, every row is validated through the service's zod schema before the first
  write, and the plan scopes `existing` to the patient in the path parameter, so a submitted id
  belonging to another patient is planned as an insert rather than reaching that patient's rows.
  No auth, payment or route-policy surface is touched. Patient data is in scope throughout, which
  is why this was run rather than recorded as not required.
- parked: none
- technical docs: no technical docs impact — the change adds service functions and admin
  composition; `technical/packages` describes entrypoints and seams, not the function list, and
  the storage seam's behaviour changed in PR #99, not here.
- business docs: no business docs impact — `business/scope` already carries the practitioner
  console; this is the workflow inside it.
- release notes: both
- sent: ship note sent 2026-09-17
- closed out: RESULT: CLOSED — run archived to `.icm/runs/_done/bulk-entry/`; the
  `practitioner-workflow` epic still has stubs, so it stays open

## Acceptance check (vs spec)

- [x] Whole-section edit mode on each of the three sections — entered from the section, left by
      saving or cancelling; cancelling writes nothing.
- [x] Add, remove and reorder locally with no server call until the save.
- [x] One save applies a mixed edit — a test per service covers exactly that shape.
- [x] One transaction — met once `main`'s pooled adapter arrived, and only after fixing this run's
      own defect of writing through `getDatabase()` inside the callback instead of the `tx`
      client. Proven by an injected-failure test asserting the section is unchanged.
- [x] One audit event per save, with the counts.
- [x] Recommendations as one block per category; no `supplement` offered for new rows.
- [x] An existing `supplement`-category row still renders, saves and keeps its category.
- [x] Every supplement row on screen at once; moment and raison behind the row's fold.
- [x] Pasted lines become one row each before any save.
- [x] Optional fields folded closed, open per row.
- [x] Removal archives, never deletes.
- [x] The single-row actions still exist and work.
- [x] One `<form>`, one submit, rows as form data.
- [x] `requireOperator()` re-asserted; a bad row refuses the whole save naming its index.

## Notes

The chore branch this session opened for the storage adapter,
[#103](https://github.com/k0d0minio/remi-ai/pull/103), is **redundant and must not be merged** —
`main` already carries that work from PR #99, with idle-connection handling this one lacks.
`main`'s own `neon-websocket-driver-transactions` triage stub is still active although the work
shipped; retiring it is bookkeeping for whoever lands next, not this run.
