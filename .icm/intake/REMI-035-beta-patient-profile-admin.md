# REMI-035 · Beta patient-profile admin for Morgane — before Friday 29 August

|                |                                                                                                                                         |
| -------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| Status         | ready                                                                                                                                   |
| **Type**       | feature                                                                                                                                 |
| **Priority**   | P0 — **promised for Friday 29 August** on the 25 Aug call; Morgane's first patient started 26 Aug                                       |
| **Size**       | Two days — cut scope, not the date                                                                                                      |
| **Depends on** | — (coordinate with REMI-013/014; a minimal persistence slice may land here first and be formalised there)                               |
| **Blocked by** | —                                                                                                                                       |
| **Sources**    | `.icm/docs/call-summary.pdf` [27:45–35:00] · `.icm/docs/new-development-direction.docx` §"Ce que doit permettre cette première version" |

## Problem statement

On the 25 Aug team call Jamie committed to giving Morgane, **before Friday 29 August**,
an administrative interface where she **creates and manages patient profiles herself,
with no practitioner space** — and can **encode each patient's recommendations /
protocol** into their profile. She began consultations with her first patient on
26 Aug and is working via WhatsApp; this interface is where those patients' profiles
accumulate history before the December launch. She will also send **patient links to
consultants** to test the interface and collect UX feedback.

This is the first brick of the new direction (patient experience first, practitioner
space parked). It is deliberately small: profile + encoded recommendations is enough;
recipes, meal feedback and the daily loop come after (REMI-036, -018, -019).

## Required steps

1. A signed-in admin surface (extend `apps/admin` or the simplest honest place) where
   Morgane can: create a patient profile (identity kept minimal — pseudonymise where
   possible, the AI-visibility question is still open), record the anamnesis-level
   profile fields she needs, and encode recommendations/protocol as structured text.
2. Real persistence — this cannot ship on fixtures. Stand up the minimal Supabase
   slice it needs (EU region), flag the region/plan choice on pickup, and coordinate
   with REMI-013/014 so the schema doesn't fight the fuller model.
3. Real authentication for Morgane (no role radio button); a shareable patient link
   view for consultant UX testing.
4. Keep it phone-usable — she works from consultations.

## Open questions — flag these on pickup

- **May the AI (later) see real first names?** Recommendation on file is pseudonymise;
  undecided. Store so either answer is cheap.
- Which app hosts this — `apps/admin` or `apps/web`? Flag the choice in the PR.

## Prompt

Read `.icm/intake/REMI-035-beta-patient-profile-admin.md` at the repo root, then
`.icm/docs/new-development-direction.docx` and the call summary — they are the
direction of record. Build the beta patient-profile admin per the required steps:
Morgane creates/manages patient profiles and encodes recommendations, no practitioner
space, real persistence and auth, phone-usable, shareable patient link. The deadline
is Friday 29 August — cut scope, not the date, and flag the open questions in the PR.
Open a PR on a `claude/` branch. Do not run local checks — CI is the source of truth.
