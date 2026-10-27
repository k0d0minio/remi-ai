# Stub: Conform to the blueprint v1.0.0

- lane: chore
- found-by: the house stub `legible-consulting/house` `.icm/intake/triage/conformance-v1-0-0.md` · 2026-10-27
- complexity: low
- priority: P1

## Problem

The repo renders from the blueprint `v0.6.0` at the tier `platform`. The blueprint `v1.0.0`
removes the tiers and asks `workspace`, `monorepo`, `release`, `uat`, `database` and
`migrations_path`.

## Proposed change

Run `copier update --vcs-ref v1.0.0` with Jamie's answers. Align `CLAUDE.md` with
`template/CLAUDE.md.jinja` at `v1.0.0`. Write `## Order` in `.icm/intake/README.md`.

## Acceptance criteria

- [ ] `.copier-answers.yml` names `v1.0.0`. Its answers are `workspace: false`, `monorepo: true`, `release: true`, `uat: true`, `database: neon` and `migrations_path: packages/services/src/db/migrations`.
- [ ] The blueprint's files equal its render at `v1.0.0` for these answers.
- [ ] `CLAUDE.md` follows `template/CLAUDE.md.jinja` at `v1.0.0` and does not name a tier.
- [ ] `.icm/intake/README.md` has `## Order`, with one line for each open epic and one for `triage`.
- [ ] The `check` run of `ci` and the `contract` job of `gate` are green.
