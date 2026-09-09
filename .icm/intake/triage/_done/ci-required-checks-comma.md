# Stub: `PIPELINE_REQUIRED_CHECKS` cannot name this repo's blocking check

- feature-slug: ci-required-checks-comma
- lane: chore
- priority: P3
- found-by: the `remi-ai-stage-collapse` session, 2026-09-08, seeding `.icm/scripts/ci-status.sh`
- sources: `.icm/scripts/ci-status.sh` (the `required_raw`/`required_checks` parse) ·
  `.github/workflows/quality.yaml` (`name: Format, lint, typecheck`) · `.icm/_shared/ci.md` §
  "PENDING is a verdict, not a soft green"

## What this is

`ci-status.sh` refuses `GREEN` while a check named in `PIPELINE_REQUIRED_CHECKS` is missing from
the head — the guard against a fresh push reading as clean before CI has registered. The variable
is **comma-or-newline separated**, and this repo's one blocking Actions check is named
`Format, lint, typecheck`. Its name contains the separator, so it cannot be expressed in the
variable at all: setting it would create three phantom required checks that never appear, and
every verdict would be `PENDING` forever.

The variable is therefore deliberately unset here, and the weaker rule carries the load — the
script still refuses `GREEN` while _zero_ signals exist on the head, which is the case that
actually bites on a fresh push.

## Why it was parked, not fixed

Both fixes reach past the run that found it:

- **Rename the check** (`Format, lint, typecheck` → something comma-free). Branch protection is
  configured against the check name in the GitHub repo settings, so a rename silently drops the
  required check until someone re-points it by hand. Not a change to make from inside a PR.
- **Change the script's parse** (e.g. newline-only, or a `;` separator). `ci-status.sh` is a
  canonical estate asset seeded from `_system/template/icm-pipeline/scripts/`; diverging this
  repo's copy on the parse is drift that `icm-check` will report, so it belongs upstream in the
  template, not here.

## Proposed change

Take it to the template: make `PIPELINE_REQUIRED_CHECKS` newline-separated only (commas are
legal inside GitHub check names, so comma-splitting is wrong for every repo, not just this one),
then set the variable here.

## Acceptance criteria (rough)

- [ ] The template's `ci-status.sh` splits `PIPELINE_REQUIRED_CHECKS` on newlines only
- [ ] remi-ai's copy is re-seeded from it, keeping the local `Pipeline gates` noise rule
- [ ] `PIPELINE_REQUIRED_CHECKS` is set for this repo and a fresh push reads `PENDING`, not `GREEN`
- [ ] `.icm/_shared/ci.md` § required checks is rewritten to say what is set, not why it can't be
