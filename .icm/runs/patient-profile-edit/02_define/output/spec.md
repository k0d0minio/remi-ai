# Spec: Patient profile edit — the patient keeps their food profile true, and « temps disponible » exists

- slug: patient-profile-edit
- personas: patient, practitioner
- touches: apps/web/app/[locale]/p/[token], apps/web/lib/patient-link, apps/web/components/patient-link, packages/services/src/db/schema.ts, packages/services/src/db/migrations, packages/services/src/db/models/patient-profile.ts, packages/services/src/db/services/patients, packages/services/src/db/services/patient-link-writes, packages/services/src/shared/patient.ts, packages/services/src/ai/context.ts, apps/admin/components/patients, apps/admin/lib/patients, .icm/docs/RETENTION.md
- complexity: standard

## Problem

Brainstorm § A marks diet, allergies, intolerances, likes / dislikes, likes-cooking and budget as
**patient-supplied**, yet today only Morgane can write them, from the console. The current
initiative — a patient experience validated on real terrain, in time for the December open day,
objective « the patient loop working end to end for one real patient » (`business/initiatives`) —
needs those inputs kept true by the person who knows them, because the 15 November milestone
(`ai-assist/recipe-generation`) generates « 100 % personnalisé » from them and D-6's automated
check filters on allergies, intolerances, diet and time. « Temps disponible pour cuisiner » (her
feedback § 7, the old version's onboarding) does not exist at all, and `food_budget` is free text a
prompt cannot rely on.

## Proposed change

**A « Mon profil » segment on the patient link** (`/p/[token]/profil`, listed in the segment nav
like the other segments, always present). It shows two blocks:

- **Editable by the patient** — seven fields, saved together by one « Enregistrer » through the
  `link-writes` path (token-resolved, rate-limited, length-capped, attributed to the patient,
  audited, `written_by: patient` in the trail — D-2):
  - Régime alimentaire — free text (the column stays text; its schema comment explains why)
  - Allergies — free text, **full edit** (add, change, remove) — decided in Define, see below
  - Intolérances — free text
  - Aliments aimés / non aimés — free text (`preferences`)
  - Aime cuisiner — oui / un peu / non (the existing `likes_cooking` vocabulary, unchanged)
  - Temps disponible pour cuisiner — **faible / moyen / important** (new column `cooking_time`)
  - Budget alimentaire — **économique / standard / confort** (`food_budget`, normalised)

  Each three-level field can also be left unset (« pas encore renseigné »): not answered is a
  different answer from any level. Free-text fields respect `PATIENT_LINK_BODY_MAX`.
- **Read-only** — name, age (derived from `birth_date`, never the date itself), height, weight,
  exactly as RETENTION's table lets them reach the link. Nothing else from the profile appears on
  this segment: medications and supplements already reach the patient through their own segments,
  and constraints, referral, consent and anamnesis are the practitioner's record and are withheld.

A save that changes nothing records no write and no audit event. A refused save (rate limit, cap,
unknown token) shows the refusal in place and keeps what the patient typed.

**Schema.** One new nullable column `cooking_time` (`low | medium | high`, labels faible / moyen /
important). `food_budget` becomes a nullable three-level value (`economical | standard | comfort`,
labels économique / standard / confort) instead of free text. The migration maps existing
`food_budget` text that clearly names a level (case- and accent-insensitive: « éco… », « standard »,
« confort… ») to that level; **any other non-empty text is appended to `preferences`** as a line
`Budget : <original text>` and the budget left unset — nothing Morgane typed is lost.
`likes_cooking` is already the three-level `yes | somewhat | no` vocabulary; it is only checked, not
changed.

**Attribution the console can show.** Each of the seven fields remembers the date the patient last
changed it. The console's profile read summary (`secondary-sections`' profile summary) shows
« modifié par la patiente le <date> » beside every field whose latest change was the patient's; a
later save of that field by Morgane clears the marker for that field only.

**Console form.** The admin patient form gains the « Temps disponible pour cuisiner » select and its
« Budget alimentaire » input becomes the three-level select (the free text it was is gone). Nothing
else in the form changes.

**The generation context.** The shared context assembler (`packages/services/src/ai/context.ts`,
and the console's copy-context labels) renders time and budget as their French labels, and adds the
« Temps disponible pour cuisiner » line, so `copy-context` today and `recipe-generation` later read
the same three-level words.

**RETENTION.** The table gains `cooking_time` and the per-field patient-edit dates (reach the link:
the field values yes; the dates, no), and states that the patient now writes the seven fields.

## Acceptance criteria

- [ ] The patient link lists a « Mon profil » segment; opening it with a valid token shows the seven editable fields prefilled with the current values, and name, age, height and weight read-only
- [ ] The segment never shows the birth date, constraints, referral, consent, anamnesis, medications or supplements
- [ ] Saving changed values through « Mon profil » persists them, and the change appears on the console's profile read summary on reload
- [ ] Each accepted save records one audit event whose actor is the patient and stamps the profile's last-written timestamp; a save with no change records neither
- [ ] A save over the link rate limit or over a length cap is refused with a message on the segment, the typed values stay in the form, and nothing is persisted
- [ ] An unknown or regenerated token on `/p/[token]/profil` returns the same not-found as every other segment, for both the page and the save
- [ ] The patient can clear or remove an allergy, and the console then shows « modifié par la patiente le <date> » on Allergies
- [ ] The console's profile read summary shows « modifié par la patiente le <date> » on each of the seven fields the patient last changed, and not on fields Morgane saved after the patient
- [ ] « Temps disponible pour cuisiner » (faible / moyen / important) and « Budget alimentaire » (économique / standard / confort) are selects on both the patient segment and the admin patient form, each with an unset option
- [ ] After the migration, an existing `food_budget` naming a level holds that level, and any other existing non-empty value appears in `preferences` as « Budget : <original text> » with the budget unset
- [ ] The copy-context export shows « Aime cuisiner », « Temps disponible pour cuisiner » and « Budget » as their French three-level labels
- [ ] RETENTION.md lists `cooking_time` and the per-field patient-edit dates, with what reaches the link

## Out of scope

- The 18+ rule and « age, not date of birth » (D-23): the patient does not edit identity on the
  link, `birth_date` stays stored and age stays derived. The check belongs to self sign-up —
  `beyond-december/patient-accounts` — and the console's identity fields are unchanged here.
- An allergy change needing Morgane's confirmation: the patient edits freely; the console marker
  and the audit trail are the safeguard (decided in Define).
- The admin patient form beyond the new time select and the budget becoming a select; any redesign
  of the console's profile summary beyond the marker.
- Any model call; an exact preparation time (brainstorm § 7 rules it out — three levels are not
  that).
- The patient editing objective, constraints, identity, measures, medications or supplements.
- Notifying Morgane of a profile edit beyond the marker and the link's existing last-written
  timestamp.

## Open questions

- none — the four points left open by the stub were settled with the operator on 2026-09-25: the
  old version's words for time and budget; full edit of allergies with the console marker as the
  safeguard; D-23 out of scope here; unmatched budget text moved into `preferences`.
