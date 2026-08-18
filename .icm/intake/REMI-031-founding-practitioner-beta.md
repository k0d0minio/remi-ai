# REMI-031 · Recruit and onboard the ~15 founding practitioners

|                |                                                                                                      |
| -------------- | ---------------------------------------------------------------------------------------------------- |
| Status         | ready once Phases C and D are usable                                                                 |
| **Type**       | chore + feature                                                                                      |
| **Priority**   | P0 — Phase F; validation is the point of the whole V2                                                |
| **Size**       | Ongoing                                                                                              |
| **Depends on** | REMI-027 (the onboarding mechanism), Phases C and D                                                  |
| **Blocked by** | A product a practitioner can actually be given                                                       |
| **Sources**    | Status report Phase F bullet 2 · `.icm/docs/braindump/developpement-produit/workflow.md`, `tests.md` |

## Problem statement

**~15 founding practitioners is a recruitment target, not a signed list.** Nobody has signed
anything. Earlier documents in this repository treated the number as a contract; it never was.

The braindump's pilot workflow is specific: select the practitioners, define duration, price and
conditions, onboard them, use it in real conditions, take feedback **every two weeks**, analyse the
blockages, adjust, and validate the key features. Priority №3 is validating real usage before
scaling — this is that validation, and it is the mechanism by which V2 gets built _with_
practitioners rather than at them.

## Required steps

1. Build the recruitment list from real contacts: practitioners already interviewed, the FunMedDev
   relationship, and the braindump's acquisition channels (LinkedIn, the health network).
2. Define what founding practitioners are being offered and asked for — duration, price or free
   period, expected commitment — before anyone is approached.
3. Onboard them through REMI-027's real mechanism, so recruitment tests the acquisition flow too.
4. Run the fortnightly feedback cycle as the braindump describes, with the outcome of each cycle
   written into intake tickets rather than left in notes.
5. Track blockages and abandonment honestly. The FunMedDev tests are valuable precisely because
   they recorded where people dropped off.

## Open questions — flag these on pickup

- **Who is on the list?** The braindump describes practitioner interviews but names no one in the
  repository. This is owner knowledge.
- **Free, discounted, or paid?** Asking for fortnightly feedback and full price at once is a hard
  sell. Interacts directly with REMI-030.
- **When is the product ready enough?** Giving practitioners something half-built costs credibility
  that is expensive to recover. Someone has to make that call deliberately.
- **What is being measured?** REMI-032's KPIs should be in place before the beta, not fitted
  afterwards.
- **Are their patients consented properly?** Real patients enter at this point, which makes
  REMI-015 a hard prerequisite rather than a parallel track.

## Acceptance criteria

- [ ] A named recruitment list exists.
- [ ] The founding-practitioner offer is written down before anyone is approached.
- [ ] Practitioners onboard through the real QR/invite mechanism.
- [ ] Fortnightly feedback runs, and each cycle produces intake tickets.
- [ ] Data protection is in place before the first real patient record exists.

## Agent prompt

```text
Work in the remi-ai monorepo. Read .icm/docs/braindump/developpement-produit/workflow.md
("Workflow pilote praticiens") and tests.md, then Phase F of .icm/docs/remi-status-report.html.

Task: prepare and run the founding-practitioner beta.
1. Draft the founding-practitioner offer: duration, price or free period, what they get, what they
   commit to. Get it agreed before anyone is approached.
2. Ask the owner for the recruitment list — the practitioners already interviewed, and the
   FunMedDev relationship. Do not invent names.
3. Onboard through REMI-027's real QR/invite flow, so recruitment exercises the acquisition path.
4. Set up the fortnightly feedback cycle and make each cycle's output land as intake tickets, not
   as notes.
5. Confirm REMI-015's data-protection groundwork is actually complete before the first real patient
   record exists. This is a hard gate, not a parallel track.
Remember and state plainly: ~15 is a recruitment target. Nobody has signed anything, and no
document should imply otherwise. Push a branch, open a PR with the offer draft and the plan, and
leave this ticket open for the duration of the beta.
```
