# Stub: Send the link by email — « envoyer le lien », templated, through Resend

- feature-slug: send-link-email
- scope: beyond-december
- personas: practitioner, patient
- initiative: a patient experience validated on real terrain, in time for the December open day / objective: the database and accounts under it
- depends-on: none
- sequence: 8 of 8
- priority: P2
- size: S
- complexity: low
- sources: 28 Aug call [36:43] (Jamie: an « envoyer mail » button with templated emails and the
  patient's link once `remi-ai.be` is live) · V2 explication (the « mailto » invitation of the old
  version) · correspondence/04 (« un lien envoyé par REMI (Resend est déjà branché) ») · decision
  D-22 (parked 2026-09-23) · `packages/services/src/email/` (the Resend adapter)

## Problem

Today Morgane copies the patient's link and pastes it into WhatsApp. The email seam and its Resend adapter exist and send nothing to a patient; the 28 Aug promise of a templated « envoyer le lien » mail was never written down.

## Proposed change

- **« Envoyer le lien »** on the patient page: one templated email in her register — the link, two
  lines she can edit before sending, her signature — sent from the transactional subdomain through
  the email seam; the send is logged on the patient (when, to which address) and shown on the page.
- The template is a file in the repo, versioned; no editor.

## Acceptance criteria (rough)

- [ ] From the patient page, « Envoyer le lien » sends one templated email through the email seam with the patient's link and an editable two-line message
- [ ] The send is logged on the patient and shown on the page; a failed send is shown, not silent
- [ ] The template lives in the repo and is versioned

## Out of scope (this feature)

- Check-in or nudge emails (D-9); accounts and activation links (`patient-accounts`); a template
  editor

## Notes for Define

- **Decisions that bind** ([`README.md § Decisions of record`](../README.md)): D-22 (parked P2)
  · D-9 (no outbound channel for check-ins — this is a one-off transactional mail she triggers, not
  a channel).

- A patient's email address is already a profile field; sending to it is a use RETENTION should
  name.

**Open for Define** — settled with the operator before the spec is approved, never assumed:

- The sender domain and name once `remi-ai.be` is live; whether the mail is French only.

## Prompt

Run `/pipeline new send-link-email` in the remi-ai repo — **only after the owner has lifted this stub's P2**. Define reads this stub, its epic's `breakdown.md` and the decisions of record in `.icm/intake/README.md`, and asks the points under **Open for Define** rather than answering them. Scope is the Proposed change and nothing under Out of scope.
