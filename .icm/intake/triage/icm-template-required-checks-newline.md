# Stub: port the `PIPELINE_REQUIRED_CHECKS` newline-only parse upstream to the template

- feature-slug: icm-template-required-checks-newline
- lane: chore
- priority: P3
- repo: **k0d0minio/icm-board**, not this one
- found-by: the `ci-required-checks-comma` chore, 2026-09-09, closing
  `.icm/intake/triage/_done/ci-required-checks-comma.md`
- sources: `_system/template/icm-pipeline/scripts/ci-status.sh` in icm-board ·
  `.icm/scripts/ci-status.sh` here (the fixed copy) · `.icm/_shared/ci.md` § required checks

## What this is

`ci-required-checks-comma` established that `PIPELINE_REQUIRED_CHECKS` cannot be comma-separated:
a comma is a legal character inside a GitHub check-run name, and this repo's one blocking check is
named `Format, lint, typecheck`. Splitting on commas turns it into three phantom checks that never
register, so every verdict reads `PENDING` forever.

The fix — split on newlines only — landed **here first**, in `.icm/scripts/ci-status.sh`, because
that chore's session had no write access to icm-board. Until the same one-line change lands in the
template, this repo's copy is drift that `icm-check` will report, and every other estate repo still
carries the broken parse.

## Proposed change

In icm-board, `_system/template/icm-pipeline/scripts/ci-status.sh`:

- Drop the `| tr ',' '\n'` from the `required_checks` parse — newline-separated only
- Update the header's `PIPELINE_REQUIRED_CHECKS` config line to say newline-separated, and why
  (a check name may contain a comma)
- Update whatever the template's own `ci.md` says about the separator

Then reconcile remi-ai's copy: it should differ from the template only by the repo-specific
`Pipeline gates` noise rule, and the "landed here first" paragraph in its header comes out.

## Acceptance criteria (rough)

- [ ] The template's `ci-status.sh` splits `PIPELINE_REQUIRED_CHECKS` on newlines only
- [ ] The template's CI reference documents the separator and the comma reason
- [ ] remi-ai's `.icm/scripts/ci-status.sh` differs from the template only by the `Pipeline gates`
      rule, and its header no longer claims the parse fix is pending upstream
- [ ] `icm-check` reports no drift on `ci-status.sh` for remi-ai
