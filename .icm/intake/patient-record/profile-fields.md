# Stub: Profile fields — align the patient profile with brainstorm § A

- feature-slug: profile-fields
- sequence: 2 of 6
- depends-on: none
- priority: P1
- size: S
- sources: v2 brainstorm § A (PATIENT_PROFILE) · scope answers 2026-09-01
  (breakdown.md § Decisions)

## What this is

Morgane's § A lists the base data the future AI filters on. The current `patient_profiles` has
most of it, but four things are missing or merged, and the merges are the kind that hurt later:

- **Dietary regime** (végétarien, sans gluten, …) — a permanent filter for recommendations and
  recipes. Today it drowns inside the `constraints` blob.
- **Allergies and intolerances, split out of `constraints`.** § A separates them for a reason:
  allergies are safety (mandatory exclusions), intolerances are comfort. A future recipe filter
  must be able to treat them differently, and neither should need recovering from prose.
  `constraints` stays for what remains: medical constraints that are neither.
- **Likes cooking: yes/no** — drives how simple recipe suggestions must be.
- **Food budget** — keeps future suggestions realistic.

Existing free text is not lost and not auto-parsed: current `constraints` content stays where it
is, and Morgane redistributes it into the new fields as she next touches each patient (10–15
profiles — an afternoon, not a migration script).

The admin profile form gains the fields; the `/p/[token]` profile extract keeps working (it renders
`constraints`/`preferences` today — whether the new fields show there is the `patient-surface`
epic's call, not this stub's).

## Worth knowing

- Regime and budget want to be *light*: free text, or a short suggestion list at most. § 7 of the
  brainstorm forbids fine-grained fields nobody needs; an enum here would also freeze vocabulary
  that is still Morgane's to invent.
- Vocabulary constants (if any) live in `packages/services/src/shared/patient.ts`; models stay
  types-only; labels in `apps/admin/components/patients/vocabulary.ts`.
- Schema + migration via `pnpm db:generate`; profile writes audit via `lib/audit.ts` (the existing
  update action already does).

## Open questions — flag these on pickup

- Should `preferences` also split into liked / disliked foods (§ A has them as two rows), or is
  one prose field still right for how Morgane writes?
- Budget: free text, or coarse bands (serré / moyen / confortable)? Morgane's call.
- Likes cooking: strictly yes/no per § A, or yes/no/a-little?

## Prompt

Run `/pipeline new .icm/intake/patient-record/profile-fields.md` in the remi-ai repo and follow
the pipeline from there. Read the stub and its epic's `breakdown.md` first. Scope: add dietary
regime, allergies, intolerances, likes-cooking and food-budget to `patient_profiles` and the admin
profile form; narrow `constraints`' description to what remains; no data migration of existing
prose, no patient-link changes. Raise the stub's open questions rather than answering them.
