> Dropped: parked practitioner phase — the 2026-08-27 direction of record says the practitioner space will be specified from Morgane's terrain experience, so this braindump-era spec would be re-cut rather than picked up as written. 2026-08-27 estate ticket audit.

# REMI-025 · Adjust recommendations remotely and regenerate the patient's guidance

> **Deferred (2026-08-27):** practitioner-phase / later-phase work. Per `.icm/docs/new-development-direction.docx`, the patient experience is built and validated first (FunMedDev test 1 Dec, open day 19 Dec); the practitioner space, parser, subscriptions and practitioner beta come after, informed by Morgane's own terrain experience with 10-15 patients. Was higher priority under the retired Phase A-F plan.

|                |                                                                                   |
| -------------- | --------------------------------------------------------------------------------- |
| Status         | ready once REMI-024 lands                                                         |
| **Type**       | feature                                                                           |
| **Priority**   | P2 — parked until the patient experience is validated (new development direction) |
| **Size**       | A week                                                                            |
| **Depends on** | REMI-014, REMI-019, REMI-024                                                      |
| **Blocked by** | —                                                                                 |
| **Sources**    | Status report Phase D bullet 3 · `.icm/docs/braindump/roadmap/features.md`        |

## Problem statement

Seeing that a patient is struggling is only half of it. The braindump asks that the practitioner be
able to _ajuster les recommandations, modifier les règles, et regénérer le plan d'accompagnement à
distance_ — without waiting for the next consultation.

That is the loop REMI exists to close: the practitioner recommends, REMI executes daily, the
practitioner sees what happened, adjusts, and REMI executes the adjusted version. Everything else
in Phase D is visibility; this is the intervention.

## Required steps

1. Let a practitioner edit a patient's recommendations and the structured rules derived from them.
2. Regenerate the patient's guidance from the changed rules, so the next micro-action reflects the
   adjustment rather than the old protocol.
3. Show the patient what changed and — consistent with the whole product — _why_.
4. Keep a history. Who changed what and when is both clinically useful and part of REMI-014's audit
   trail.
5. Do not let an edit silently invalidate something the patient has already been asked to do
   today; decide and implement the transition explicitly.

## Open questions — flag these on pickup

- **What exactly can a practitioner edit?** The recommendation in their own words, the structured
  rules, or both? If both, which wins when they disagree — and what does the parser (REMI-029) do
  with a hand-edited rule on its next run?
- **When does regeneration take effect?** Immediately, tomorrow, or on the patient's next
  interaction. Changing today's action mid-day may be exactly wrong.
- **Is the patient notified?** A silent change to someone's health guidance is not obviously
  acceptable.
- **Can a practitioner adjust for several patients at once?** Protocol-level changes are a natural
  ask and a large scope increase.

## Acceptance criteria

- [ ] A practitioner can change a patient's recommendations and rules remotely.
- [ ] The patient's guidance regenerates from the change; no stale rule keeps driving output.
- [ ] The patient can see what changed and why.
- [ ] Every change is recorded with author and timestamp.

## Agent prompt

```text
Work in the remi-ai monorepo. Read CLAUDE.md and CONVENTIONS.md, then .icm/docs/braindump/
roadmap/features.md ("Modification des recommandations"), then the REMI-014 model.

Task: let practitioners adjust recommendations remotely and regenerate the patient's guidance.
1. Editing for recommendations and the structured rules derived from them.
2. Regeneration that actually takes effect on the patient's next guidance — no stale rules.
3. Show the patient what changed and why.
4. Record every change with author and timestamp into the audit trail.
5. Handle in-flight actions explicitly: decide what happens to a micro-action the patient was
   already given today, and implement that decision rather than letting it fall out of the code.
Do not run build/lint/typecheck/format locally. Push a branch, open a PR, git mv this ticket into
.icm/intake/_done/, and settle the recommendation-versus-rule editing question with the owner
before building both — it also determines what REMI-029's parser may overwrite.
```
