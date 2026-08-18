# REMI-012 · Build the tool and cost register

|                |                                                                       |
| -------------- | --------------------------------------------------------------------- |
| Status         | blocked — needs answers on three unidentified tools                   |
| **Type**       | chore                                                                 |
| **Priority**   | P1 — Phase A; Morgane asked for "une vision claire des coûts"         |
| **Size**       | Half a day, once the answers arrive                                   |
| **Depends on** | REMI-011 (feeds the v1 vendor rows)                                   |
| **Blocked by** | What DigitalOcean, Mistral and Euria are, and who owns them           |
| **Sources**    | Status report Q3 · `.icm/docs/correspondence/02-onenote-and-tools.md` |

## Problem statement

Morgane asked for a clear view of the stack and its costs. Reading the codebase and the braindump
gives a partial answer and one surprise: three of the four tools she named — **DigitalOcean**,
**Mistral**, **Euria** — appear in neither. They may be v1 leftovers still billing, plans not yet
acted on, or something nobody has written down.

What the new codebase actually uses today: Vercel (hosting), GitHub (code and review protections),
Resend (email — the contact form works through it). Supabase is named by the braindump but not yet
connected. No AI provider is connected. No payment provider is chosen.

The deliverable is deliberately boring and permanent: one register — tool, account holder, purpose,
still billing, €/month — that makes the cost picture exist once rather than being re-derived every
time someone asks.

## Required steps

1. Create the register in the repo (a markdown table under `.icm/docs/`) with a row per tool:
   name, what it does for REMI, account holder, current status (live / to connect / to choose /
   legacy), still billing, €/month, and a keep/close/transfer recommendation.
2. Fill in everything derivable from the repo. Leave a blank rather than a guess for anything that
   needs an invoice or an account login.
3. Ask the owner directly about DigitalOcean, Mistral and Euria: what each is, who owns it, and
   whether it is billing.
4. Fold in the v1 vendor rows from REMI-011 once that ticket has them.
5. Do not write cost figures that cannot be verified from an invoice or an account page.

## Open questions — flag these on pickup

- **DigitalOcean** — is something still running and billing there from v1? Whose account?
- **Mistral** — in use, or a plan? As a European provider it would materially strengthen the
  sovereignty argument for Startup Boost, so the answer matters beyond bookkeeping.
- **Euria** — unidentified. What is it, what is it for, are we paying for it?
- **Which AI provider does V2 use?** Unchosen. It gates REMI-019 and REMI-029, and the sovereignty
  story pulls toward an EU provider.

## Acceptance criteria

- [ ] A register exists in the repo with one row per tool and no invented figures.
- [ ] Every unknown is visibly a blank with a named question attached, not a plausible guess.
- [ ] The three unidentified tools are put to the owner explicitly.
- [ ] The register is linked from `.icm/docs/README.md`.

## Agent prompt

```text
Work in the remi-ai monorepo. Read .icm/docs/correspondence/02-onenote-and-tools.md and Q3 of
.icm/docs/remi-status-report.html.

Task: build the tool and cost register.
1. Create .icm/docs/tool-register.md — columns: tool, what it does for REMI, account holder,
   status (live / to connect / to choose / legacy), still billing, EUR/month, recommendation.
2. Fill in what the repository proves: Vercel, GitHub, Resend are live; Supabase is named by the
   braindump but unconnected; no AI provider; no payment provider. Check .icm/docs/ENV.md for
   reserved-but-unwired variables and mark them as such.
3. Leave a blank wherever a figure needs an invoice or an account login. Do not estimate costs.
4. Ask the owner what DigitalOcean, Mistral and Euria are, who owns them, and whether they bill.
5. Link the register from .icm/docs/README.md.
Do not run build/lint/typecheck/format locally. Push a branch, open a PR, and git mv this ticket
into .icm/intake/_done/ once the register exists — the blanks it carries are the point, not a
reason to hold it back.
```
