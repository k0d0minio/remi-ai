# REMI-011 · Settle the v1 estate — old data first, then the accounts

|                |                                                                                    |
| -------------- | ------------------------------------------------------------------------------------ |
| Status         | blocked — needs access to the v1 Supabase project                                  |
| **Type**       | chore + data protection                                                            |
| **Priority**   | P0 — if real patient health data is sitting in an abandoned project, that is a live obligation |
| **Size**       | A day, once access exists                                                          |
| **Depends on** | —                                                                                  |
| **Blocked by** | Access to the v1 Supabase project (and ideally Lovable)                            |
| **Sources**    | Status report Phase A bullet 5 and Q3 · `.icm/docs/history/v1-report.md` §5.3, §9, §11 |

## Problem statement

v1 ran on Supabase (its whole backend), OpenRouter (AI calls), LlamaParse (PDF→markdown), Brevo
(email), Lovable (the build platform), and a private Python meal-plan API that did the actual
generation and "Guardian Agent" validation. The code folder was deleted; the accounts were not.

Two things ride on this. The **urgent** one: the MVP was tested with real patients from the
FunMedDev clinic. If the v1 Supabase project still holds their health data — special-category
personal data under GDPR — that is an obligation that exists today, independent of anything being
built. The **ordinary** one: each of those accounts is potentially a card being charged monthly for
a product that no longer runs.

## Required steps

1. **Data first.** With read access to the v1 Supabase project, establish whether it holds real
   people's records: user accounts, patient profiles, uploaded medical PDFs, questionnaire
   responses, generated plans. Count them; do not sample and assume.
2. If real data exists, stop and produce a migrate-or-erase recommendation with the GDPR reasoning
   and the promises v1's own privacy policy made (`.icm/docs/history/v1-report.md` §7). The owner
   decides; the agent does not delete personal data.
3. **The Python meal-plan API.** Establish whether it still exists, who owns it, whether it is
   running, and whether its source is preserved anywhere. V2 does not need its weekly-plan
   generation, but an unowned running service is still a liability. **Do not let anything
   Python-side be deleted or lapse before this is answered.**
4. Inventory the remaining v1 vendor accounts — OpenRouter, LlamaParse, Brevo, Lovable — with
   holder and billing status, and feed each row into the tool register (REMI-012).
5. Recommend keep / close / transfer per account. Note that LlamaParse-style PDF extraction is
   directly relevant again for the parser (REMI-029) — do not reflexively close it.

## Open questions — flag these on pickup

- **Does the v1 Supabase project hold real patient data?** The single highest-stakes unknown in the
  project. Everything else in this ticket is bookkeeping by comparison.
- **Who owns the Python meal-plan API, and is its code preserved?** The v1 report reconstructs its
  *interface* from the calling contract, not its *logic*.
- **Was a DPA ever signed with any of these processors?** No repo evidence either way.
- **Is the v1 CGV / privacy policy legally validated?** Both are stamped "awaiting legal
  validation", dated 27.11.2025, and they are what was promised to the people whose data this is.

## Acceptance criteria

- [ ] A definite yes/no on real personal data in the v1 Supabase project, with counts.
- [ ] If yes: a migrate-or-erase recommendation exists and the owner has been asked to decide.
- [ ] The Python API's existence, owner, running state and source-preservation status are recorded.
- [ ] Every v1 vendor account has a holder, a billing status and a keep/close/transfer recommendation.
- [ ] Nothing has been deleted by the agent.

## Agent prompt

```text
Work in the remi-ai monorepo. Read .icm/docs/history/v1-report.md — sections 5.3, 7, 9 and 11 in
full — and Phase A and Q3 of .icm/docs/remi-status-report.html.

Task: settle what is left of the v1 estate, data before accounts.
1. If you have read access to the v1 Supabase project, determine whether it holds real people's
   records — accounts, patient profiles, uploaded medical PDFs, questionnaire responses, plans —
   and count them. If you do not have access, say so and ask for it; do not guess.
2. If real data exists, write a migrate-or-erase recommendation grounded in GDPR and in v1's own
   privacy policy, and put the decision to the owner. NEVER delete personal data yourself.
3. Establish the status of the private Python meal-plan API: exists, owner, running, source
   preserved. Say plainly that nothing Python-side should be deleted or allowed to lapse until
   this is answered.
4. Inventory OpenRouter, LlamaParse, Brevo and Lovable — holder, billing status, recommendation —
   and add each to the tool register from REMI-012. Note that LlamaParse-style PDF extraction is
   relevant again for the recommendation parser.
Close no account and delete nothing. Push a branch, open a PR with the findings written into this
ticket, and git mv it into .icm/intake/_done/ only once the data question has a definite answer.
```
