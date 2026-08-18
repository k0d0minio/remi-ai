#!/usr/bin/env bash
# send-ship-note.sh — send a feature's ship note as an email via Resend.
#
# The Ship-stage draft IS the email: pipeline/runs/<slug>/06_ship/output/ship-note.md. Its first
# `# ` heading becomes the subject; the rest becomes a plain-text body, sent verbatim. Ship runs
# this with --send immediately after the merge — running the Ship stage is the send authorisation;
# the no-flag dry run exists for debugging.
#
# The recipient is normally ONE address: a channel's inbound email, so the note lands where the
# owners already read everything. The comma-separated form remains for a plain list; either way it
# is one email per recipient. Requires curl + jq.
#
# Config comes straight from the process environment; this script does NOT load any .env file:
#
#   RESEND_API_KEY         (required)  Resend API key.
#   SHIP_NOTE_RECIPIENTS   (required)  Comma-separated recipients (.icm/docs/ENV.md).
#   EMAIL_FROM             (required*) The "from" sender.
#   SHIP_NOTE_FROM         (optional)  Overrides EMAIL_FROM for ship-note mail only.
#   * one of EMAIL_FROM / SHIP_NOTE_FROM must be set.
#
# Usage (dry run by default — prints subject, from, recipients and body; sends nothing):
#   pipeline/scripts/send-ship-note.sh <slug>
#   pipeline/scripts/send-ship-note.sh <slug> --send
set -euo pipefail

command -v curl >/dev/null || { echo "curl not found" >&2; exit 1; }
command -v jq   >/dev/null || { echo "jq not found" >&2; exit 1; }

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"

die() { echo "error: $*" >&2; exit 1; }

# --- args -------------------------------------------------------------------------------------

slug=""
send=0
for arg in "$@"; do
  case "$arg" in
    --send|--live) send=1 ;;
    --*) die "unknown flag: $arg" ;;
    *) [ -z "$slug" ] && slug="$arg" || die "unexpected argument: $arg" ;;
  esac
done
[ -n "$slug" ] || die "usage: send-ship-note.sh <slug> [--send]  (default is a dry run)"

# --- draft → subject + body ---------------------------------------------------------------------

draft="$repo_root/pipeline/runs/$slug/06_ship/output/ship-note.md"
[ -f "$draft" ] || die "no ship note at $draft"

subject="$(grep -m1 '^# ' "$draft" | sed 's/^# //' | sed 's/[[:space:]]*$//' || true)"
[ -n "$subject" ] || die "ship-note.md has no \`# \` heading to use as the email subject"

# Body = the draft with the first `# ` heading removed, trimmed of leading/trailing blank lines.
body="$(awk '
  !removed && /^# / { removed=1; next }
  { lines[++n] = $0 }
  END {
    start = 1; while (start <= n && lines[start] ~ /^[[:space:]]*$/) start++
    end = n;   while (end >= start && lines[end] ~ /^[[:space:]]*$/) end--
    for (i = start; i <= end; i++) print lines[i]
  }
' "$draft")"

# --- sender + recipients (from env only) --------------------------------------------------------

from="${SHIP_NOTE_FROM:-${EMAIL_FROM:-}}"
[ -n "$from" ] || die "EMAIL_FROM (or SHIP_NOTE_FROM) is not set — export the sender address"
[ -n "${RESEND_API_KEY:-}" ] || die "RESEND_API_KEY is not set"
[ -n "${SHIP_NOTE_RECIPIENTS:-}" ] || die "SHIP_NOTE_RECIPIENTS is not set — export a comma-separated list"

recipients=()
IFS=',' read -ra raw_recipients <<< "$SHIP_NOTE_RECIPIENTS"
for address in "${raw_recipients[@]}"; do
  address="$(echo "$address" | sed 's/^[[:space:]]*//;s/[[:space:]]*$//')"
  [ -n "$address" ] && recipients+=("$address")
done
[ "${#recipients[@]}" -gt 0 ] || die "SHIP_NOTE_RECIPIENTS contained no addresses"

# --- dry run ------------------------------------------------------------------------------------

if [ "$send" -eq 0 ]; then
  echo "Dry run — nothing sent. Pass --send to send."
  echo "Subject:    $subject"
  echo "From:       $from"
  echo "Recipients: ${#recipients[@]} ($(printf '%s, ' "${recipients[@]}" | sed 's/, $//'))"
  echo
  echo "--- body ---"
  echo
  echo "$body"
  exit 0
fi

# --- send (one email per recipient) --------------------------------------------------------------

sent=0
failed=0
for to in "${recipients[@]}"; do
  payload="$(jq -n \
    --arg from "$from" --arg to "$to" --arg subject "$subject" --arg text "$body" \
    '{from: $from, to: [$to], subject: $subject, text: $text}')"

  # Capture the HTTP status alongside the body (last line = status code). `curl` without `-f`
  # returns 0 on HTTP errors, and a proxy may return a non-JSON body, so success must be PROVEN —
  # a 2xx status AND a Resend id — never inferred from the absence of an error field. Email that
  # fails silently is the failure mode this whole block exists to rule out.
  response="$(curl -sS -m 30 -w $'\n%{http_code}' -X POST "https://api.resend.com/emails" \
    -H "Authorization: Bearer $RESEND_API_KEY" \
    -H "Content-Type: application/json" \
    -d "$payload")" || { failed=$((failed + 1)); echo "  ✗ $to: request failed (network/egress)" >&2; continue; }

  http_code="$(printf '%s' "$response" | tail -n1)"
  resp_body="$(printf '%s' "$response" | sed '$d')"
  id="$(printf '%s' "$resp_body" | jq -r '.id // empty' 2>/dev/null || true)"

  if [ "$http_code" = "200" ] && [ -n "$id" ]; then
    sent=$((sent + 1))
    echo "  ✓ $to ($id)"
  else
    failed=$((failed + 1))
    reason="$(printf '%s' "$resp_body" | jq -r '.message // empty' 2>/dev/null || true)"
    [ -n "$reason" ] || reason="$(printf '%s' "$resp_body" | head -c 200)"
    echo "  ✗ $to: HTTP ${http_code:-?} — ${reason:-no response body}" >&2
  fi
done

echo
echo "Done — sent $sent, failed $failed."
[ "$failed" -eq 0 ] || exit 1
