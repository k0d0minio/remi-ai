#!/usr/bin/env bash
# format.sh — format the files THIS BRANCH changed, and nothing else (PROJECT-OWNED).
#
# The estate's rule is that format / lint / typecheck / build are the factory's job — CI's
# `Format, lint, typecheck` is the verdict, and the session never runs the full sweep
# (.claude/hooks/block-local-checks.sh says so). What a session may do is get changed-files-only
# FEEDBACK before it pushes, so one unformatted file never costs a CI round-trip — and in a fresh
# remote session, where the Husky pre-commit hook is not installed, this is the only formatting
# a commit gets. Estate decision D21; `_shared/project-rules.md` → The factory.
#
# Wired to this repo's formatter, prettier, over exactly the files `lib/changed-files.sh` lists,
# restricted to the extensions `pnpm format` covers (ts, tsx, md). `.prettierignore` is applied
# by prettier itself — an explicitly listed but ignored file (a template-owned contract, a run
# folder) is skipped silently, exactly as the CI check would skip it.
#
# Usage:
#   .icm/scripts/format.sh                 # write the changed files in place
#   .icm/scripts/format.sh --check         # report only; write nothing
#   .icm/scripts/format.sh --base <ref>    # fork point off <ref> instead of origin/main
#
# Verdict (stdout, last line):
#   RESULT: FORMATTED n   exit 0  — n files were rewritten (listed above). Stage and commit them.
#   RESULT: CLEAN         exit 0  — every changed file already matches (or none qualify).
#   RESULT: UNFORMATTED n exit 1  — --check only: n files would be rewritten (listed).
#   RESULT: INVALID       exit 2  — the formatter could not parse a file (stderr says which).
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$repo_root"
die() { echo "error: $*" >&2; exit 1; }

# shellcheck source=lib/changed-files.sh
source "$(dirname "${BASH_SOURCE[0]}")/lib/changed-files.sh"

formatter="$repo_root/node_modules/.bin/prettier"
[ -x "$formatter" ] || die "node_modules/.bin/prettier not found — run 'pnpm install' first"

check=0; base="origin/main"
while [ $# -gt 0 ]; do
  case "$1" in
    --check) check=1; shift ;;
    --base)  base="${2:-}"; [ -n "$base" ] || die "--base needs a ref"; shift 2 ;;
    *) die "unknown argument: $1 (usage: format.sh [--check] [--base <ref>])" ;;
  esac
done

fork="$(fork_point "$base")" || exit 1
mapfile -t files < <(changed_files "$fork" | filter_ext ts tsx md)

if [ "${#files[@]}" -eq 0 ]; then
  echo "no changed .ts/.tsx/.md files vs $base"
  echo "RESULT: CLEAN"; exit 0
fi
echo "checking ${#files[@]} changed file(s) vs $base"

errfile="$(mktemp)"; trap 'rm -f "$errfile"' EXIT
set +e
differing="$("$formatter" --list-different "${files[@]}" 2>"$errfile")"
status=$?
set -e
stderr="$(cat "$errfile")"

if [ "$status" -ge 2 ]; then
  printf '%s\n' "$stderr" >&2
  echo "RESULT: INVALID"; exit 2
fi
[ -z "$stderr" ] || printf '%s\n' "$stderr" >&2

if [ -z "$differing" ]; then
  echo "RESULT: CLEAN"; exit 0
fi

mapfile -t todo <<<"$differing"
printf '%s\n' "${todo[@]}"

if [ "$check" -eq 1 ]; then
  echo "RESULT: UNFORMATTED ${#todo[@]}"; exit 1
fi

"$formatter" --write --log-level warn "${todo[@]}"
echo "RESULT: FORMATTED ${#todo[@]}"
exit 0
