# Spec: Patient profile edit — the patient owns their food preferences, and « temps disponible » exists

- slug: patient-profile-edit
- personas: patient, practitioner
- touches: apps/web/app/[locale]/p/[token], apps/web/lib/patient-link, apps/web/lib/content, apps/admin/components/patients, packages/services/src/db, packages/services/src/shared, packages/services/src/ai, .icm/docs/RETENTION.md
- complexity: standard

## Problem

Brainstorm § A marks dietary regime, allergies, intolerances, likes / dislikes, likes-cooking and
budget as **patient-supplied**, and Morgane's feedback § 7 asks for « temps disponible » alongside
them. Today every one of those fields is writable only by Morgane, from the console, and « temps
disponible » does not exist at all. That blocks the objective this epic serves — _the patient loop
working end to end for one real patient_ — on two sides: a generation prompt that claims to be
« 100 % personnalisé » reads a profile only a practitioner can keep true, and the patient has no
way to correct an allergy or say they have no time to cook this month. `link-writes` (#98) made
the token read + write (D-2); this is the segment that uses it for the profile.

## Proposed change

A « Mon profil » segment on the patient link, plus the one field the profile is missing.

**What the patient edits**, saved through the `link-writes` path, attributed `written_by: patient`,
audited and rate-limited exactly as the meal journal and the check-ins are:

- dietary regime (`dietary_regime`)
- allergies (`allergies`) — **full edit: the patient may add and remove**
- intolerances (`intolerances`)
- foods liked / disliked (`preferences`)
- likes cooking (`likes_cooking`) — the existing three-level enum, unchanged
- **time available to cook (`cooking_time`) — new**: three levels, French labels
  « Pressé(e) / Normal / Tranquille »
- budget (`food_budget`) — becomes a three-level enum, French labels
  « Économique / Standard / Confort »

**What the patient does not edit.** Identity, measures, medications, supplements, referral,
consent and anamnesis stay the practitioner's record. `.icm/docs/RETENTION.md` § _What is held
about a patient_ decides which of them the patient may still see: real name, age, height and
weight are shown read-only on the segment; birth date, referral, anamnesis and consent are
withheld. Medications and supplements reach the link today and stay read-only on it.

**The two new vocabularies** follow the pattern `likes_cooking` already set: stable English keys in
`packages/services/src/shared/patient.ts`, French wording in
`apps/admin/components/patients/vocabulary.ts` and the patient link's own content files
(`apps/web/lib/content/{fr,en}.ts`). `likes_cooking` needs no normalisation — it is already
`["yes","somewhat","no"]`, validated and rendered as a Select. `food_budget` is free text today
and becomes an enum; the migration **blanks every existing value** (the column's "not asked yet"
state) rather than guessing a mapping, and Morgane re-picks the handful she holds. The console's
budget `Input` becomes a `Select` and its « Texte libre » hint goes.

**In the console.** The profile read summary (`apps/admin/components/patients/profile-summary.tsx`,
shipped by `practitioner-workflow/secondary-sections`) carries one line for the segment —
« Profil modifié par la patiente le … » — driven by a single new timestamp set whenever a patient
write to the profile is accepted. Not per field: one column, one line, the audit trail holds the
detail.

**Availability.** Unlike the other five segments, « Mon profil » is always present in the link
navigation. The § J rule — a segment appears only when the record holds something for it — would
hide the very page whose job is to be filled in.

## Acceptance criteria

- [ ] A « Mon profil » segment exists at `/p/[token]/profil`, always present in the link navigation, where the patient edits dietary regime, allergies, intolerances, foods liked / disliked, likes cooking, time available to cook and budget
- [ ] Every save goes through the `link-writes` path: the write is attributed to the token's patient, recorded in `audit_events` with `actor_kind: patient`, counted against the per-link rate limits, and refused with the same message as the other segments when a limit or a length cap is hit
- [ ] A patient can both add and remove an allergy, and each change is in the audit trail
- [ ] `cooking_time` exists as a new three-level column (`low` / `medium` / `high`), with a migration, editable by the patient on the link and by Morgane on the admin profile form, and read by the context assembler in `packages/services/src/ai/context.ts`
- [ ] `food_budget` is a three-level enum (`economical` / `standard` / `comfort`) read by the same assembler; the migration blanks every existing free-text value and the admin form offers the three choices as a Select
- [ ] The French labels read « Pressé(e) / Normal / Tranquille » for time and « Économique / Standard / Confort » for budget, defined once in the label vocabularies and used in both the console and the link
- [ ] Real name, age, height, weight, medications and supplements are shown read-only on the segment; birth date, referral, anamnesis and consent do not appear on it at all
- [ ] The console's profile read summary shows one « Profil modifié par la patiente le … » line when the patient has written to their profile, and nothing when they have not
- [ ] `.icm/docs/RETENTION.md` names the profile fields the patient can now write, and `cooking_time` in the table of what is held

## Out of scope

- The 500-line admin profile form beyond the two field changes it needs (`cooking_time` added, `food_budget` turned into a Select)
- Any model call — the vocabularies are written so `ai-assist` reads them later (D-3, D-8)
- Per-field attribution in the console; one line for the whole segment is the decision
- Mapping old free-text `food_budget` values onto the new enum — they are blanked and re-picked
- Patient accounts, or any identity beyond the token (D-2, `beyond-december`)
- An exact preparation time in minutes — brainstorm § 7 rules it out; the three-level field is not that

## Open questions

- none
