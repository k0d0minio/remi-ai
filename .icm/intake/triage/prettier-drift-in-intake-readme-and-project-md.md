# Stub: Three markdown files fail the advisory format check

- lane: chore
- found-by: adopt-blueprint pull request · 2026-10-21
- complexity: low
- priority: P2

## Problem

`Quality (advisory)` is red on every ready pull request. Its format check names three files
that no pull request touched: `.icm/intake/README.md`,
`.icm/intake/triage/_done/context-md-format-drift.md` and `.icm/project.md`. A red advisory
job hides a real finding.

## Proposed change

Format the three files with the repo's prettier config, or add the two intake files to
`.prettierignore` beside the other template-owned paths. One pull request, no behaviour change.
