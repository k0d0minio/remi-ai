# Chore: ci-required-checks-comma

- invariant: no user-facing behaviour change and no change to any verdict `ci-status.sh` would
  already have reached. Only the `PIPELINE_REQUIRED_CHECKS` **separator** differs (commas are no
  longer a separator), and the variable — previously unset here, because the repo's blocking check
  name could not be expressed in it — is now set.
- change:
  - `.icm/scripts/ci-status.sh`: the `required_checks` parse drops `| tr ',' '\n'`; the variable is
    newline-separated only. A comma is legal inside a GitHub check-run name — this repo's blocking
    check is literally named `Format, lint, typecheck` — so comma-splitting could not express the
    names the variable exists to hold. The header records that this is the estate template's fix
    landed here first.
  - `.claude/settings.json`: an `env` block sets `PIPELINE_REQUIRED_CHECKS` to
    `Format, lint, typecheck`, so every agent session in this repo has it without setup. The script
    reads only the process environment, so this is the one checked-in home available to it.
  - `.icm/_shared/ci.md`: the § required-checks paragraph is rewritten to say what is set and why,
    replacing the paragraph explaining why it could not be. It keeps the `Pipeline gates` exclusion
    and adds the Vercel-preview exclusion.
  - `.icm/docs/ENV.md`: a `PIPELINE_REQUIRED_CHECKS` row in Pipeline & CI, plus a new `repo`
    value in the "Where set" legend for a variable with a checked-in home.
  - `.icm/intake/triage/`: `ci-required-checks-comma.md` retired into `_done/`;
    `icm-template-required-checks-newline.md` cut for the half of the fix that belongs in
    icm-board.
- rollback: revert the commits. Nothing is migrated and nothing outside the repo is configured, so
  a revert restores the previous behaviour exactly — an unset variable and the comma-splitting
  parse.

## What was left undone, and why

The stub's first acceptance criterion is a change to **icm-board**
(`_system/template/icm-pipeline/scripts/ci-status.sh`), so that every estate repo gets the fixed
parse and remi-ai's copy is a re-seed rather than a divergence. This session had no write access to
that repository — the attempt to attach it was refused — so the one-line parse fix landed here
first instead. `.icm/intake/triage/icm-template-required-checks-newline.md` carries the port
upstream and the reconciliation of this copy afterwards. Until it lands, `icm-check` will report
`ci-status.sh` as drifted from the template, which the script's own header states.

## Verify

- Parse, exercised directly: `Format, lint, typecheck` parses as **one** required name, and a
  two-line value parses as two (leading/trailing whitespace trimmed per line).
- On this PR's head, `ci-status.sh --no-wait` with the variable set reads `PENDING` while the
  `Format, lint, typecheck` check has not completed, and `GREEN` only once it has — recorded on the
  PR.
