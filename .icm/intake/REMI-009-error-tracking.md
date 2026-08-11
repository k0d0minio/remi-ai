# REMI-009 · Wire error tracking and the crash safety nets

|                |                                                                                   |
| -------------- | --------------------------------------------------------------------------------- |
| **Type**       | feature (foundation)                                                              |
| **Priority**   | P1 — until this exists, every crash after it is invisible                         |
| **Size**       | A day                                                                             |
| **Depends on** | —                                                                                 |
| **Blocked by** | A Sentry (or equivalent) account and DSN (REQ-07: confirm nothing already exists) |
| **Sources**    | audit F-27, F-29, F-43 (global-error), checklist item 6                           |

## Problem statement

A production crash today is invisible: server exceptions write to hosting logs that expire
unread, client-side crashes are recorded nowhere at all, and a whole-app outage has no uptime
probe. The repo itself calls this "the top unstarted ops item" and has reserved `SENTRY_DSN`.
Separately, no app has `global-error.tsx` (a root-layout exception renders Next.js's unstyled
crash page) or `instrumentation.ts` — the same file that error tracking, and later the database
adapter registration (F-11), want to live in.

## Required steps

1. Add Sentry (or the chosen equivalent) via `instrumentation.ts` in each of the six apps —
   server and client initialisation, environment-tagged, reading `SENTRY_DSN` per the env rules
   (three-list rule: zod schema + `docs/ENV.md` + `turbo.json`).
2. Add `global-error.tsx` to all six apps, styled with the design system, showing the correlation
   id like the existing `error.tsx` pages, and reporting to the tracker.
3. Connect the existing error boundaries' report hook to the tracker.
4. Add a root-level `not-found.tsx` to web, marketing, and support (F-43 — unknown-locale URLs
   currently get the unstyled default).
5. Stand up an uptime check on the six origins (external monitor; document which and who gets
   alerted — the alerting decision is the owner's).
6. Verify the tracker respects the data posture: no request bodies / personal data in events by
   default (health product; see F-34).

## Acceptance criteria

- [ ] A thrown server error and a thrown client error both appear in the tracker, per app.
- [ ] Root-layout crashes render a branded page in every app.
- [ ] `/xx/anything` on the locale apps renders a styled 404.
- [ ] Env variables handled per the three-list rule; DSN not committed.
- [ ] Uptime monitoring exists or the exact owner setup steps are written down.

## Agent prompt

```text
Work in the remi-ai monorepo. Read CLAUDE.md and CONVENTIONS.md, then .icm/docs/audit-report.md
findings F-27, F-29, F-43, and docs/ENV.md (SENTRY_DSN is reserved there).

Task: make production failures visible.
1. Wire @sentry/nextjs into all six apps via instrumentation.ts (server) and the client init,
   with environment tags and sensible sample rates. Read SENTRY_DSN through the services env
   module; update the zod schema, docs/ENV.md, and turbo.json together (three-list rule).
   Configure scrubbing so no personal data or request bodies are sent by default.
2. Add global-error.tsx to each app: use @remi/ui components, mirror the correlation-id pattern
   of the existing error.tsx pages, and report the error to Sentry.
3. Find the existing error boundaries' report hook (the audit says one exists) and connect it.
4. Add root-level not-found.tsx to apps/web, apps/marketing, apps/support, matching the styled
   404s that admin and demo already have at their roots.
5. In the PR, list the uptime-monitoring options for the six origins and the exact steps left for
   the owner (account, alert recipients) — do not invent an alerting policy.
Do not run build/lint/typecheck locally (factory-owned). Push a feature branch, open a PR, read
CI back.
```
