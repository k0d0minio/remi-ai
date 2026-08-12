# REMI-026 · GDPR groundwork: DPAs, retention, pseudonymisation

|                |                                                                       |
| -------------- | --------------------------------------------------------------------- |
| Status         | ready                                                                 |
| **Type**       | owner (agent = decision-support only)                                 |
| **Priority**   | P0 — precondition for the first stored real record                    |
| **Size**       | A few days of owner time; agent support in parallel with REMI-018–023 |
| **Depends on** | Runs in parallel with the data-model and infrastructure tickets       |
| **Blocked by** | Owner + counsel (REQ-22, REQ-24, REQ-25); D-5                         |
| **Sources**    | audit F-34, D-5, checklist item 10; v1-report §7; info-gathering §E   |

## Problem statement

The product handles special-category health data — including genetic data (ApoE/DIO2/AMY1A
genotypes are already in the data model), the most sensitive GDPR category — and the concrete
legal obligations are all still open: no signed processor agreements (Vercel, Anthropic,
Neon/Supabase, Resend, LlamaParse…), no processor register, no retention schedule, no
deletion/anonymisation capability, and the pseudonymise-before-AI decision (D-5, leaning yes)
unmade. The repo's own quarter objective says "the data question answered before the first
record exists". v1's privacy policy already made promises (Art. 9 consent, 30-day deletion,
retention limits) that bind whatever gets built — and one of its clauses ("amélioration des
modèles d'IA" as a purpose) needs counsel's second look.

## Required steps

1. **Owner + counsel:** sign DPAs with every processor that will touch data; build the processor
   register; set the retention schedule; make the D-5 pseudonymisation decision; re-validate the
   CGV/privacy policy (REQ-21) including the AI-improvement clause.
2. **Agent (decision-support):** draft the processor register from the actual planned stack;
   draft a retention schedule proposal from v1 §7's existing promises; write the D-5 options
   brief (mapping-layer cost vs GDPR surface).
3. **Agent (engineering that follows):** ensure the REMI-018 entities support the obligations —
   deletion/anonymisation capability, consent versioning, retention-driven cleanup hooks; if D-5
   lands yes, the pseudonymisation mapping layer becomes a scoped feature before the first AI
   call on real data (with REMI-034).

## Acceptance criteria

- [ ] Signed DPAs exist for every processor before it processes; register drafted and owner-held.
- [ ] A retention schedule exists and the data model can enforce it.
- [ ] D-5 is decided; if yes, the pseudonymisation layer is scoped as a ticket.
- [ ] The legal pages' promises and the system's capabilities agree (deletion within 30 days is
      technically possible, etc.).

## Agent prompt

```text
Work in the remi-ai monorepo. Read CLAUDE.md and CONVENTIONS.md, then .icm/docs/audit-report.md
finding F-34 and decision D-5, .icm/docs/v1-report.md §7 (the promises already made) and §8.10,
and .icm/docs/info-gathering.md section E.

Task: prepare the GDPR groundwork as decision-support — you must not make legal decisions.
1. Draft docs/gdpr/processor-register.md: every processor in the planned stack (Vercel, the
   chosen database vendor, Anthropic, Resend, LlamaParse if it survives D-v1-3, the error
   tracker), what data reaches each, region, DPA status column left for the owner.
2. Draft docs/gdpr/retention-schedule.md seeded from the v1 privacy policy's existing
   commitments (interactions ≤24 months, billing 7-10 years, deletion within 30 days of account
   closure) per entity in packages/services/src/db/models/ — a table of entity → basis →
   retention → deletion mechanism, with open cells marked for counsel.
3. Write the D-5 brief (docs/gdpr/pseudonymisation-decision.md): what a pseudonymisation mapping
   layer costs (engineering, prompt quality) vs buys (GDPR surface with US-owned processors),
   with the audit's recommendation (yes) and what saying yes requires of REMI-020's
   GenerationContext design.
4. Audit the current models against the obligations: can every personal-data entity be deleted
   or anonymised on request? Is consent versioned? File gaps as concrete follow-up notes in the
   PR, referencing the model files.
Everything you produce is decision-support needing owner/counsel sign-off — say so in each
document's header. Push a feature branch and open a PR.
```
