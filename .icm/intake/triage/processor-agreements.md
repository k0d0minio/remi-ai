# Stub: REMI AI has a signed data processing agreement with each sub-processor

- lane: chore
- found-by: triage/care-consent-v2, Jamie's answer of 2026-11-12 · 2026-11-12
- complexity: low
- priority: P0

## Problem

REMI AI has no signed data processing agreement (DPA, article 28 GDPR) with Vercel, Neon or Resend. These three hold or send patient data. The draft `care` version 2 says that transfers to the United States rest on the EU–US Data Privacy Framework or on the standard contractual clauses. Those terms come from each vendor's DPA. Morgane pastes « Copier le contexte » into Claude on a Pro plan. A Pro plan comes under Anthropic's consumer terms and has no DPA.

## Proposed change

Accept or sign the DPA of Vercel, Neon and Resend for the accounts that REMI AI uses. Keep a copy outside the repo. Decide with the lawyer how Morgane uses Claude: a plan with a DPA (Team or Enterprise), or the Pro plan with model training switched off.

## Acceptance criteria

- [ ] A signed or accepted DPA exists for Vercel (team `remi21`), Neon (organization Remi AI) and Resend
- [ ] Each DPA names the transfer mechanism that `care` version 2 states
- [ ] The lawyer records a decision on Morgane's Claude plan
- [ ] `care` version 2 ships only after the three DPAs exist
