# REMI-026 · Quick feedback and group messages

|                |                                                                     |
| -------------- | --------------------------------------------------------------------- |
| Status         | ready once REMI-023 lands                                           |
| **Type**       | feature                                                             |
| **Priority**   | P1 — Phase D                                                        |
| **Size**       | Half a week                                                         |
| **Depends on** | REMI-023                                                            |
| **Blocked by** | —                                                                   |
| **Sources**    | Status report Phase D bullet 4 · `.icm/docs/braindump/roadmap/features.md` |

## Problem statement

The braindump asks for two lightweight communication features whose purpose is *maintenir le lien
motivationnel entre les consultations*: quick feedback — encouragements, emojis, short messages —
and group messages to several patients at once (advice, reminders, educational content).

The word doing the work is *rapide*. A practitioner with forty patients will use a one-tap
encouragement and will not use an inbox. The design constraint is that sending must cost seconds,
not minutes.

## Required steps

1. Quick feedback from both the cohort and detail views: an encouragement, an emoji, or a short
   message, in one or two taps.
2. Group messages to a selected set of patients — advice, reminders, content — sent once.
3. Deliver into the patient's daily hub, where they will actually see it, rather than only by email.
4. Keep it one-directional and simple unless the product decides otherwise: a full messaging inbox
   is a different product with different obligations.
5. Rate-limit and log. This is a channel into patients' phones about their health.

## Open questions — flag these on pickup

- **Can patients reply?** The braindump does not say. A reply channel turns this into messaging,
  with moderation, response-time expectations, and possibly clinical-record implications.
- **Is this medical communication?** A practitioner sending health advice through REMI may carry
  record-keeping obligations. Worth a question to counsel via REMI-015 rather than an assumption.
- **How are group recipients chosen?** Manual selection, saved segments, or rule-based (e.g.
  "everyone struggling this week"). The last is the most useful and the largest scope.
- **What is the delivery channel?** In-app only, or email/push too — which reopens the notification
  question from REMI-020 and REMI-021.

## Acceptance criteria

- [ ] A practitioner can send an encouragement in one or two taps from the cohort view.
- [ ] A message can go to several selected patients at once.
- [ ] Messages appear in the patient's daily hub.
- [ ] Sending is rate-limited and logged.

## Agent prompt

```text
Work in the remi-ai monorepo. Read CLAUDE.md and CONVENTIONS.md, then .icm/docs/braindump/
roadmap/features.md ("Feedback rapide", "Communication de groupe").

Task: build quick practitioner feedback and group messages.
1. One-or-two-tap encouragements and short messages from the cohort and detail views.
2. Group send to a selected set of patients.
3. Deliver into the patient's daily hub.
4. Rate-limit and log every send.
Do not build a messaging inbox. If replies look necessary, stop and raise it — it is a different
product with different obligations. Do not run build/lint/typecheck/format locally. Push a branch,
open a PR, git mv this ticket into .icm/intake/_done/, and raise the "is this medical
communication" question for counsel rather than assuming it is not.
```
