# REMI-004 · Give the contact form delivery and a record

|                |                                                                                          |
| -------------- | ---------------------------------------------------------------------------------------- |
| **Type**       | feature (fast lane)                                                                      |
| **Priority**   | P0 — the pilot-recruitment window is open until 31 August                                |
| **Size**       | Hours to a day                                                                           |
| **Depends on** | —                                                                                        |
| **Blocked by** | A Resend account and `RESEND_API_KEY` (audit: seam and env var already prepared; REQ-18) |
| **Sources**    | audit F-06, checklist item 2; info-gathering REQ-10, REQ-18                              |

## Problem statement

The public marketing site's contact form validates input, then returns success without delivering
the message anywhere. It is honest about it — the success copy tells senders delivery is not
connected and to email directly — but it keeps **no record** of who wrote in, during the one
pilot-recruitment window this quarter is built around. A prospective pilot practitioner who fills
the form and doesn't re-type their message into a mail client is gone without a trace.

## Required steps

1. Wire the email seam: implement a Resend adapter for the existing email interface in
   `packages/services/src/email/` (a console fallback exists; the seam and `RESEND_API_KEY`
   variable are already reserved in `docs/ENV.md`).
2. Make the contact form action (`apps/marketing/app/[locale]/contact/actions.ts`) call the seam
   instead of returning fake success. Deliver to the monitored contact addresses.
3. Handle failure honestly: if sending fails, tell the sender (in both languages) and keep the
   "email us directly" fallback copy for that path.
4. Restore an ordinary "we'll reply" success message in `en.ts` and `fr.ts` once delivery works.
5. Keep the three-list env rule: zod schema + `docs/ENV.md` + `turbo.json` all updated together.
6. Set `RESEND_API_KEY` in the Vercel marketing project (or document that the owner must).

## Acceptance criteria

- [ ] A submitted contact form results in an email arriving at a monitored address.
- [ ] Failures are shown to the sender; nothing pretends success while dropping the message.
- [ ] Success copy no longer says delivery is unconnected, in both EN and FR.
- [ ] Env variable handled per the three-list rule; no secret committed.

## Agent prompt

```text
Work in the remi-ai monorepo. Read CLAUDE.md and CONVENTIONS.md, then docs/audit-report.md
finding F-06, then packages/services/AGENTS.md for how seams and adapters work here.

Task: make the public contact form actually deliver.
1. Implement a Resend adapter for the email seam in packages/services/src/email/ (interface and
   registration point exist; a console fallback shows the intended shape). Read RESEND_API_KEY
   through the services env module, never process.env directly outside the documented exception.
2. Register the adapter for the marketing app and make
   apps/marketing/app/[locale]/contact/actions.ts send the submission through the seam to the
   contact addresses used in the page content. On send failure, return an honest error state the
   form renders, keeping the "email us directly" fallback.
3. Update the success copy in apps/marketing/lib/content/en.ts and fr.ts (currently says delivery
   is not connected) to an ordinary confirmation, keeping EN/FR parity — the compiler enforces it.
4. Keep the env three-list rule: the zod schema in packages/services, docs/ENV.md, and turbo.json
   must agree. Never commit a key.
5. Add tests for any pure logic you introduce if the test harness (Vitest) exists by the time you
   work on this; otherwise keep logic minimal and pure so it is testable later.
Do not run build/lint/typecheck locally (factory-owned); push a feature branch, open a PR, and
state plainly whether you could verify a real send or whether the owner must set the API key
first.
```
