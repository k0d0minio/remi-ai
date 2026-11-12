# Stub: The triage folder holds only open work

- lane: chore
- found-by: the UAT audit of uat.remiai.be, uat-admin.remiai.be and uat-app.remiai.be · 2026-11-12
- complexity: low
- priority: P1

## Problem

`.icm/intake/triage/` holds 48 open stubs. The audit of 2026-11-12 found that 14 of them are done, duplicates, or covered by another stub:

- `actions-may-create-pull-requests` is done. The setting is on, and release-please opened #152.
- `patient-home-today-release-incomplete` is moot. `.icm/runs/` is gone since #135.
- Two pairs are duplicates: the `remiai.be` addresses, and the Neon preview branches.
- 8 stubs fix the patient link under `apps/web/app/[locale]/p/[token]` or its console controls. `patient-home-navigation/retire-token-link` removes both.
- Two stubs fix the console's challenge section. D-19 puts challenges outside the stories.
- `drop-the-hand-recorded-consent-columns` waits on `consent-gate-at-signup`, which is done.

## Proposed change

Move each covered or done stub to `triage/_done/` with a `> Dropped:` line that names the reason. Carry into the kept stub any step that the dropped duplicate holds and the kept stub does not. Add one stub that removes the console's challenge section. Remove the stale `blocked:` line.

## Acceptance criteria

- [ ] Each dropped stub is in `triage/_done/` and starts with `> Dropped: <reason>, 2026-11-12.`
- [ ] No step of a dropped duplicate is lost: the kept stub names it.
- [ ] A new triage stub covers the removal of the console's challenge section.
- [ ] `drop-the-hand-recorded-consent-columns` has no `blocked:` line.
- [ ] No file outside `.icm/intake/` changes.
