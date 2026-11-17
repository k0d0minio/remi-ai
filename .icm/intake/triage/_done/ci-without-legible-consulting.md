# Stub: The workflows of this repo call no workflow of legible-consulting

- lane: chore
- found-by: Jamie · 2026-11-17
- complexity: low
- priority: P1

## Problem

`.github/workflows/ci.yml` calls `check-client.yml` and `release.yml` of
`legible-consulting/.github`, and `.github/workflows/gate.yml` calls its `gate.yml`, each at
`@main`. Jamie archived that organisation's work. The day that repo changes or goes, each pull
request of this repo has no check, no gate and no release.

The chore lane says that a lane does not edit a workflow that the blueprint renders, and that
such a request goes to the blueprint. Jamie's word of 2026-11-17 is the exception for this
ticket: the blueprint `legible-consulting/blueprint` gives no more update, so the reason of
that rule, a conflict at the next `copier update`, does not apply.

## Proposed change

Put the jobs of the three called workflows into `ci.yml` and `gate.yml` of this repo, as
`legible-consulting/.github` has them at commit `cb3893f` (2026-10-30): the same checks, the
same triggers, the same permissions, the same pinned actions and the same check names.

## Acceptance criteria

- [ ] No file under `.github/workflows/` has a `uses:` line that names `legible-consulting`
- [ ] The `ci` run of this pull request has the jobs `check / secrets`, `check / workflows` and `check / code`, and each one that runs is green
- [ ] The `gate` run of this pull request has the jobs `gate / contract` and `gate / gate`, and `gate / contract` is green
- [ ] `CLAUDE.md` says that the checks and the release job are in this repo
