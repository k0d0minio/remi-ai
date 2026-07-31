#!/usr/bin/env bash
# route-request.sh — UserPromptSubmit classifier that suggests a pipeline lane for a raw request.
#
# Deterministic, sub-100ms, no LLM (modelled on block-local-checks.sh): reads the UserPromptSubmit
# payload on stdin, greps the prompt, and — only when the prompt looks like actionable work —
# injects ONE ADVISORY `[pipeline-router]` line suggesting a lane. The /pipeline router announces
# the suggestion and proceeds; the user can always override. Pure questions and discussion pass
# through untouched, with no output at all.
#
# Contract:
#   exit 0 always — this hook NEVER blocks (never exits 2). Fail-open on any malformed input.
#   stdout on a match: {"hookSpecificOutput":{"hookEventName":"UserPromptSubmit","additionalContext":"…"}}
#   stdout otherwise: nothing.
set -euo pipefail

input="$(cat 2>/dev/null || true)"
command -v jq >/dev/null 2>&1 || exit 0            # no jq → can't parse → stay silent
prompt="$(printf '%s' "$input" | jq -r '.prompt // ""' 2>/dev/null || true)"
[ -n "$prompt" ] || exit 0

# Slash commands are already routed; very short prompts are conversation, not work.
case "$prompt" in /*) exit 0 ;; esac
[ "${#prompt}" -ge 15 ] || exit 0

# Webhook and injected-event payloads are not user requests — classifying them produces stray hints.
case "$prompt" in
  *"<github-webhook-activity>"*|*"<untrusted_external_data"*|*"<task-notification"*) exit 0 ;;
esac

# One lowercased copy for matching (the first 2000 chars is plenty and keeps grep fast).
p="$(printf '%.2000s' "$prompt" | tr '[:upper:]' '[:lower:]')"

# Pure questions and discussion pass through untouched: an interrogative opener, or a single
# question-mark-terminated line with no imperative work verb anywhere.
first_word="$(printf '%s' "$p" | awk '{print $1; exit}' | tr -d '?,.!')"
case "$first_word" in
  what|why|how|where|when|who|which|is|are|was|were|can|could|does|do|did|should|would|will|explain|tell)
    exit 0 ;;
esac
if printf '%s' "$p" | head -n1 | grep -q '?[[:space:]]*$' \
   && ! printf '%s' "$p" | grep -Eq '\b(fix|add|build|implement|create|change|update|rename|remove|refactor|upgrade|bump|migrate)\b'; then
  exit 0
fi

emit() {
  jq -cn --arg ctx "$1" \
    '{hookSpecificOutput:{hookEventName:"UserPromptSubmit",additionalContext:$ctx}}'
  exit 0
}
hint_tail="This is an advisory classification from .claude/hooks/route-request.sh — announce the suggested lane, let the user override, and route per .claude/skills/pipeline/SKILL.md."

# --- classify (most specific first) -------------------------------------------------------------

# Bug: something that used to work is now wrong.
if printf '%s' "$p" | grep -Eq "\b(bug|broken|breaks|crash(es|ed)?|error|exception|regression|500|404)\b|\b(doesn'?t|does not|won'?t|can'?t|stopped|no longer|fail(s|ed|ing)?) (work|load|open|save|send|render|show)|is (broken|failing|down)"; then
  emit "[pipeline-router] This prompt looks like a BUG report. Suggest the fast lane: /pipeline bug \"<the report>\" (reproduce → fix → single merge-gate PR). $hint_tail"
fi

# Tweak: tiny, fully-specified surface adjustment.
if printf '%s' "$p" | grep -Eq "\b(tweak|typo|reword|rename|re-?label|copy change|wording|spacing|padding|colou?r|font|icon|tooltip|placeholder)\b|\b(small|tiny|quick|minor) (change|fix|adjustment|update)\b"; then
  emit "[pipeline-router] This prompt looks like a TWEAK. Suggest the fast lane: /pipeline tweak \"<the change>\" (small PR, merge gate only). $hint_tail"
fi

# Chore: no user-facing behaviour change.
if printf '%s' "$p" | grep -Eq "\b(refactor|chore|clean ?up|dep(endency)? bump|bump (the )?dep|upgrade [a-z@]|update (the )?dependenc|migration|migrate (the )?(db|database|schema|data)|add (an? )?index|drop (an? )?index|ci (config|workflow)|tooling)\b"; then
  emit "[pipeline-router] This prompt looks like a CHORE (no user-facing behaviour change). Suggest the fast lane: /pipeline chore \"<the task>\" (single merge-gate PR; migrations need a working down). $hint_tail"
fi

# Big dump: many bullets or a very long prompt → the front, which cuts it into a batch.
bullet_lines="$(printf '%s\n' "$prompt" | grep -Ec '^[[:space:]]*([-*+•]|[0-9]+[.)])[[:space:]]' || true)"
if [ "${#prompt}" -gt 800 ] || [ "$bullet_lines" -ge 6 ]; then
  emit "[pipeline-router] This prompt looks like a MULTI-FEATURE DUMP. Suggest the full front: /pipeline scope \"<the scope>\" — Scope interrogates the business logic, writes scope.md, and cuts the intake batch (one stub per future PR). $hint_tail"
fi

# Feature-shaped work: a new capability → the spine, entered at Scope.
if printf '%s' "$p" | grep -Eq "\b(add|build|implement|create|introduce|we need|i want|i'd like|new) .{0,40}\b(feature|page|dashboard|flow|screen|report|export|notification|integration|api|endpoint|model|permission|role|workflow)\b|\bnew feature\b"; then
  emit "[pipeline-router] This prompt looks like a NEW FEATURE. Suggest the spine, starting at the front: /pipeline scope \"<the idea>\", then design → new → build → verify → ship. $hint_tail"
fi

# Nothing matched confidently — stay silent; the conversation proceeds untouched.
exit 0
