#!/usr/bin/env bash
# project-labels.sh — project a run's labels onto its PR from spec.md (one direction: file → PR).
#
# The label set is a pure function of the spec header plus the stage, so a script can project it
# exactly — no "mostly". It reads the PR number from run.md and the apps/complexity from spec.md,
# assembles the FULL label set, and PUTs it. The GitHub labels API replaces the whole set, which is
# what we want: the vocabulary is fixed in .github/labels.yml and the spec is the single source.
#
# CI is the normal caller (the labels job in .github/workflows/pipeline.yaml, with --stage auto, on
# every push touching pipeline/runs/**). new-run.sh calls it once at Define. By hand it is the
# manual fallback. Requires curl + jq.
#
# Config comes straight from the process environment; this script does NOT load any .env file:
#
#   GITHUB_TOKEN     (required*) GitHub token with repo scope — authenticates the label write.
#   GH_TOKEN         (required*) Alternative name (one of the two must be set).
#   GITHUB_REPO      (optional)  owner/repo the PR lives in. Default: k0d0minio/remi-ai.
#   GITHUB_API_URL   (optional)  API base. Default: https://api.github.com.
#
# Usage:
#   pipeline/scripts/project-labels.sh <slug> --stage <define|build|verify|ship|auto> [--pr <n>]
#
#   --stage auto   derive the stage from which run outputs exist on disk, so an automated caller
#                  does not have to know it.
#   --pr <n>       use this PR number instead of reading it from run.md — for CI, where the number
#                  comes from the event.
#
# Verdict (stdout, last line):
#   RESULT: APPLIED   exit 0  — the full label set was written (echoed above the verdict).
set -euo pipefail

command -v curl >/dev/null || { echo "curl not found" >&2; exit 1; }
command -v jq   >/dev/null || { echo "jq not found"   >&2; exit 1; }

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"

die() { echo "error: $*" >&2; exit 1; }

# The app vocabulary — must stay in step with .github/labels.yml and validate-spec.sh.
APPS=(web admin marketing docs demo packages)

# --- args -------------------------------------------------------------------------------------

slug=""; stage=""; pr_override=""
while [ $# -gt 0 ]; do
  case "$1" in
    --stage) stage="${2:-}"; shift 2 ;;
    --pr)    pr_override="${2:-}"; shift 2 ;;
    --*)     die "unknown flag: $1" ;;
    *)       [ -z "$slug" ] && slug="$1" || die "unexpected argument: $1"; shift ;;
  esac
done
[ -n "$slug" ]  || die "usage: project-labels.sh <slug> --stage <define|build|verify|ship|auto> [--pr <n>]"
[ -n "$stage" ] || die "--stage <define|build|verify|ship|auto> is required"

run_dir="$repo_root/pipeline/runs/$slug"
spec="$run_dir/03_define/output/spec.md"
[ -f "$spec" ] || die "no spec at $spec"

# --stage auto: derive the current stage from which outputs exist on disk. Newest wins — pushing a
# stage's output is what moves the board.
if [ "$stage" = "auto" ]; then
  if   [ -f "$run_dir/06_ship/output/release.md" ];  then stage="ship"
  elif [ -f "$run_dir/05_verify/output/verify.md" ]; then stage="verify"
  elif [ -f "$run_dir/04_build/output/notes.md" ];   then stage="build"
  else stage="define"
  fi
fi
case "$stage" in define|build|verify|ship) : ;; *) die "--stage must be define|build|verify|ship|auto, got: $stage" ;; esac

run_md="$run_dir/run.md"
if [ -z "$pr_override" ]; then
  [ -f "$run_md" ] || die "no run.md at $run_md — resolve the run first (resolve-run.sh), or pass --pr <n>"
fi

# --- config from env --------------------------------------------------------------------------

GH_API="${GITHUB_API_URL:-https://api.github.com}"
repo="${GITHUB_REPO:-k0d0minio/remi-ai}"
gh_token="${GITHUB_TOKEN:-${GH_TOKEN:-}}"
[ -n "$gh_token" ] || die "GITHUB_TOKEN (or GH_TOKEN) is not set — needed to write PR labels"

# --- PR number: explicit --pr wins, else read it from run.md -----------------------------------

if [ -n "$pr_override" ]; then
  pr_number="$(printf '%s' "$pr_override" | grep -oE '[0-9]+' | head -n1 || true)"
  [ -n "$pr_number" ] || die "--pr must be a number, got: '$pr_override'"
else
  pr_number="$(grep -m1 '^- pr:' "$run_md" \
    | sed -E 's/^- pr:[[:space:]]*//; s/[[:space:]]+#.*$//' \
    | grep -oE '[0-9]+' | head -n1 || true)"
  [ -n "$pr_number" ] || die "could not read a PR number from $run_md ('- pr:' line)"
fi

# --- spec header → label set -------------------------------------------------------------------

complexity="$(grep -m1 '^- complexity:' "$spec" | sed -E 's/^- complexity:[[:space:]]*//; s/[[:space:]]*$//' | tr '[:upper:]' '[:lower:]')"
case "$complexity" in trivial|standard|complex) : ;; *) die "spec complexity must be trivial|standard|complex, found: '$complexity'" ;; esac

apps_raw="$(grep -m1 '^- apps:' "$spec" | sed -E 's/^- apps:[[:space:]]*//; s/[[:space:]]*$//')"
[ -n "$apps_raw" ] || die "spec has no '- apps:' header to project app labels from"

# The apps header is free-form prose in practice — parentheticals, slashes, trailing notes. So we
# don't tokenise it; we scan for each vocabulary word as a whole word, case-insensitively, and emit
# those in canonical order. Anything outside the vocabulary is ignored, so the projection is
# deterministic regardless of wording.
labels=("type:feature" "stage:${stage}" "complexity:${complexity}")
found_app=0
for vocab in "${APPS[@]}"; do
  if printf '%s' "$apps_raw" | grep -iqwE "$vocab"; then
    labels+=("app:${vocab}")
    found_app=1
  fi
done
[ "$found_app" -eq 1 ] || die "no known app in '- apps: $apps_raw' — valid: ${APPS[*]}"

# --- write the full set (PUT replaces every label on the PR) -----------------------------------

payload="$(printf '%s\n' "${labels[@]}" | jq -R . | jq -s '{labels: .}')"
echo "Projecting labels onto PR #$pr_number: ${labels[*]}" >&2

resp="$(curl -sS -m 30 -w $'\n%{http_code}' -X PUT \
  -H "Authorization: Bearer $gh_token" \
  -H "Accept: application/vnd.github+json" \
  -H "X-GitHub-Api-Version: 2022-11-28" \
  -H "Content-Type: application/json" \
  -d "$payload" \
  "$GH_API/repos/${repo}/issues/${pr_number}/labels")" \
  || die "label write request failed (network/egress)"

http="$(printf '%s' "$resp" | tail -n1)"
body="$(printf '%s' "$resp" | sed '$d')"
if [ "$http" != "200" ]; then
  reason="$(printf '%s' "$body" | jq -r '.message // empty' 2>/dev/null || true)"
  die "label write returned HTTP $http — ${reason:-no message} (do the labels exist in the repo? see .github/labels.yml)"
fi

echo "RESULT: APPLIED"
