# REMI-015 · Data-protection groundwork before the first real health record

> **Urgency note (2026-08-27):** the first real records are no longer hypothetical —
> Morgane started with her first patient on 26 Aug, and REMI-035 puts real patient
> profiles into the platform from Friday 29 Aug. The groundwork here (processor
> register, retention, deletion, pseudonymisation posture) should land with or
> immediately behind REMI-035, not after Phase B.

|                |                                                                                        |
| -------------- | -------------------------------------------------------------------------------------- |
| Status         | blocked — owner and legal work, prepared here                                          |
| **Type**       | decision-support + chore                                                               |
| **Priority**   | P0 — Phase B; it must be in place _before_ the first real record exists                |
| **Size**       | A few days of owner time; a day of preparation                                         |
| **Depends on** | REMI-014 (the model has to be able to express retention and deletion)                  |
| **Blocked by** | Owner and counsel — the agent prepares, it does not sign                               |
| **Sources**    | Status report Phase B bullet 3 · audit F-34, D-5 · `.icm/docs/history/v1-report.md` §7 |

## Problem statement

REMI handles health data. The braindump's own sovereignty posture — EU hosting, EU processing —
is also the strongest available answer to Startup Boost's first criterion, and the report is blunt
that it is "a posture we can commit to, not a fact we can show". The audit found no processor
register, no signed DPA, no retention schedule and no deletion capability anywhere (F-34, F-16).

This is non-negotiable and it is cheap **now**. It gets expensive the moment a real patient record
exists, because then every gap is a live obligation rather than a plan.

## Required steps

1. **Processor register.** One row per processor — Vercel, Supabase, the AI provider, Resend, and
   anything the v1 estate keeps (REMI-011) — with what it processes, where, and whether a DPA is
   signed. The product's own published commitment is that processors are named before they process.
2. **EU hosting, stated and verified.** Database region, function regions, storage region, and the
   AI provider's processing location. Verify rather than assume; record where each is set.
3. **Retention schedule.** How long each category is kept and what happens at the end of it.
   v1's own privacy policy already promised specifics (deletion within 30 days, interaction
   retention limits) — those promises were made to real people and are the floor, not a draft.
4. **Deletion and export capability**, actually implemented against REMI-014's model. A promise
   with no code behind it is the failure mode here.
5. **Consent.** Explicit health-data-processing consent, captured with its timestamp, separate from
   terms acceptance. v1 did this correctly and it is worth keeping.
6. Prepare the DPIA question for counsel: does this processing need one?

## Open questions — flag these on pickup

- **Is personal data pseudonymised before it reaches the AI provider?** Audit D-5, still open. It
  costs a mapping layer and some prompt quality, and buys a materially smaller GDPR surface.
- **Which AI provider, and where does it process?** Unchosen (REMI-012). An EU provider makes both
  this ticket and the Startup Boost sovereignty argument substantially easier.
- **Who is the counsel and the accountant?** Several items here are decision-support the agent must
  not answer alone.
- **Do the v1 CGV and privacy policy have legal validation?** Both are stamped "awaiting legal
  validation", dated 27.11.2025, and they are what was promised to the FunMedDev test patients.
- **Is there already a register, retention schedule or DPIA from the v1 era?** If so it is a
  starting point, not a blank page.

## Acceptance criteria

- [ ] A processor register exists in the repo, with DPA status per processor.
- [ ] EU hosting is verified and recorded per service, not assumed.
- [ ] A retention schedule exists, consistent with what v1's policy already promised.
- [ ] Deletion and export work in code, not only on paper.
- [ ] Health-data consent is captured explicitly and separately, with a timestamp.
- [ ] The pseudonymisation question is decided and recorded before any real data reaches an AI provider.

## Agent prompt

```text
Work in the remi-ai monorepo. Read .icm/docs/history/audit-report.md finding F-34 and decision D-5,
.icm/docs/history/v1-report.md section 7 (v1's legal documents and the promises in them), and
Phase B of .icm/docs/remi-status-report.html.

Task: prepare the data-protection groundwork so it is in place before the first real health record.
1. Build the processor register in .icm/docs/ — one row per processor, what it processes, where,
   DPA signed yes/no.
2. Record where EU hosting is actually configured for each service, and flag anything you could
   not verify rather than assuming it.
3. Draft the retention schedule against v1's own published promises, which are the floor.
4. Implement deletion and export against the REMI-014 model. A promise with no code behind it is
   the failure this ticket exists to prevent.
5. Implement explicit, timestamped health-data consent, separate from terms acceptance.
Everything you produce on legal matters is decision-support and needs counsel's sign-off before it
binds anything — say so plainly in the PR. Do not run build/lint/typecheck/format locally. Push a
branch, open a PR, and put the open questions above to the owner rather than answering them.
```
