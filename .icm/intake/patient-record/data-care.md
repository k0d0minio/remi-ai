# Stub: Data care — consent on record, privacy on the link, a written retention answer

- feature-slug: data-care
- sequence: 1 of 6
- depends-on: none
- priority: P1
- size: S
- sources: purged REMI-015 (data-protection groundwork, recoverable in git history) ·
  scope answers 2026-09-01 (breakdown.md § Decisions, #8)

## What this is

Real names, pathologies and medications already persist in Neon and render at a real URL behind a
share token — and the ticket that covered data-protection groundwork went down with the 28 Aug
clean slate. Before this epic adds an anamnesis and a supplement protocol to that record, the
cheap, non-negotiable part lands:

- **Consent on the profile.** When and how the patient agreed to their data being held and to the
  share link existing — a date and a channel (in-consultation, WhatsApp, email), recorded by
  Morgane, visible on the patient page, editable. Absence renders as a visible "not recorded yet"
  state, not a silent blank.
- **A privacy note on the patient link.** The existing `/p/[token]` page says, in patient-facing
  French/English, what this page is, who can see it (anyone holding the link), and who to contact
  about their data. The disclaimer card already on the page is the natural home.
- **A written retention answer.** One short section in `.icm/docs/` (beside ENV.md, not a new
  framework): what deleting a patient removes (today: profile, recommendations, notes, link —
  cascade), what it does not (audit trail, by design), and how long ended patients are kept.
  Written so Morgane can answer a patient who asks.

No consent-management vendor, no cookie machinery, no legal review — this is the recorded-fact
layer those would later build on.

## Worth knowing

- `patient_profiles` deletion already cascades; the audit trail deliberately does not (see
  `packages/services/src/db/schema.ts` — the trail must survive the deletion it records).
- Schema change via `schema.ts` + `pnpm db:generate`; service behind the seam; admin writes go
  through `lib/audit.ts`.
- The link page is `apps/web/app/[locale]/p/[token]/page.tsx`; its copy lives in the typed locale
  dictionaries under `apps/web/lib/content/`.

## Open questions — flag these on pickup

- Does Morgane want a stored consent wording/version, or is date + channel enough for the beta?
- Retention for `ended` patients: is there a period after which Morgane wants deletion prompted,
  or is indefinite-until-asked the beta answer?

## Prompt

Run `/pipeline new .icm/intake/patient-record/data-care.md` in the remi-ai repo and follow the
pipeline from there. Read the stub and its epic's `breakdown.md` first — the epic's "Decisions of
record" bind this work. Scope: consent date + channel on `patient_profiles` surfaced on the admin
patient page, a privacy note in the existing `/p/[token]` disclaimer area (both locales), and a
short retention section in `.icm/docs/`. Raise the stub's open questions rather than answering
them; state any unavoidable assumption in the PR body.
