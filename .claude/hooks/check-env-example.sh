#!/usr/bin/env bash
# check-env-example.sh — PostToolUse(Edit|Write|MultiEdit) guard that keeps every `.env.example` in
# the one shape `.icm/scripts/env.sh` parses (parse_example). An agent may edit these files — they
# are the committed manifest of keys and prose — but never out of format.
#
# The format: an optional header (the comment lines the file opens with, then a blank line), then
# one block per key, blocks separated by a blank line:
#
#   # One sentence on what the key is for. [production,preview,development]
#   KEY=
#
#   • one or more `#` note lines directly above the key — no key without a note;
#   • an optional `[targets]` suffix ending the LAST note line, tokens from
#     production · preview · development · ci · cloud, comma-separated;
#   • `KEY=` with an EMPTY value — values never live in git (env.sh → Rules);
#   • a blank line between blocks — a note never directly follows the previous KEY=;
#   • nothing else: no `export`, no quotes, no inline comments, no duplicate keys, no CRLF.
#
# Contract (hook): reads the PostToolUse payload on stdin, checks tool_input.file_path when its
# basename is `.env.example`.
#   exit 0 → in format, or not a .env.example (and the fail-open path on malformed input).
#   exit 2 → out of format; stderr names each line so the agent fixes it in its next edit.
# Manual use: `.claude/hooks/check-env-example.sh <file>…` — same checks, same exits.
# It never prints a line's value: a key that carries one is named by key and line number only.
set -uo pipefail

check() {
  local file="$1"
  [ -f "$file" ] || return 0
  awk -v f="$file" '
    function fail(msg) { printf "  %s:%d: %s\n", f, NR, msg > "/dev/stderr"; bad=1 }
    BEGIN { valid["production"]; valid["preview"]; valid["development"]; valid["ci"]; valid["cloud"] }
    /\r$/ { fail("CRLF line ending — use LF"); sub(/\r$/, "") }
    NR == 1 { hdr = /^#/ }                          # a leading comment block is the file header
    /^#/ {
      if (after) fail("no blank line before this note — separate each KEY= block from the next")
      note=1; last=$0; after=0
      next
    }
    /^[ \t]*$/ {
      if ($0 != "") fail("whitespace-only line — leave separator lines empty")
      if (note && hdr) hdr=0                        # the header block ends here
      else if (note) fail("note with no key under it — a note sits directly above its KEY= line")
      note=0; after=0; hdr=0; next
    }
    /^[A-Z_][A-Z0-9_]*=/ {
      key=$0; sub(/=.*/, "", key)
      if ($0 != key "=") fail(key " carries a value — .env.example holds keys and prose, never values (KEY=)")
      if (hdr) fail(key " sits under the file header — leave a blank line after the header, then the note for the key")
      else if (!note) fail(key " has no note — add a `# …` line directly above it")
      else if (match(last, /\[[^]]*\][ \t]*$/)) {
        t=substr(last, RSTART+1, RLENGTH-2); sub(/\][ \t]*$/, "", t)
        if (t !~ /^[a-z]+(,[a-z]+)*$/) fail(key " targets [" t "] — comma-separated, lowercase, no spaces")
        n=split(t, parts, ",")
        for (i=1; i<=n; i++) if (!(parts[i] in valid)) fail(key " target \"" parts[i] "\" — use production, preview, development, ci or cloud")
      }
      if (key in seen) fail(key " declared twice (first at line " seen[key] ")")
      if (after) fail(key " follows another key with no blank line — one block per key")
      seen[key]=NR; note=0; after=1; hdr=0; next
    }
    {
      # Anything else: `export KEY=`, lowercase keys, `KEY = x`, stray text. Never echo the line.
      fail("not a note, a blank line or KEY= — the manifest takes only those three")
      note=0; after=0; hdr=0
    }
    END {
      if (note && !hdr) fail("trailing note with no key under it")
      exit bad
    }' "$file" || return 1
  [ -z "$(tail -c1 "$file")" ] || { echo "  $file: no newline at end of file" >&2; return 1; }
  return 0
}

files=()
if [ $# -gt 0 ]; then
  files=("$@")
else
  input="$(cat 2>/dev/null || true)"
  command -v jq >/dev/null 2>&1 || exit 0          # no jq → can't parse → fail open
  path="$(printf '%s' "$input" | jq -r '.tool_input.file_path // ""' 2>/dev/null || true)"
  [ "$(basename -- "${path:-x}")" = ".env.example" ] || exit 0
  files=("$path")
fi

rc=0
for f in "${files[@]}"; do
  [ "$(basename -- "$f")" = ".env.example" ] || continue
  if ! check "$f"; then
    echo "$f is out of format (see .claude/hooks/check-env-example.sh for the shape) — fix it before moving on" >&2
    rc=2
  fi
done
exit "$rc"
