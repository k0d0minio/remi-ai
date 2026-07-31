#!/usr/bin/env bash
# new-run.sh — scaffold a pipeline run: commit it, open its PR, label it, consume the stub.
#
# Two modes:
#   • Spine (default) — the mechanical half of Define (pipeline/stages/03_define/CONTEXT.md).
#     Define writes spec.md and hands the one-line PR Summary in via --summary; this script commits
#     the run + pushes, opens the DRAFT PR with a body projected from spec.md (template headings,
#     both gate anchors, acceptance criteria mirrored UNTICKED), writes/extends run.md, projects the
#     labels, and — if --stub was passed — git mv's the stub into _done/.
#   • Lane (--lane bug|tweak|chore) — the fast-lane scaffold (pipeline/lanes/*/CONTEXT.md). No spec
#     required: opens a READY (non-draft) PR whose body carries ONLY the ready-to-merge gate, labels
#     it type:<lane>, and writes run.md with a `lane:` line.
#
# The PR body mirrors .github/pull_request_template.md — the headings and gate anchors are kept
# verbatim because the pipeline parses them (pipeline/_shared/github.md). A missing spec-approved
# anchor on a lane PR is by design: the parser treats a missing anchor as "not required".
#
# Config from the process environment (no .env loading):
#   GITHUB_TOKEN / GH_TOKEN  (one required)  GitHub token with repo scope.
#   GITHUB_REPO              (optional)      owner/repo. Default: k0d0minio/remi-ai.
#   GITHUB_API_URL           (optional)      API base. Default: https://api.github.com.
#
# Usage:
#   pipeline/scripts/new-run.sh <slug> --summary "<one plain sentence>" \
#       [--stub pipeline/intake/<scope>/<feature>.md] [--steps "<steps to test>"] [--base main] \
#       [--lane bug|tweak|chore] [--title "<PR title — lane mode, default: the slug>"]
#
# Verdict (stdout, last line):
#   RESULT: CREATED   exit 0  — run committed, PR opened + labelled, run.md written/extended, stub
#                               consumed (if given). The PR URL is echoed above the verdict.
set -euo pipefail

command -v curl >/dev/null || { echo "curl not found" >&2; exit 1; }
command -v jq   >/dev/null || { echo "jq not found"   >&2; exit 1; }
command -v git  >/dev/null || { echo "git not found"  >&2; exit 1; }

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
here="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

die() { echo "error: $*" >&2; exit 1; }

# --- args -------------------------------------------------------------------------------------

slug=""; summary=""; stub=""; steps=""; base="main"; lane=""; title_flag=""
while [ $# -gt 0 ]; do
  case "$1" in
    --summary) summary="${2:-}"; shift 2 ;;
    --stub)    stub="${2:-}"; shift 2 ;;
    --steps)   steps="${2:-}"; shift 2 ;;
    --base)    base="${2:-}"; shift 2 ;;
    --lane)    lane="${2:-}"; shift 2 ;;
    --title)   title_flag="${2:-}"; shift 2 ;;
    --*)       die "unknown flag: $1" ;;
    *)         [ -z "$slug" ] && slug="$1" || die "unexpected argument: $1"; shift ;;
  esac
done
[ -n "$slug" ]    || die "usage: new-run.sh <slug> --summary \"<one sentence>\" [--stub <path>] [--lane bug|tweak|chore]"
[ -n "$summary" ] || die "--summary \"<one plain sentence>\" is required (the PR Summary — the one AI-authored line)"
case "$lane" in ""|bug|tweak|chore) : ;; *) die "--lane must be bug|tweak|chore, got: $lane" ;; esac
[ -z "$lane" ] || [ -z "$stub" ] || die "--lane and --stub are mutually exclusive (lanes have no intake stubs)"

run_dir="$repo_root/pipeline/runs/$slug"
run_md="$run_dir/run.md"

spec=""
if [ -z "$lane" ]; then
  spec="$run_dir/03_define/output/spec.md"
  [ -f "$spec" ] || die "no spec at $spec — Define must write spec.md first"
fi

# Guard the "exactly one PR per run" rule. A run.md written by Scope/Design (demo:/preview-prs:
# lines, no `- pr:`) is fine — we extend it.
if [ -f "$run_md" ] && grep -Eq '^- pr:[[:space:]]*#?[0-9]+' "$run_md"; then
  die "run.md already records a PR for '$slug' — use '/pipeline define $slug' to revise, not new-run.sh"
fi

# --- config from env --------------------------------------------------------------------------

GH_API="${GITHUB_API_URL:-https://api.github.com}"
repo="${GITHUB_REPO:-k0d0minio/remi-ai}"
gh_token="${GITHUB_TOKEN:-${GH_TOKEN:-}}"
[ -n "$gh_token" ] || die "GITHUB_TOKEN (or GH_TOKEN) is not set — needed to open the PR"

git_c() { git -C "$repo_root" "$@"; }

# Push with bounded exponential backoff — a network blip should not fail the scaffold.
git_push() {
  local delay=2 attempt
  for attempt in 1 2 3 4; do
    if git_c push -u origin "$1"; then return 0; fi
    [ "$attempt" -lt 4 ] || break
    echo "  push failed (attempt $attempt) — retrying in ${delay}s" >&2
    sleep "$delay"; delay=$((delay * 2))
  done
  die "git push of '$1' failed after retries"
}

# --- branch -----------------------------------------------------------------------------------
# Use the current branch; only create one if we are on main/master or detached. The pipeline does
# not name branches — the harness does — so this fallback is for plain local use.

branch="$(git_c rev-parse --abbrev-ref HEAD)"
if [ "$branch" = "main" ] || [ "$branch" = "master" ] || [ "$branch" = "HEAD" ]; then
  branch="claude/$slug"
  echo "on $base/detached — creating run branch $branch" >&2
  git_c checkout -b "$branch"
fi

# --- PR title + body --------------------------------------------------------------------------

if [ -z "$lane" ]; then
  title="$(grep -m1 '^# ' "$spec" | sed -E 's/^#[[:space:]]+//; s/^Spec:[[:space:]]*//; s/[[:space:]]*$//')"
  [ -n "$title" ] || title="$slug"

  apps="$(grep -m1 '^- apps:' "$spec" | sed -E 's/^- apps:[[:space:]]*//; s/[[:space:]]*$//')"
  complexity="$(grep -m1 '^- complexity:' "$spec" | sed -E 's/^- complexity:[[:space:]]*//; s/[[:space:]]*$//')"

  # Mirror the whole Acceptance criteria section verbatim — criteria often wrap across indented
  # continuation lines. Only a bullet's leading checkbox is reset to unticked: the PR tracks tick
  # state, the text stays the spec's. validate-spec.sh has already guaranteed ≥1 checkbox.
  criteria="$(awk '
    /^##[[:space:]]+Acceptance criteria[[:space:]]*$/ { grab=1; next }
    grab && /^##[[:space:]]/ { grab=0 }
    grab {
      if ($0 ~ /^[[:space:]]*-[[:space:]]+\[[ xX]\]/) sub(/\[[ xX]\]/, "[ ]")
      lines[++n] = $0
    }
    END {
      s = 1; while (s <= n && lines[s] ~ /^[[:space:]]*$/) s++
      e = n; while (e >= s && lines[e] ~ /^[[:space:]]*$/) e--
      for (i = s; i <= e; i++) print lines[i]
    }
  ' "$spec")"
  [ -n "$criteria" ] || die "no acceptance-criteria checkboxes found in $spec — run validate-spec.sh"

  [ -n "$steps" ] || steps=$'1. Open the deploy preview\n2. Exercise each acceptance criterion above'

  spec_rel="${spec#"$repo_root/"}"
  # A branch link, so the spec is readable while the PR is open. Ship repoints it to blob/main right
  # after the squash-merge — the branch, and this link, die with the merge.
  spec_link="https://github.com/${repo}/blob/${branch}/${spec_rel}"

  body="$(cat <<EOF
<!-- PIPELINE RUN — do not delete the markers; the pipeline reads them. -->

## Summary

${summary}

## Spec

- slug: ${slug}
- apps: ${apps}
- complexity: ${complexity}
- Full spec (canonical — read here): ${spec_link}

## Acceptance criteria

<!-- text mirrored from spec.md — edit the spec, not these lines; the PR tracks tick state only -->

${criteria}

## Steps to test

${steps}

## Pipeline checklist

<!-- gate:spec-approved -->

- [ ] Spec approved (Define gate — a human ticks this before Build)

<!-- gate:ready-to-merge -->

- [ ] Ready to merge (Ship gate — a human ticks this to authorise the squash-merge)
EOF
)"
  draft=true
else
  title="${title_flag:-$slug}"
  [ -n "$steps" ] || steps=$'1. Open the deploy preview\n2. Confirm the change described above'

  body="$(cat <<EOF
<!-- PIPELINE RUN (lane: ${lane}) — do not delete the markers; the pipeline reads them. -->

## Summary

${summary}

## Steps to test

${steps}

## Pipeline checklist

<!-- gate:ready-to-merge -->

- [ ] Ready to merge (lane gate — a human ticks this to authorise the squash-merge)
EOF
)"
  draft=false
fi

# --- commit the run (+ consume the stub) + push -------------------------------------------------
# The stub is retired BEFORE the PR opens: if anything here fails, no PR exists yet and the run is
# cleanly re-runnable. An orphaned PR with a still-active stub was the failure mode this ordering
# exists to prevent.

if [ -z "$lane" ]; then
  commit_msg="feat: $slug — define spec"
else
  commit_msg="chore: $slug — open $lane lane"
fi
git_c add "pipeline/runs/$slug/"
if git_c diff --cached --quiet; then
  echo "run files already committed" >&2
else
  git_c commit -m "$commit_msg" >/dev/null
fi

if [ -n "$stub" ]; then
  stub_path="$stub"
  [ -f "$stub_path" ] || stub_path="$repo_root/$stub"
  [ -f "$stub_path" ] || die "--stub given but no file at: $stub"
  stub_dir="$(dirname "$stub_path")"
  done_dir="$stub_dir/_done"
  mkdir -p "$done_dir"
  feature_slug="$(basename "$stub_path" .md)"
  git_c mv "$stub_path" "$done_dir/$(basename "$stub_path")"
  git_c commit -m "chore: mark $feature_slug stub spun out" >/dev/null
  echo "marked stub consumed: $stub → $done_dir/" >&2
fi

git_push "$branch"

# --- open the PR ------------------------------------------------------------------------------

payload="$(jq -n --arg title "$title" --arg head "$branch" --arg base "$base" --arg body "$body" \
  --argjson draft "$draft" '{title: $title, head: $head, base: $base, draft: $draft, body: $body}')"

resp="$(curl -sS -m 30 -w $'\n%{http_code}' -X POST \
  -H "Authorization: Bearer $gh_token" \
  -H "Accept: application/vnd.github+json" \
  -H "X-GitHub-Api-Version: 2022-11-28" \
  -H "Content-Type: application/json" \
  -d "$payload" \
  "$GH_API/repos/${repo}/pulls")" \
  || die "PR create request failed (network/egress)"

http="$(printf '%s' "$resp" | tail -n1)"
pr_json="$(printf '%s' "$resp" | sed '$d')"
if [ "$http" != "201" ]; then
  reason="$(printf '%s' "$pr_json" | jq -r '.errors[0].message // .message // empty' 2>/dev/null || true)"
  die "PR create returned HTTP $http — ${reason:-no message}"
fi
pr_number="$(printf '%s' "$pr_json" | jq -r '.number')"
pr_url="$(printf '%s' "$pr_json" | jq -r '.html_url')"
[ -n "$pr_number" ] && [ "$pr_number" != "null" ] || die "PR create returned no number"

# --- write / extend run.md (branch + pr pointers), commit, push --------------------------------
# A front run already has a run.md (lane:/demo:/preview-prs: lines) — append, never clobber.

mkdir -p "$run_dir"
if [ ! -f "$run_md" ]; then
  {
    echo "# Run: $slug"
    echo
    [ -n "$lane" ] && echo "- lane: $lane"
  } > "$run_md"
fi
grep -Eq '^- branch:' "$run_md" || echo "- branch: $branch" >> "$run_md"
grep -Eq '^- pr:'     "$run_md" || echo "- pr: #$pr_number" >> "$run_md"
git_c add "pipeline/runs/$slug/run.md"
git_c diff --cached --quiet || git_c commit -m "chore: $slug — run pointers (branch + PR)" >/dev/null
git_push "$branch"

# --- labels -----------------------------------------------------------------------------------

if [ -z "$lane" ]; then
  # Spine: full projection from spec.md. A label failure must not orphan the just-opened PR —
  # validate-spec.sh has already vetted the header and CI re-projects on the next push, so degrade
  # to a loud warning rather than dying here.
  GITHUB_TOKEN="$gh_token" GITHUB_REPO="$repo" GITHUB_API_URL="$GH_API" \
    "$here/project-labels.sh" "$slug" --stage define >&2 \
    || echo "WARNING: labels could not be projected onto PR #$pr_number — fix and re-run project-labels.sh (the PR itself is fine; CI re-projects on the next push)" >&2
else
  # Lane: just type:<lane> — there is no spec to project from.
  lresp="$(curl -sS -m 30 -w $'\n%{http_code}' -X PUT \
    -H "Authorization: Bearer $gh_token" \
    -H "Accept: application/vnd.github+json" \
    -H "X-GitHub-Api-Version: 2022-11-28" \
    -H "Content-Type: application/json" \
    -d "$(jq -n --arg l "type:$lane" '{labels: [$l]}')" \
    "$GH_API/repos/${repo}/issues/${pr_number}/labels")" \
    || die "label write request failed (network/egress)"
  lhttp="$(printf '%s' "$lresp" | tail -n1)"
  [ "$lhttp" = "200" ] || die "label write returned HTTP $lhttp (does 'type:$lane' exist? see .github/labels.yml)"
fi

# --- verdict ----------------------------------------------------------------------------------

echo "run '$slug' created — branch: $branch, ${lane:+$lane lane }PR: $pr_url"
echo "RESULT: CREATED"
