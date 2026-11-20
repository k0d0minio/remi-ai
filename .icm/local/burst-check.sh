#!/usr/bin/env bash
# burst-check.sh — the one check at the end of a burst (.icm/local/BURSTS.md).
# Jamie permitted these local checks on 2026-11-20, for the branch `bursts` only.
# It leaves with BURSTS.md before `bursts` merges into `main`.
# Usage: bash .icm/local/burst-check.sh <base commit of the burst> [step ...]
# Steps: order typecheck lint test. Default: all four, in that order.
set -uo pipefail

branch="$(git branch --show-current)"
[ "$branch" = "bursts" ] || { echo "RESULT: STOP this check runs on the branch bursts, not on $branch"; exit 2; }
base="${1:-}"
[ -n "$base" ] || { echo "RESULT: STOP give the commit where the burst started"; exit 2; }
shift
steps=("$@")
[ "${#steps[@]}" -gt 0 ] || steps=(order typecheck lint test)

failed=()
for step in "${steps[@]}"; do
  echo "=== $step"
  case "$step" in
    order) node packages/services/scripts/check-migration-order.mjs --base "$base" ;;
    typecheck) pnpm typecheck ;;
    lint) pnpm lint ;;
    test) pnpm test ;;
    *) echo "unknown step $step"; false ;;
  esac || failed+=("$step")
done

if [ "${#failed[@]}" -eq 0 ]; then
  echo "RESULT: GREEN ${steps[*]}"
else
  echo "RESULT: RED ${failed[*]}"
  exit 1
fi
