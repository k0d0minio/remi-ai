#!/usr/bin/env bash
# notify.sh — the project's release notification hook (PROJECT-OWNED — seeded once, never synced).
#
# Release (and a lane whose change was user-visible) hand this script the one-line summary of what
# shipped — the changelog page's H1. In this repo the note goes out as an email through Resend, the
# mail vendor the product already uses, to the address the owners read (normally one channel
# inbox): `_shared/project-rules.md` → Announcing.
#
# Config comes straight from the process environment — this script does NOT load any .env file
# (.icm/docs/ENV.md § Pipeline):
#
#   RESEND_API_KEY        (needed to send)  Resend API key.
#   SHIP_NOTE_RECIPIENTS  (needed to send)  Comma-separated recipients; one email per recipient.
#   EMAIL_FROM            (needed to send)  The "from" sender. SHIP_NOTE_FROM overrides it.
#   NEXT_PUBLIC_DOCS_URL  (optional)        Where the docs site answers — the changelog link.
#
# When any of the three is missing the note is printed and NOT sent, and that is a normal outcome,
# not a failure: a remote session rarely carries these secrets, and a release is complete at the
# merge. Nothing here is a gate. Success is PROVEN — a 2xx and a Resend id — never inferred from
# the absence of an error, so a note that silently went nowhere cannot be reported as sent.
#
# Usage: .icm/scripts/notify.sh "<one-line summary>" [--dry-run]
# Exit:  0 always — a notification is never a gate.
# Last line: RESULT: SENT      every recipient accepted
#            RESULT: SKIPPED   not configured here, or --dry-run — the note was printed, not sent
#            RESULT: FAILED    a send was attempted and Resend refused at least one recipient
set -euo pipefail

RELEASE_NOTES=""
dry_run=0
for arg in "$@"; do
  case "$arg" in
    --dry-run) dry_run=1 ;;
    --*) echo "unknown flag: $arg (usage: notify.sh \"<summary>\" [--dry-run])" >&2; exit 0 ;;
    *) [ -z "$RELEASE_NOTES" ] && RELEASE_NOTES="$arg" || RELEASE_NOTES="$RELEASE_NOTES $arg" ;;
  esac
done
RELEASE_NOTES="${RELEASE_NOTES:-No release notes provided.}"

echo "=== Release Notification Hook ==="
echo "  Notes: $RELEASE_NOTES"

from="${SHIP_NOTE_FROM:-${EMAIL_FROM:-}}"
missing=""
[ -n "${RESEND_API_KEY:-}" ]       || missing="${missing:+$missing, }RESEND_API_KEY"
[ -n "${SHIP_NOTE_RECIPIENTS:-}" ] || missing="${missing:+$missing, }SHIP_NOTE_RECIPIENTS"
[ -n "$from" ]                     || missing="${missing:+$missing, }EMAIL_FROM (or SHIP_NOTE_FROM)"

if [ -n "$missing" ]; then
  echo "  Not configured in this environment ($missing unset) — written, not sent. Whoever holds the"
  echo "  variables can send it unchanged: .icm/scripts/notify.sh \"$RELEASE_NOTES\""
  echo "RESULT: SKIPPED"
  exit 0
fi
if [ "$dry_run" -eq 1 ]; then
  echo "  Dry run — nothing sent. From: $from · To: $SHIP_NOTE_RECIPIENTS"
  echo "RESULT: SKIPPED"
  exit 0
fi

command -v curl >/dev/null || { echo "  curl not found — cannot send"; echo "RESULT: FAILED"; exit 0; }
command -v jq   >/dev/null || { echo "  jq not found — cannot send";   echo "RESULT: FAILED"; exit 0; }

subject="REMI — $RELEASE_NOTES"
body="$RELEASE_NOTES"
if [ -n "${NEXT_PUBLIC_DOCS_URL:-}" ]; then
  body="$body

Changelog: ${NEXT_PUBLIC_DOCS_URL%/}/changelog"
fi

recipients=()
IFS=',' read -ra raw <<< "$SHIP_NOTE_RECIPIENTS"
for address in "${raw[@]}"; do
  address="$(printf '%s' "$address" | sed 's/^[[:space:]]*//;s/[[:space:]]*$//')"
  [ -n "$address" ] && recipients+=("$address")
done
if [ "${#recipients[@]}" -eq 0 ]; then
  echo "  SHIP_NOTE_RECIPIENTS contained no addresses — written, not sent"
  echo "RESULT: SKIPPED"
  exit 0
fi

sent=0; failed=0
for to in "${recipients[@]}"; do
  payload="$(jq -n --arg from "$from" --arg to "$to" --arg subject "$subject" --arg text "$body" \
    '{from: $from, to: [$to], subject: $subject, text: $text}')"
  response="$(curl -sS -m 30 -w $'\n%{http_code}' -X POST "https://api.resend.com/emails" \
    -H "Authorization: Bearer $RESEND_API_KEY" \
    -H "Content-Type: application/json" \
    -d "$payload")" || { failed=$((failed + 1)); echo "  ✗ $to: request failed (network/egress)"; continue; }
  http_code="$(printf '%s' "$response" | tail -n1)"
  resp_body="$(printf '%s' "$response" | sed '$d')"
  id="$(printf '%s' "$resp_body" | jq -r '.id // empty' 2>/dev/null || true)"
  if [ "$http_code" = "200" ] && [ -n "$id" ]; then
    sent=$((sent + 1)); echo "  ✓ $to ($id)"
  else
    failed=$((failed + 1))
    reason="$(printf '%s' "$resp_body" | jq -r '.message // empty' 2>/dev/null || true)"
    [ -n "$reason" ] || reason="$(printf '%s' "$resp_body" | head -c 200)"
    echo "  ✗ $to: HTTP ${http_code:-?} — ${reason:-no response body}"
  fi
done

echo "  Sent $sent, failed $failed."
if [ "$failed" -eq 0 ]; then echo "RESULT: SENT"; else echo "RESULT: FAILED"; fi
exit 0
