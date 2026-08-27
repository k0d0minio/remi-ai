# REMI-036 · Recipe generation — the first terrain-tested brick

|                |                                                                                                            |
| -------------- | ---------------------------------------------------------------------------------------------------------- |
| Status         | ready once REMI-035 lands                                                                                  |
| **Type**       | feature                                                                                                    |
| **Priority**   | P1 — the first REMI capability Morgane's real patients exercise                                            |
| **Size**       | A week, iterated against her feedback                                                                      |
| **Depends on** | REMI-035 (profiles + encoded recommendations exist)                                                        |
| **Blocked by** | The AI-provider choice — sovereign options under evaluation (Mistral et al.); prototype behind the AI seam |
| **Sources**    | `.icm/docs/new-development-direction.docx` §2 · `.icm/docs/call-summary.pdf`                               |

## Problem statement

The new direction's first co-tested capability: Morgane hands REMI a patient's
**profile + her protocol/recommendations + constraints and preferences**, REMI
generates **personalised recipes**, Morgane verifies them, and sends them to the
patient herself over WhatsApp. Human-in-the-loop by design — the point is to learn
what works in the personalisation logic before any patient-facing automation. The
same loop then extends to meal follow-up and feedback ("Terrain → Test → Feedback →
Développement → Nouveau test → Amélioration").

## Required steps

1. A generation surface next to the patient profile (REMI-035's admin): generate
   recipe suggestions from profile + encoded recommendations + constraints.
2. Through the `@remi/services` AI seam with per-generation cost recording from day
   one (REMI-022's discipline applies from the first call).
3. Morgane can edit/approve the output and copy it cleanly for WhatsApp; every
   generation + her verdict is kept — that record is the personalisation-logic
   learning data.
4. Iterate on her feedback; do not build patient-facing delivery yet.

## Open questions — flag these on pickup

- **Which AI provider?** Sovereign-leaning evaluation in progress (Mistral is the
  documented lean; Euria and others under review). Prototype behind the seam so the
  choice stays swappable; raise before committing spend.

## Prompt

Read `.icm/intake/REMI-036-recipe-generation-test-brick.md` at the repo root, then
`.icm/docs/new-development-direction.docx` §2. Build the recipe-generation brick per
the required steps — admin-side, human-verified, cost-tracked through the AI seam,
outputs copyable for WhatsApp. Flag the provider question in the PR rather than
deciding it. Open a PR on a `claude/` branch. Do not run local checks — CI is the
source of truth.
