# REMI-037 · Point remi.be at the estate — GoDaddy DNS, no domain transfer

|                |                                                                                                 |
| -------------- | ----------------------------------------------------------------------------------------------- |
| Status         | blocked — needs the GoDaddy access Morgane is sending                                           |
| **Type**       | chore                                                                                           |
| **Priority**   | P1                                                                                              |
| **Size**       | An hour or two, plus propagation                                                                |
| **Depends on** | REMI-009 (which apps survive decides what gets a hostname)                                      |
| **Blocked by** | GoDaddy access (Morgane confirmed she will send the access list: GoDaddy, DigitalOcean, emails) |
| **Sources**    | `.icm/docs/call-summary.pdf` [33:04–34:22]                                                      |

## Problem statement

On the 25 Aug call Jamie asked for **GoDaddy access to configure remi.be's DNS
without transferring the domain**. Arnaud uses `info@remi.be` (his own address no
longer works), so **MX records are live and must not break**. The task: point the
surviving apps (per REMI-009: product, marketing, docs) at their Vercel deployments
from remi.be hostnames, touching only the records that need touching.

## Required steps

1. Inventory current DNS (A/CNAME/MX/TXT) and record it in `.icm/docs/ENV.md`-adjacent
   notes **before** changing anything — the rollback is the old values.
2. Add the Vercel-pointing records for the chosen hostnames (e.g. `www`/apex →
   marketing, `app` → product, `docs` → docs); verify each in Vercel.
3. **Leave MX and mail-related TXT untouched**; confirm `info@remi.be` still receives
   after propagation.
4. Access arrives as an invitation, never a password by email; credentials are never
   committed.

## Prompt

Read `.icm/intake/REMI-037-remi-be-dns.md` at the repo root. Configure remi.be DNS in
GoDaddy per the required steps — record current values first, add the Vercel records
for the surviving apps, never touch MX, verify mail still flows. DNS changes are
human-confirmed steps: prepare the exact record list and walk Jamie through applying
it if access is his alone. Document the final records in the repo. Open a PR on a
`claude/` branch for any repo changes. Do not run local checks — CI is the source of
truth.
