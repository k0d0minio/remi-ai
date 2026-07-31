#!/usr/bin/env bash
# block-local-checks.sh — PreToolUse(Bash) guard that keeps deterministic checks out of the session.
#
# The doctrine (CONVENTIONS.md → "The factory owns the checks"; pipeline/stages/04_build/CONTEXT.md)
# is that format/lint/typecheck/build belong to the factory, not to an agent's context window:
#   • format             → Husky pre-commit (lint-staged) + CI .github/workflows/quality.yaml
#   • lint / typecheck   → CI .github/workflows/quality.yaml
#   • build              → the Vercel preview deploy
# The contracts said "don't run these"; nothing enforced it. This hook does — it blocks local
# build/lint/typecheck/format invocations so the agent pushes and reads results back from the PR's
# check runs instead of burning turns compiling the monorepo.
#
# Contract: reads the PreToolUse payload on stdin, inspects tool_input.command.
#   exit 0 → allow (the default, and the fail-open path on any malformed or empty input).
#   exit 2 → block; stderr is surfaced to the agent as the reason.
#
# It only matches runner invocations at a command-segment boundary (start, `;`, `&&`, `||`, `|`), so
# a blocked word inside a quoted string — `git commit -m "fix lint"` — is never caught.
set -euo pipefail

input="$(cat 2>/dev/null || true)"
command -v jq >/dev/null 2>&1 || exit 0            # no jq → can't parse → fail open
cmd="$(printf '%s' "$input" | jq -r '.tool_input.command // ""' 2>/dev/null || true)"
[ -n "$cmd" ] || exit 0

# Heredoc bodies are data, not commands (a commit message that happens to mention "pnpm build").
# The real invocation is always before the `<<` operator, so drop everything from the first heredoc
# marker onward before matching.
cmd="${cmd%%<<*}"
[ -n "$cmd" ] || exit 0

# Command-segment boundary + a whole-word check verb.
b='(^|[;&|])[[:space:]]*'
verb='(build|lint|typecheck)([[:space:]]|$|[;&|])'

hit=""
# pnpm build / lint / typecheck — including `run`, flags, and the `web:build` / `ui:build` forms.
printf '%s' "$cmd" | grep -Eq "${b}pnpm[[:space:]]+([^;&|]*[[:space:]])?[a-z@/_:.-]*${verb}" && hit="pnpm build/lint/typecheck"
# pnpm format (format, format:check, format:staged).
printf '%s' "$cmd" | grep -Eq "${b}pnpm[[:space:]]+([^;&|]*[[:space:]])?format" && hit="pnpm format"
# turbo run build/lint/typecheck (and the bare `turbo build` form).
printf '%s' "$cmd" | grep -Eq "${b}turbo[[:space:]]+(run[[:space:]]+)?${verb}" && hit="turbo run build/lint/typecheck"
# The direct binaries the scripts wrap — bare, or behind an npx/bunx/pnpm exec|dlx/yarn runner.
runner='(npx|bunx|pnpm[[:space:]]+(exec|dlx)|yarn([[:space:]]+exec)?)[[:space:]]+'
printf '%s' "$cmd" | grep -Eq "${b}(${runner})?(tsc|next[[:space:]]+build|prettier|eslint)([[:space:]]|$|[;&|])" && hit="tsc / next build / prettier / eslint"

[ -n "$hit" ] || exit 0

cat >&2 <<EOF
Blocked ($hit): the factory owns deterministic checks, not this session.
  • format     → Husky pre-commit + CI (.github/workflows/quality.yaml)
  • lint/types → CI quality.yaml
  • build      → the Vercel preview deploy
Commit and push, then read the results back from the PR's check runs. See
CONVENTIONS.md → "The factory owns the checks" and pipeline/stages/04_build/CONTEXT.md.
If you must reproduce a specific CI failure locally, ask the user to run it for you.
EOF
exit 2
