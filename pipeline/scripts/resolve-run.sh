#!/usr/bin/env bash
# resolve-run.sh — adopt an existing pipeline run into the working tree, or STOP.
#
# The single canonical "resolve the run or STOP" procedure (pipeline/_shared/stage-preamble.md), made
# into one deterministic call so Build / Verify / Ship / `status` spend no model tokens resolving a
# run. It reads run.md if it is already in the working tree, otherwise it searches the run's PR by
# slug via the GitHub REST API, then fetches and checks out the run's branch.
#
# It NEVER creates a run, spec, run.md, or branch, and never `git checkout -b`s a fallback. A missing
# run means Define has not run for this slug (or the slug is wrong), and the verdict is STOP —
# recreating the folder fabricates an unspecced run and orphans the real one.
#
# Requires curl + jq + git. Config comes straight from the process environment; this script does NOT
# load any .env file. Export these locally and set the same values in CI so resolution behaves
# identically wherever it runs:
#
#   GITHUB_TOKEN     (required*) GitHub token with repo scope — authenticates the PR search.
#   GH_TOKEN         (required*) Alternative name (one of the two must be set).
#   GITHUB_REPO      (optional)  owner/repo the runs live in. Default: k0d0minio/remi-ai.
#   GITHUB_API_URL   (optional)  API base. Default: https://api.github.com.
#
# Usage:
#   pipeline/scripts/resolve-run.sh <slug>
#
# Verdict (stdout, last line):
#   RESULT: READY   exit 0  — pipeline/runs/<slug>/run.md is in the working tree and its branch is
#                             checked out. The caller proceeds to load the stage contract.
#   RESULT: STOP    exit 3  — no run resolved. Do NOT fabricate it; send the user to
#                             `/pipeline new "<request>"`.
set -euo pipefail

command -v curl >/dev/null || { echo "curl not found" >&2; exit 1; }
command -v jq   >/dev/null || { echo "jq not found"   >&2; exit 1; }
command -v git  >/dev/null || { echo "git not found"  >&2; exit 1; }

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"

die()  { echo "error: $*" >&2; exit 1; }
stop() { echo "$*" >&2; echo "RESULT: STOP"; exit 3; }

# --- args -------------------------------------------------------------------------------------

slug=""
while [ $# -gt 0 ]; do
  case "$1" in
    --*) die "unknown flag: $1" ;;
    *)   [ -z "$slug" ] && slug="$1" || die "unexpected argument: $1"; shift ;;
  esac
done
[ -n "$slug" ] || die "usage: resolve-run.sh <slug>"

run_md="$repo_root/pipeline/runs/$slug/run.md"

# --- config from env --------------------------------------------------------------------------

GH_API="${GITHUB_API_URL:-https://api.github.com}"
repo="${GITHUB_REPO:-k0d0minio/remi-ai}"
gh_token="${GITHUB_TOKEN:-${GH_TOKEN:-}}"

# A blocking GitHub GET. Echoes "<body>\n<http_code>"; the caller splits the status off the last line.
gh_get() {
  curl -sS -m 30 -w $'\n%{http_code}' \
    -H "Authorization: Bearer $gh_token" \
    -H "Accept: application/vnd.github+json" \
    -H "X-GitHub-Api-Version: 2022-11-28" \
    "$GH_API$1"
}

# Read the branch a run.md records, stripping any trailing "# comment" the template carries.
branch_from_run_md() {
  grep -m1 '^- branch:' "$1" 2>/dev/null \
    | sed -E 's/^- branch:[[:space:]]*//; s/[[:space:]]+#.*$//; s/[[:space:]]*$//'
}

checkout_branch() {
  local branch="$1"
  [ -n "$branch" ] || die "run.md has no '- branch:' line — cannot resolve the run's branch"
  if ! git -C "$repo_root" rev-parse --verify --quiet "refs/heads/$branch" >/dev/null; then
    git -C "$repo_root" fetch origin "$branch" \
      || die "could not fetch origin/$branch — check the network and the branch name in run.md"
  fi
  git -C "$repo_root" checkout "$branch" \
    || die "could not check out $branch (uncommitted changes in the way?)"
}

# --- resolve ----------------------------------------------------------------------------------

if [ -f "$run_md" ]; then
  # Already in the working tree — just make sure we are on the branch it records.
  echo "run.md present for '$slug' — checking out its branch" >&2
  checkout_branch "$(branch_from_run_md "$run_md")"
else
  # Not in the tree — resolve the PR by slug, then check out its head branch.
  [ -n "$gh_token" ] || die "GITHUB_TOKEN (or GH_TOKEN) is not set — needed to search the run's PR"
  echo "run.md absent for '$slug' — searching the run's PR via the GitHub API" >&2
  git -C "$repo_root" fetch origin --quiet || die "git fetch origin failed — check the network"

  # The PR body's Spec block carries "- slug: <slug>"; search for that phrase, scoped to this repo.
  query="repo:${repo} is:pr in:body \"slug: ${slug}\""
  q_enc="$(jq -rn --arg q "$query" '$q|@uri')"
  resp="$(gh_get "/search/issues?q=${q_enc}&per_page=1")" \
    || die "GitHub search request failed (network/egress)"
  http="$(printf '%s' "$resp" | tail -n1)"
  body="$(printf '%s' "$resp" | sed '$d')"
  [ "$http" = "200" ] || die "GitHub search returned HTTP $http: $(printf '%s' "$body" | jq -r '.message // empty' 2>/dev/null)"

  pr_number="$(printf '%s' "$body" | jq -r '.items[0].number // empty')"
  [ -n "$pr_number" ] || stop "No PR found for slug '$slug' — Define has not run for it (or the slug is wrong)."

  pr_resp="$(gh_get "/repos/${repo}/pulls/${pr_number}")" || die "could not read PR #$pr_number"
  pr_http="$(printf '%s' "$pr_resp" | tail -n1)"
  pr_body="$(printf '%s' "$pr_resp" | sed '$d')"
  [ "$pr_http" = "200" ] || die "reading PR #$pr_number returned HTTP $pr_http"
  head_branch="$(printf '%s' "$pr_body" | jq -r '.head.ref // empty')"
  [ -n "$head_branch" ] || die "PR #$pr_number has no head branch"

  echo "matched PR #$pr_number on branch $head_branch" >&2
  checkout_branch "$head_branch"
fi

# --- verdict ----------------------------------------------------------------------------------
# After checkout the run folder must be present. If it still isn't, Define genuinely never produced
# this run — STOP rather than fabricate it.

[ -f "$run_md" ] || stop "Still no run.md for '$slug' after checkout — Define has not produced this run. Do not create it; run '/pipeline new'."

branch="$(git -C "$repo_root" rev-parse --abbrev-ref HEAD)"
pr_line="$(grep -m1 '^- pr:' "$run_md" | sed -E 's/^- pr:[[:space:]]*//; s/[[:space:]]+#.*$//; s/[[:space:]]*$//' || true)"
echo "run '$slug' resolved — branch: $branch${pr_line:+, pr: $pr_line}"
echo "RESULT: READY"
