# REMI-010 · Answer the Startup Boost eligibility gates and decide go / no-go

|                |                                                                                 |
| -------------- | ------------------------------------------------------------------------------- |
| Status         | blocked — needs two facts only the owner has                                    |
| **Type**       | decision-support                                                                |
| **Priority**   | P0 — the call closes 15 September; the dossier would consume September          |
| **Size**       | An hour once the two facts arrive                                               |
| **Depends on** | —                                                                               |
| **Blocked by** | The Walloon-seat answer and the incorporation date                              |
| **Sources**    | Status report Q1 and Part five · `.icm/docs/correspondence/01-startup-boost.md` |

## Problem statement

Startup Boost is a €100,000 convertible loan from Wallonie Entreprendre, themed AI & cybersecurity,
closing 15 September. The report scores REMI honestly: two strong criteria (sector-specific need
with operational value; scalability through a replicable practitioner-led model), one conditional
(sovereign AI — a posture we can commit to, not an achievement we can show), one weak (deeptech
with proprietary IP), and one to skip entirely (cybersecurity).

None of that matters until two eligibility facts are settled, and both are one line from the owner:

1. **Is the operating headquarters in the Walloon Region?** If the seat is in Brussels or Flanders,
   the application fails on eligibility regardless of the pitch.
2. **What is the incorporation date?** The company must be under three years old. It is almost
   certainly fine — the idea dates from July 2025 — but the register PDF is a scan and could not be
   machine-read.

## Required steps

1. Put both questions to the owner as questions, with the consequence of each answer stated.
2. Read the **full call regulation**, not the landing page. Thematic criteria and eligibility rules
   are usually separate documents, and eligibility is what disqualifies applicants.
3. If both gates pass: recommend go, and open the dossier ticket (REMI-033).
4. If either fails: recommend no-go in one paragraph, and say what would make REMI eligible for a
   future call.
5. Record the decision and its date in this ticket before retiring it.

## Open questions — flag these on pickup

- **The two gates above** — this ticket cannot advance without them.
- **Does an accountant exist, and are they available before 15 September?** The pitch deck must
  include financial projections, and those are not the agent's to invent.
- **Has anything already been submitted anywhere?** A previous grant application or deck that
  contradicts the new pitch is a real risk.

## Acceptance criteria

- [ ] Both eligibility gates are answered by the owner and the answers recorded here.
- [ ] The full call regulation has been read, not inferred from the landing page.
- [ ] A go / no-go recommendation exists with reasons, and the decision is recorded with its date.
- [ ] Nothing in any draft claims paying customers, signed pilots or revenue — there are none.

## Agent prompt

```text
Work in the remi-ai monorepo. Read .icm/docs/correspondence/01-startup-boost.md and Q1, Q2 and
Part five of .icm/docs/remi-status-report.html.

Task: get the Startup Boost application to a go / no-go.
1. Ask the owner the two eligibility questions — Walloon operating seat, and incorporation date —
   and state what each answer implies. Do not proceed past them by assuming.
2. Fetch and read the full call regulation from the Wallonie Entreprendre site, not just the
   landing page, and list the eligibility rules separately from the thematic criteria.
3. Recommend go or no-go in one paragraph with reasons, and record the decision and its date in
   this ticket.
Hard rule: REMI has no paying customers, no signed pilot and no revenue. Real user tests with
FunMedDev patients, validated practitioner interest, a planned founding-practitioner beta and
incubator support are the honest story. Never write more than that into anything that could reach
a public-funding jury.
Push a branch, open a PR, and git mv this ticket into .icm/intake/_done/ once the decision is
recorded.
```
