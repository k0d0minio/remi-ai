#!/usr/bin/env bash
# validate-spec.sh — Define's structural self-check on a run's spec.md.
#
# Define calls this before opening (or revising) the draft PR, instead of eyeballing the structure
# conversationally. It checks only the DETERMINISTIC, non-AI properties: header fields, required
# sections, acceptance criteria written as checkboxes. Whether an open question actually *blocks* a
# criterion is a judgement the agent still owns — open questions are surfaced as an advisory line,
# never a failure. No network. Pure awk/grep.
#
# It runs at Define time, before the gate. The pipeline.yaml CI job also runs it on later pushes,
# but only as an advisory job-summary note — it never red-blocks the PR.
#
# Usage:
#   pipeline/scripts/validate-spec.sh <slug>             # resolves pipeline/runs/<slug>/03_define/output/spec.md
#   pipeline/scripts/validate-spec.sh <path-to-spec.md>  # or validate a file directly
#
# Verdict (stdout, last line):
#   RESULT: OK        exit 0  — structure is sound; ready for the human to review.
#   RESULT: INVALID   exit 2  — structural problems (listed on stderr) — fix and re-run.
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"

die() { echo "error: $*" >&2; exit 1; }

# The app vocabulary — must stay in step with .github/labels.yml and project-labels.sh.
APPS=(web admin marketing docs support demo packages)

# --- args → spec path -------------------------------------------------------------------------

arg=""
while [ $# -gt 0 ]; do
  case "$1" in
    --*) die "unknown flag: $1" ;;
    *)   [ -z "$arg" ] && arg="$1" || die "unexpected argument: $1"; shift ;;
  esac
done
[ -n "$arg" ] || die "usage: validate-spec.sh <slug | path-to-spec.md>"

if [ -f "$arg" ]; then
  spec="$arg"
else
  spec="$repo_root/pipeline/runs/$arg/03_define/output/spec.md"
fi
[ -f "$spec" ] || die "no spec at $spec (write spec.md first, or pass an explicit path)"

# --- checks -----------------------------------------------------------------------------------

problems=()
add() { problems+=("$1"); }

# 1. Header fields present — these are the projection inputs for the labels and the PR body.
for field in slug apps touches complexity; do
  grep -Eq "^- ${field}:[[:space:]]*[^[:space:]]" "$spec" || add "missing or empty header field: '- ${field}:'"
done

# complexity must be one of the fixed vocabulary — the label depends on it.
complexity="$(grep -m1 '^- complexity:' "$spec" | sed -E 's/^- complexity:[[:space:]]*//; s/[[:space:]]*$//' | tr '[:upper:]' '[:lower:]' || true)"
case "$complexity" in
  trivial|standard|complex) : ;;
  "") : ;;  # already reported as missing above
  *) add "complexity must be trivial|standard|complex, found: '$complexity'" ;;
esac

# apps must name at least one workspace app. project-labels.sh hard-fails without one, and by then
# the PR is already open — catch it here, before any side effect.
apps_raw="$(grep -m1 '^- apps:' "$spec" | sed -E 's/^- apps:[[:space:]]*//; s/[[:space:]]*$//' || true)"
if [ -n "$apps_raw" ]; then
  app_hit=0
  for vocab in "${APPS[@]}"; do
    printf '%s' "$apps_raw" | grep -iqwE "$vocab" && app_hit=1
  done
  [ "$app_hit" -eq 1 ] || add "apps must name at least one of: ${APPS[*]} — found: '$apps_raw'"
fi

# 2. Required sections present.
for section in "Problem" "Proposed change" "Acceptance criteria" "Out of scope" "Open questions"; do
  grep -Eq "^##[[:space:]]+${section}[[:space:]]*$" "$spec" || add "missing required section: '## ${section}'"
done

# 3. Acceptance criteria are checkboxes — at least one, and every bullet in the section is one.
ac_section="$(awk '
  /^##[[:space:]]+Acceptance criteria[[:space:]]*$/ { grab=1; next }
  grab && /^##[[:space:]]/ { grab=0 }
  grab { print }
' "$spec")"

ac_checkboxes="$(printf '%s\n' "$ac_section" | grep -Ec '^[[:space:]]*-[[:space:]]+\[[ xX]\]' || true)"
ac_plain_bullets="$(printf '%s\n' "$ac_section" | grep -E '^[[:space:]]*-[[:space:]]' | grep -Evc '^[[:space:]]*-[[:space:]]+\[[ xX]\]' || true)"

if grep -Eq "^##[[:space:]]+Acceptance criteria[[:space:]]*$" "$spec"; then
  [ "$ac_checkboxes" -ge 1 ] || add "## Acceptance criteria has no checkbox items (use '- [ ] <outcome>')"
  [ "$ac_plain_bullets" -eq 0 ] || add "## Acceptance criteria has $ac_plain_bullets non-checkbox bullet(s) — every criterion must be a '- [ ]' checkbox"
fi

# --- advisory (never a failure): open questions ------------------------------------------------
# The template says Open questions must be "none" or non-blocking notes. Whether an entry blocks a
# criterion is the agent's call — we only flag that entries exist, so it gets a second look.
oq_section="$(awk '
  /^##[[:space:]]+Open questions[[:space:]]*$/ { grab=1; next }
  grab && /^##[[:space:]]/ { grab=0 }
  grab { print }
' "$spec")"
oq_entries="$(printf '%s\n' "$oq_section" | grep -E '^[[:space:]]*-[[:space:]]' | grep -Eiv '^[[:space:]]*-[[:space:]]+none[[:space:].]*$' || true)"

# --- verdict ----------------------------------------------------------------------------------

if [ -n "$oq_entries" ]; then
  echo "advisory: ## Open questions has entries — confirm none of them block an acceptance criterion. Move anything you won't do this run to ## Out of scope." >&2
fi

if [ "${#problems[@]}" -eq 0 ]; then
  echo "spec ok: $spec"
  echo "RESULT: OK"
  exit 0
fi

echo "spec invalid: $spec" >&2
for p in "${problems[@]}"; do echo "  ✗ $p" >&2; done
echo "RESULT: INVALID"
exit 2
