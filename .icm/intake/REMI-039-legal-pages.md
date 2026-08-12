# REMI-039 · Legal pages: CGV and privacy policy

|                |                                                                                                                                                     |
| -------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| Status         | ready                                                                                                                                               |
| **Type**       | feature (content)                                                                                                                                   |
| **Priority**   | P1 — must exist before real users; consent (REMI-029) references these texts                                                                        |
| **Size**       | Days (engineering); the validation is counsel's                                                                                                     |
| **Depends on** | REMI-026 (the promises must match reality), REMI-015 (domain, for canonical URLs)                                                                   |
| **Blocked by** | **REQ-21 — legal validation.** Both v1 documents are stamped "awaiting legal validation" (27.11.2025); publish nothing unvalidated as binding terms |
| **Sources**    | v1-report §7; info-gathering REQ-21, REQ-23                                                                                                         |

## Problem statement

v1 shipped a complete CGV and privacy policy — wellness positioning with explicit
not-a-medical-device clauses, Art. 9.2(a) consent for medical/genetic data naming
APOE/AMY1A/DIO2, retention and deletion commitments, Belgian law — but both are stamped "awaiting
legal validation", and one clause ("amélioration des modèles d'IA" as a processing purpose) sits
awkwardly beside the sensitive-data promises and needs counsel's second look. The new sites have
no legal pages; the consent flow (REMI-029) needs versioned texts to consent to.

## Required steps

1. Confirm REQ-21's status; get the validated texts (or drive the validation via REMI-026's
   counsel loop). The v1 report's §7 summary is the outline; the full texts must come from the
   owner/counsel — an agent must not draft binding legal terms alone.
2. Build the legal pages on the public site(s): accessible, printable, French-first with the
   repo's language conventions (decide with the owner whether EN versions are translations or
   FR-only with notice).
3. Version the documents in code (id + effective date) so ConsentRecords (REMI-018/029) can
   reference exactly what was accepted; changing a text mints a new version.
4. Update company particulars from REQ-23 (BCE/KBO, VAT) when supplied.
5. Footer/consent-flow links from every app where users are asked to accept.

## Acceptance criteria

- [ ] Validated CGV and privacy texts render on the public site with stable versioned identity.
- [ ] The consent flow references the exact version accepted.
- [ ] No unvalidated text is presented as binding; placeholders are clearly marked if staged.
- [ ] Company particulars are real, not fixtures.

## Agent prompt

```text
Work in the remi-ai monorepo. Enter through the delivery pipeline per CLAUDE.md. Read
CONVENTIONS.md, then .icm/docs/v1-report.md §7 and .icm/docs/info-gathering.md REQ-21/REQ-23.

HARD PRECONDITION: you may not author binding legal terms. If the validated CGV and privacy
texts have not been supplied, build the machinery with clearly-marked placeholder content
("awaiting legal validation — not yet binding") and say so in the PR.

Build the legal-pages machinery:
1. A versioned legal-document structure in the services layer: {key: cgv|privacy, versionId,
   effectiveDate, locale, body} — the consent flow stores the versionId a user accepted;
   publishing a changed text requires a new versionId (make the old ones immutable in code
   review terms: additions, not edits).
2. Render the documents on the marketing site (and/or web app per the repo's surface
   conventions): accessible typography via the design system, printable, canonical URLs, linked
   from footers and from the consent step of onboarding.
3. French as the source language; follow the repo's EN parity conventions for the page chrome,
   and ask the owner whether the legal body itself gets an EN translation or an FR-only notice.
4. Wire company particulars (name, address, BCE/VAT, contact) from one content home, using the
   real values if supplied (REQ-23) or clearly-marked placeholders.
Tests on the versioning invariants. Run tests only; push and open a PR through the pipeline
gates, flagging exactly which content is validated and which is placeholder.
```
