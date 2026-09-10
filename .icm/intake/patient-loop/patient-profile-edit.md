# Stub: Patient profile edit — the patient owns their food preferences, and « temps disponible » exists

- feature-slug: patient-profile-edit
- sequence: 5 of 6
- depends-on: link-writes
- priority: P1
- size: S
- sources: feedback § 7 ("Profil patient : allergies et intolérances, régime, temps disponible,
  aime cuisiner ou non, budget") · V2 explication (« Le patient complète son profil », « Page
  Profil – modifiable ») · brainstorm § A (patient-supplied fields) · `patient_profiles` ·
  `apps/admin/components/patients/patient-form.tsx`

## What this is

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

## Worth knowing

- Allergies are safety-critical inputs to recipe generation; a patient editing them is the right
  owner, and the audit trail keeps who changed what.
- The profile form in admin is 500 lines; this stub does not touch it beyond the new field.
- Brainstorm § 7 rules out "temps exact de préparation habituel"; a three-level field is not that.

## Open questions — flag these on pickup

- Vocabulary for the three levels of time and budget — her words (the old version's are a
  starting point).
- Should the patient be able to edit allergies at all, or only add (never remove) without Morgane
  confirming? Safety argues add-only; autonomy argues full edit.

## Prompt

Run `/pipeline new .icm/intake/patient-loop/patient-profile-edit.md` in the remi-ai repo and
follow the pipeline from there. Read the stub, its epic's `breakdown.md` and the `link-writes`
run's notes first. Scope: a « Mon profil » segment where the patient edits diet, allergies,
intolerances, likes / dislikes, likes cooking, time available (new three-level column) and budget,
with patient attribution and audit; the practitioner-only fields stay read-only or withheld per
RETENTION; the console shows patient edits. No model call. Raise the stub's open questions rather
than answering them.
