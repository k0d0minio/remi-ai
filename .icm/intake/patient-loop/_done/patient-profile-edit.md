# Stub: Patient profile edit — the patient owns their food preferences, and « temps disponible » exists

- feature-slug: patient-profile-edit
- scope: patient-loop
- personas: patient
- initiative: a patient experience validated on real terrain, in time for the December open day / objective: the patient loop working end to end for one real patient
- depends-on: link-writes
- sequence: 5 of 6
- priority: P1
- size: S
- sources: feedback § 7 ("Profil patient : allergies et intolérances, régime, temps disponible,
  aime cuisiner ou non, budget") · V2 explication (« Le patient complète son profil », « Page
  Profil – modifiable ») · brainstorm § A (patient-supplied fields) · `patient_profiles` ·
  `apps/admin/components/patients/patient-form.tsx`

## Problem

Brainstorm § A marks diet, allergies, intolerances, likes / dislikes, likes-cooking and budget as patient-supplied; today only Morgane can write them, from the console. For generation to be « 100 % personnalisé » the patient has to keep these true, and « temps disponible » does not exist yet.

## Proposed change

Brainstorm § A marks diet, allergies, intolerances, likes / dislikes, likes-cooking and budget as
**patient-supplied**; today only Morgane can write them, from the console. For generation to be
"100 % personnalisé" the patient has to be able to keep these true. This stub:

- **A « Mon profil » segment** on the link: dietary regime, allergies, intolerances, foods liked /
  disliked (`preferences`), likes cooking (oui / un peu / non), **time available to cook** (new:
  faible / moyen / important — the old version's three levels, her § 7's "temps disponible"),
  budget (économique / standard / confort). Editable by the patient, saved through `link-writes`,
  `written_by: patient`, audited.
- **Not editable by the patient**: identity, measures, medications, supplements, referral,
  consent, anamnesis — the practitioner's record. Shown read-only where the patient should see
  them (name, measures), withheld where they should not (RETENTION's table decides).
- **Console**: the profile read summary (`practitioner-workflow/secondary-sections`) shows "modifié
  par la patiente le …" on those fields.

The new `cooking_time` column is the one schema change; `likes_cooking` and `food_budget` already
exist as free-ish fields — Define checks whether they are enums or text today and normalises to the
three-level vocabularies the generation prompt will read.

## Acceptance criteria (rough)

- [ ] A « Mon profil » segment on the link where the patient edits diet, allergies, intolerances, foods liked / disliked, likes cooking, time available to cook (new three-level column) and budget — saved through the link-writes path, attributed, audited
- [ ] Identity, measures, medications, supplements, referral, consent and anamnesis are read-only or withheld on the link, per RETENTION's table
- [ ] The console's profile read summary shows « modifié par la patiente le … » on those fields
- [ ] `likes_cooking` and `food_budget` are normalised to the three-level vocabularies the generation prompt will read

## Out of scope (this feature)

- The 500-line admin profile form beyond the new field; any model call

## Notes for Define

- **Decisions that bind** ([`README.md § Decisions of record`](../README.md)): D-2 (the same token, read + write) · brainstorm § 7 (no exact preparation time — a three-level field is not that).

- Allergies are safety-critical inputs to recipe generation; a patient editing them is the right
  owner, and the audit trail keeps who changed what.
- The profile form in admin is 500 lines; this stub does not touch it beyond the new field.
- Brainstorm § 7 rules out "temps exact de préparation habituel"; a three-level field is not that.

**Open for Define** — settled with the operator before the spec is approved, never assumed:

- Vocabulary for the three levels of time and budget — her words (the old version's are a
  starting point).
- Should the patient be able to edit allergies at all, or only add (never remove) without Morgane
  confirming? Safety argues add-only; autonomy argues full edit.

## Prompt

Run `/pipeline new patient-profile-edit` in the remi-ai repo. Define reads this stub, its epic's `breakdown.md` and the decisions of record in `.icm/intake/README.md`, and asks the points under **Open for Define** rather than answering them. Scope is the Proposed change and nothing under Out of scope.
