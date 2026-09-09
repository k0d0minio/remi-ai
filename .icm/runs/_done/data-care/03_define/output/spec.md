# Spec: Data care — consent on record, privacy on the link, a written retention answer

- slug: data-care
- apps: web, admin, packages
- touches: packages/services/src/db/schema.ts, packages/services/src/db/migrations,
  packages/services/src/db/models/patient-profile.ts,
  packages/services/src/db/services/patients, apps/admin/app/(admin)/patients/[id],
  apps/admin/components/patients, apps/web/app/[locale]/p/[token],
  apps/web/lib/content, .icm/docs
- complexity: standard
- demo: none

## Problem

Real names, pathologies and medications already persist in Neon and render at a real URL behind a
share token, and the ticket that covered the data-protection groundwork was lost in the 28 August
clean slate. The `patient-record` epic is about to add an anamnesis and a supplement protocol to
that record, so more health data lands on a record that carries no evidence the patient agreed to
it, on a link that never says who can see it. This is the recorded-fact layer under the current
initiative's terrain method — Morgane accompanies 10–15 real patients now, and a real patient can
ask her today what REMI holds and who can read it. Nothing here is a consent-management vendor or a
legal review; it is the facts those would later build on.

## Proposed change

Three things, each small and independent of the other two:

1. **Consent on the profile.** `patient_profiles` gains two nullable fields — the date the patient
   agreed and the channel they agreed through (in-consultation, WhatsApp, email). Morgane records
   and edits them on the existing patient form; the patient page shows them, and shows a visible
   "not recorded yet" state when they are absent rather than an empty line. The write goes through
   the storage seam and is audited like every other admin write.
2. **A privacy note on the patient link.** The disclaimer card already on `/p/[token]` gains a
   patient-facing paragraph, in French and English, saying what this page is, that anyone holding
   the link can open it, and who to contact about the data. Copy lives in the typed locale
   dictionaries, so both locales move together or neither compiles.
3. **A written retention answer.** One short section in `.icm/docs/`, beside `ENV.md`: what
   deleting a patient removes today (profile, recommendations, notes, share link — the cascade),
   what it deliberately does not (the audit trail, which must survive the deletion it records), and
   how long `ended` patients are kept. Written so Morgane can read it to a patient who asks.

Consent is a recorded fact, not an enforcement mechanism: absent consent shows as missing, and
blocks nothing.

## Acceptance criteria

- [ ] `patient_profiles` carries a consent date and a consent channel, both nullable, with a
      checked-in Drizzle migration generated from `schema.ts`.
- [ ] The consent channel is a closed set — in-consultation, WhatsApp, email — enforced at the
      write site, not free text.
- [ ] Morgane can set and change both fields from the admin patient form; the write goes through
      the storage seam and lands in the audit trail like every other patient edit.
- [ ] The admin patient page shows the consent date and channel when recorded, and a visible "not
      recorded yet" state when either is absent — never a silent blank.
- [ ] Consent is recorded fact only: a profile with no consent renders, saves and shares exactly as
      it does today.
- [ ] `/p/[token]` renders a privacy note inside the existing disclaimer card, stating what the
      page is, that anyone holding the link can open it, and who to contact about the data.
- [ ] The privacy note exists in both `fr` and `en` dictionaries, typed so a missing locale fails
      the build rather than falling back silently.
- [ ] The patient link page still shows no consent field and no form — the page stays view-only.
- [ ] `.icm/docs/` carries a retention section covering what a patient deletion removes, what it
      keeps and why, and how long `ended` patients are held — in plain language, no new framework
      and no new folder.
- [ ] The services layer's existing tests cover the new fields against the in-memory client.

## Out of scope

- **A stored consent wording or version string.** Open question 1 below is unanswered, so this run
  records only date and channel. Adding a wording/version later is one nullable column, not a
  reshape.
- **Automated retention.** No deletion prompt, no expiry job, no scheduled purge of `ended`
  patients — open question 2 below is unanswered; the retention answer this run ships is prose.
- Any consent-management vendor, cookie banner, DPA, privacy-policy page or legal review.
- Consent as a gate: nothing is blocked, hidden or refused when consent is absent.
- Forms, inputs or any interaction on `/p/[token]` — the link stays view-only this round
  (breakdown.md, Decision of record 1).
- A patient-facing privacy or data-request page beyond the disclaimer paragraph.
- Touching the audit trail's own retention or its non-cascading design.

## Open questions

Both are the stub's, carried up unanswered — neither blocks a criterion above, because each has a
deliberate Out-of-scope deferral behind it. **For Morgane, not for Build:**

- Does she want a stored consent wording/version, or is date + channel enough for the beta? This
  run ships date + channel; a wording column is additive if the answer is yes.
- Retention for `ended` patients: is there a period after which she wants deletion prompted, or is
  indefinite-until-asked the beta answer? The retention section will state whichever answer she
  gives; if she has not answered by Build, it states indefinite-until-asked as the current
  behaviour and says so, since that is what the code does today.
