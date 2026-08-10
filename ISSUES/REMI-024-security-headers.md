# REMI-024 · Security headers on the authenticated surfaces

| | |
| --- | --- |
| **Type** | chore |
| **Priority** | P2 — the signal it can no longer wait is real authentication going live (REMI-023) |
| **Size** | Hours |
| **Depends on** | REMI-023 (land together with or immediately after auth) |
| **Blocked by** | — |
| **Sources** | audit F-35 |

## Problem statement

No app sends a content-security policy, strict-transport-security, or clickjacking protection —
no `headers()` in any `next.config.ts`, no middleware sets any. Low risk for static content
sites; real for the sign-in surface and the operator console once real authentication exists.

## Required steps

1. Build a shared headers block (CSP, HSTS for custom domains, X-Frame-Options/frame-ancestors,
   referrer policy, permissions policy) in one home — a small config helper both apps import,
   consistent with the one-home rule.
2. Apply to `apps/web` and `apps/admin` first; then the public apps with a CSP loose enough for
   their actual needs (check what Vercel Analytics and the fonts/scripts actually require —
   derive the policy from the code, don't guess).
3. Verify nothing breaks: the CSP must be tested against real pages (report-only first is
   acceptable as a first PR, with the enforcement flip as the follow-up).

## Acceptance criteria

- [ ] Web and admin responses carry CSP, HSTS, and anti-clickjacking headers.
- [ ] The policy is defined once and imported, not copy-pasted per app.
- [ ] No console CSP violations on the main flows (or a report-only period has proven the policy).

## Agent prompt

```text
Work in the remi-ai monorepo. Read CLAUDE.md and CONVENTIONS.md, then docs/audit-report.md
finding F-35.

Task: add security headers, derived from what the apps actually load.
1. Inventory what each app really uses (inline scripts/styles Next.js needs, Vercel Analytics'
   script origin, fonts, any connect targets like the error tracker from REMI-009) by reading
   the code — the CSP must come from evidence, not a template.
2. Create one shared headers helper (a small exported function in the services package's shared
   area or a root config helper — one home, imported by each next.config.ts) producing: CSP,
   Strict-Transport-Security, X-Frame-Options or frame-ancestors, Referrer-Policy,
   Permissions-Policy.
3. Apply to apps/web and apps/admin with an enforced policy; apply to the public apps with
   Content-Security-Policy-Report-Only first, and note the enforcement flip as a follow-up in
   the PR.
4. Keep per-app differences (admin has no analytics? marketing has OG image generation?) as
   explicit parameters, not divergent copies.
Do not run build/lint/typecheck locally (factory-owned) — push, read CI, and check the Vercel
preview's response headers to verify. Open a PR.
```
