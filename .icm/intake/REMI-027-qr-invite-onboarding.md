# REMI-027 · QR and invite-link patient onboarding — the acquisition mechanism

> **Deferred (2026-08-27):** practitioner-phase / later-phase work. Per `.icm/docs/new-development-direction.docx`, the patient experience is built and validated first (FunMedDev test 1 Dec, open day 19 Dec); the practitioner space, parser, subscriptions and practitioner beta come after, informed by Morgane's own terrain experience with 10-15 patients. Was higher priority under the retired Phase A-F plan.

|                |                                                                                                     |
| -------------- | --------------------------------------------------------------------------------------------------- |
| Status         | ready once REMI-013 lands                                                                           |
| **Type**       | feature                                                                                             |
| **Priority**   | P2 — parked until the patient experience is validated (new development direction)                   |
| **Size**       | Half a week                                                                                         |
| **Depends on** | REMI-013 (the practitioner↔patient binding), REMI-018                                               |
| **Blocked by** | —                                                                                                   |
| **Sources**    | Status report Phase D bullet 5 and Part one · `.icm/docs/braindump/marketing-growth/acquisition.md` |

## Problem statement

The entire economic model rests on this one flow. Practitioners subscribe; their patients arrive
**through them**, by QR code or invitation, at near-zero acquisition cost. That is the argument
that makes REMI replicable city by city, and it is the third of the five arguments the report
prepares for the Startup Boost jury.

If this flow is slow, confusing, or breaks in a consultation room, the acquisition channel does not
work — and no amount of product quality downstream compensates.

## Required steps

1. Generate a QR code and an invite link per practitioner, usable in a consultation room, printable
   for a waiting room.
2. Scanning it takes a patient into onboarding (REMI-018) already bound to that practitioner, with
   no code to type.
3. Make the binding survive the whole flow — including the patient who scans, leaves, and comes back
   later on a different device.
4. Handle the failure modes deliberately: an expired or revoked link, a patient who already has an
   account, a patient invited by a second practitioner.
5. Show the practitioner who has joined, so recruitment is visible to them.

## Open questions — flag these on pickup

- **Do invite links expire?** A permanent printable QR is far more useful and much harder to
  revoke. This is a security-versus-utility call the owner should make.
- **What if a patient already has an account?** Adding a second practitioner, transferring, or
  refusing — all defensible, and REMI-014's model has to agree with whichever is chosen.
- **Is there a patient-side approval step?** Being bound to a practitioner grants them access to
  health data; consent for that is not the same as consent to use REMI.
- **Does the QR carry anything identifying?** A code that names the practice on a printed sheet in a
  waiting room is a small but real disclosure.

## Acceptance criteria

- [ ] A practitioner can produce a QR code and an invite link.
- [ ] Scanning leads into onboarding already bound to that practitioner, with nothing to type.
- [ ] The binding survives interruption and a device change.
- [ ] Expired links, existing accounts and second invitations all behave deliberately, not accidentally.
- [ ] The patient consents to the practitioner's access explicitly.

## Agent prompt

```text
Work in the remi-ai monorepo. Read CLAUDE.md and CONVENTIONS.md, then .icm/docs/braindump/
marketing-growth/acquisition.md and business/model-economic.md — this flow is the business model,
not a feature.

Task: build QR and invite-link patient onboarding.
1. Per-practitioner QR code and invite link, usable in a consultation room and printable.
2. Scanning enters REMI-018's onboarding already bound to that practitioner, with no code to type.
3. The binding must survive interruption, a return visit, and a device change.
4. Handle expired/revoked links, existing accounts, and a second practitioner's invitation
   deliberately.
5. Capture explicit patient consent for the practitioner's access to their health data — that is
   separate from consenting to use REMI.
Do not run build/lint/typecheck/format locally. Push a branch, open a PR, git mv this ticket into
.icm/intake/_done/, and put the link-expiry and existing-account questions to the owner.
```
