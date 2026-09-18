#!/usr/bin/env bash
# lint.sh — lint the files THIS BRANCH changed, and nothing else (PROJECT-OWNED).
#
# Same standing as format.sh: changed-files-only FEEDBACK before a push, never the full sweep and
# never the verdict — CI's `Format, lint, typecheck` is the verdict (estate decision D21;
# `_shared/project-rules.md` → The factory). Wired to this repo's linter, eslint, run from inside
# each workspace package so that package's own config applies (`eslint .` is every package's
# lint script; the shared flat config sits at the repo root). No `--fix`. The warning ceiling is
# ZERO — `quality.yaml` runs the lint with `--max-warnings=0` — so a warning here is a red check
# there.
#
# Files outside any workspace package (.icm/**, .github/**, root config) have no lint script and
# are not linted by CI either; they are listed as skipped, not silently dropped.
#
# Usage:
#   .icm/scripts/lint.sh                   # lint the changed files
#   .icm/scripts/lint.sh --base <ref>      # fork point off <ref> instead of origin/main
#
# Verdict (stdout, last line):
#   RESULT: OK        exit 0  — no errors and no warnings in the changed files.
#   RESULT: RED       exit 1  — at least one finding; every one is listed above the line.
#   RESULT: INVALID   exit 2  — the linter itself failed (config error, crash; stderr says why).
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$repo_root"
command -v jq >/dev/null || { echo "jq not found" >&2; exit 1; }
die() { echo "error: $*" >&2; exit 1; }

# shellcheck source=lib/changed-files.sh
source "$(dirname "${BASH_SOURCE[0]}")/lib/changed-files.sh"

linter="$repo_root/node_modules/.bin/eslint"
[ -x "$linter" ] || die "node_modules/.bin/eslint not found — run 'pnpm install' first"

base="origin/main"
while [ $# -gt 0 ]; do
  case "$1" in
    --base) base="${2:-}"; [ -n "$base" ] || die "--base needs a ref"; shift 2 ;;
    *) die "unknown argument: $1 (usage: lint.sh [--base <ref>])" ;;
  esac
done

fork="$(fork_point "$base")" || exit 1
mapfile -t files < <(changed_files "$fork" | filter_ext js jsx mjs cjs ts tsx)

if [ "${#files[@]}" -eq 0 ]; then
  echo "no changed .js/.jsx/.mjs/.cjs/.ts/.tsx files vs $base"
  echo "RESULT: OK"; exit 0
fi

declare -A pkg_files=()   # "apps/web" → newline-joined package-relative paths
skipped=()
for f in "${files[@]}"; do
  case "$f" in
    apps/*/*|packages/*/*)
      pkg="${f%%/*}/$(echo "${f#*/}" | cut -d/ -f1)"
      if [ -f "$pkg/package.json" ] && jq -e '.scripts.lint' "$pkg/package.json" >/dev/null; then
        pkg_files["$pkg"]+="${f#"$pkg"/}"$'\n'
        continue
      fi
      ;;
  esac
  skipped+=("$f")
done

if [ "${#skipped[@]}" -gt 0 ]; then
  echo "skipped (no workspace package lints these; CI does not either):"
  printf '  %s\n' "${skipped[@]}"
fi

if [ "${#pkg_files[@]}" -eq 0 ]; then
  echo "no changed files inside a package with a lint script"
  echo "RESULT: OK"; exit 0
fi

errfile="$(mktemp)"; trap 'rm -f "$errfile"' EXIT
red=0
for pkg in $(printf '%s\n' "${!pkg_files[@]}" | sort); do
  mapfile -t rel < <(printf '%s' "${pkg_files[$pkg]}")
  set +e
  report="$(cd "$pkg" && "$linter" --format json --no-warn-ignored "${rel[@]}" 2>"$errfile")"
  status=$?
  set -e
  if [ "$status" -ge 2 ] || ! printf '%s' "$report" | jq -e 'type == "array"' >/dev/null 2>&1; then
    echo "$pkg: the linter failed (exit $status)" >&2
    cat "$errfile" >&2
    echo "RESULT: INVALID"; exit 2
  fi
  errors="$(printf '%s' "$report" | jq '[.[].errorCount] | add // 0')"
  warnings="$(printf '%s' "$report" | jq '[.[].warningCount] | add // 0')"
  echo "$pkg: $errors error(s), $warnings warning(s) in ${#rel[@]} changed file(s) — the ceiling is 0 (quality.yaml)"
  printf '%s' "$report" | jq -r --arg root "$repo_root/" '
    .[] | (.filePath | ltrimstr($root)) as $f | .messages[]
    | "  \($f):\(.line // 0):\(.column // 0)  \(if .severity == 2 then "error" else "warn " end)  \(.ruleId // "-")  \(.message)"'
  if [ "$errors" -gt 0 ] || [ "$warnings" -gt 0 ]; then red=1; fi
done

if [ "$red" -eq 1 ]; then
  echo "RESULT: RED"; exit 1
fi
echo "RESULT: OK"; exit 0
