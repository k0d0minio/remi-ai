# REMI-039 · Reconcile the marketing site with the patient-first direction

|                |                                                                                                                           |
| -------------- | ------------------------------------------------------------------------------------------------------------------------- |
| Status         | ready                                                                                                                     |
| **Type**       | chore — truthfulness                                                                                                      |
| **Priority**   | P1 — the public site is what the 19 Dec open day points at                                                                |
| **Size**       | Half a day                                                                                                                |
| **Depends on** | REMI-009 (how much of the estate survives — this may become "one marketing page")                                         |
| **Blocked by** | —                                                                                                                         |
| **Sources**    | Found in REMI-008's sweep · `.icm/docs/new-development-direction.docx` · `apps/docs/app/business/scope` (the frozen list) |

## Problem statement

`apps/marketing` still tells the pre-braindump story: REMI "launches with a small pilot cohort of
practitioners first", the hero eyebrow reads "In development · first pilot cohort forming", and the
roadmap's Now/Next columns are ordered around building the practitioner space. The direction of
record is the opposite — the patient experience is built and validated first, the practitioner space
is parked until it is, and commercialisation starts at the 19 December open day with the **patient**
version.

None of this is a fabricated commercial claim: the site states no price, no billing date and no
signed practitioner count, so it cleared REMI-008's acceptance criteria and was left alone there.
It is simply out of step with the plan, and it is the surface a prospective patient reads.

Known sites of the drift, EN and FR both — the content dictionaries are a compiled pair, so every
edit lands twice:

- `apps/marketing/components/sections/pilot-section.tsx`
- `apps/marketing/app/[locale]/practitioners/page.tsx`
- `apps/marketing/lib/content/en.ts` and `fr.ts` — `home.hero.eyebrow`, `home.roadmap`,
  `home.faq` ("Can I use REMI today?"), `home.cta`, and the `practitioners` block

## Required steps

1. Re-order the story around the patient: what REMI does for someone whose practitioner recommends
   it, available from the open day. The practitioner page stays — practitioners are still the
   prescriber and the acquisition channel — but stops promising a cohort that is not being formed.
2. Take the frozen feature list from `apps/docs/app/business/scope` and say nothing that is not on
   it. No practitioner dashboard promised as imminent.
3. Keep the existing honesty rules: no price, no testimonials, no invented traction, the three WHO
   statistics keep their sources.
4. EN/FR parity — the compiler enforces it.

## Open questions — flag these on pickup

- **Does the marketing site survive REMI-009?** If the estate shrinks to "product + one marketing
  page", this work should be done on whatever that page becomes, not on six sections.
- **Is the clinical partner named?** The site names the partnership today; the docs site
  deliberately does not. Confirm which posture is wanted before publishing either way.

## Prompt

```text
Work in the remi-ai monorepo. Read `.icm/intake/REMI-039-marketing-patient-first.md` for the full
context, then `.icm/docs/new-development-direction.docx` and
`apps/docs/app/business/scope/page.mdx` — that page is the frozen V2 feature list and this work must
not promise anything outside it.

The public marketing site still frames the launch as practitioner-first ("launches with a small
pilot cohort of practitioners first"). The direction of record is patient-first, with
commercialisation starting at the December open day with the patient version. Re-point the copy per
the ticket's required steps, in English and French — the content dictionaries are a typed pair and
the compiler will reject a one-sided edit. Keep the site's existing honesty rules: no price, no
testimonials, no invented traction.

Do not run build/lint/typecheck/format locally — CI owns them. Push a `claude/` branch, open a PR,
`git mv` this ticket into `.icm/intake/_done/` in the same PR, and put the two open questions in the
PR body for the owner. Do not decide them yourself.
```
