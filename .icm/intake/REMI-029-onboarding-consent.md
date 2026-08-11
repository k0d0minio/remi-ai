# REMI-029 · Onboarding funnel with real consent capture

|                |                                                                                                                                           |
| -------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| **Type**       | feature                                                                                                                                   |
| **Priority**   | P1 — first user-facing port                                                                                                               |
| **Size**       | A week                                                                                                                                    |
| **Depends on** | REMI-022 (db), REMI-023 (auth), REMI-027 (scoring engine), REMI-018 (consent entity)                                                      |
| **Blocked by** | Owner decision D-v1-2 / REQ-30 (patient vs practitioner audience — shapes who onboards); REQ-21 (validated consent texts to consent _to_) |
| **Sources**    | v1-report §2 steps 1–3, §3 (`/onboarding`, `/psychological-profile-result`, `/questionnaires`), §8.10, §8.11; audit F-16                  |

## Problem statement

v1's proven journey opens with consent → 20-question psychological onboarding → immediate profile
result → biological intake + account creation. Two of its defects must be fixed by construction:
consent lived in localStorage (it must be a database record — GDPR Art. 9-style explicit consent
for health data, captured with the version of the text consented to), and with email confirmation
enabled the signup flow silently lost the profile and questionnaire (the data-loss path must be
impossible, not unlikely). The audience decision (D-v1-2) determines whether this funnel onboards
patients directly, or persons invited by a practitioner through a CareRelationship.

## Required steps

1. Scope against the D-v1-2 answer: who reaches this funnel and how (open signup vs invitation).
2. Consent step: CGV/privacy acceptance + separate explicit health-data-processing consent,
   persisted as ConsentRecords (REMI-018) with text version and timestamp — before any health
   data is collected. Pre-account answers survive via a server-side draft or are captured
   post-auth; no localStorage as a data layer.
3. Psychological onboarding: 20 Likert questions, one 4-question dimension per screen, per-screen
   validation, progress, resumable. Scoring via REMI-027's engine; immediate profile result
   screen that survives refresh (v1's router-state loss is the anti-pattern).
4. Biological intake: identity, DOB (18+ validation), weight/height, diet type, EU-14 allergens,
   intolerances (exclusive "none", conditional free-text), cooking appetite, budget, goal —
   against REMI-030's structured model, then account linkage via REMI-023's auth.
5. Make the write path transactional: account + profile + questionnaire + consent commit
   together or the user is cleanly returned — v1 §8.11 must be impossible.
6. FR/EN parity throughout; design system components; accessible forms.

## Acceptance criteria

- [ ] Consent exists as queryable records with text-version and timestamp before any health data.
- [ ] A user can complete the full funnel and land signed-in with profile + questionnaire +
      computed psychological profile persisted.
- [ ] Interrupting the flow at any step loses nothing silently.
- [ ] 18+ and field validations enforced server-side, not just in the form.

## Agent prompt

```text
Work in the remi-ai monorepo. This is a product feature: enter it through the repo's delivery
pipeline (CLAUDE.md "How work gets done here" — /pipeline scope, then the stages), respecting its
human gates. Read CLAUDE.md, CONVENTIONS.md, then docs/v1-report.md §2 (steps 1-3), §3's rows for
/, /onboarding, /psychological-profile-result and /questionnaires, and §8.10/§8.11 (the two
defects this port must fix by construction). Confirm the D-v1-2 audience decision before scoping;
if unanswered, stop and ask.

Build the onboarding funnel in apps/web:
1. Consent-first: acceptance of the legal terms plus a SEPARATE explicit health-data-processing
   consent checkbox, persisted as ConsentRecords (packages/services models) carrying the consent
   text's version id and timestamp — server-side, never localStorage. No health question may be
   answered before consent exists.
2. Psychological onboarding: the 20-item questionnaire from the REMI-027 engine's content, one
   dimension (4 questions) per screen, per-screen validation, progress indication, resumable via
   a server-side draft keyed to the pre-account session. Result screen renders the computed
   profile (label + description) from the engine and survives a hard refresh.
3. Biological intake: the full field list of v1 §2 step 3 with its validation rules (DD/MM/YYYY
   DOB mask + server-side 18+ check, integer height, decimal weight, >=1 allergen and >=1
   intolerance selections with exclusive "none", conditional free-text for fish/other), writing
   to the structured profile model.
4. Completion: create/link the account through the session seam (magic-link auth), then commit
   profile + questionnaire + computed outcome + consent linkage transactionally through the db
   seam. Design the flow so a half-completed signup can always resume or cleanly restart —
   v1's silent data-loss path (§8.11) must be structurally impossible.
5. FR and EN content with parity (compiler-enforced), design-system components only, accessible
   labelled forms.
Add tests for all pure validation/flow logic. Run tests only; push, open a PR through the
pipeline's gates.
```
