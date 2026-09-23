# Stub: Patient accounts — invite, activate, a session; the link stops being the whole credential

- feature-slug: patient-accounts
- scope: beyond-december
- personas: patient
- initiative: a patient experience validated on real terrain, in time for the December open day / objective: the database and accounts under it
- depends-on: none
- sequence: 1 of 8
- priority: P2
- size: L
- sources: V2 explication (« Inviter le patient », lien d'invitation unique, statut « Invitation
  en attente », activation, « 3 mois gratuits ») · decision D-2 (token read + write for the beta;
  accounts are the answer to its accepted risk) · `patient-loop/link-writes` (the privacy card
  that says anyone holding the link can write) · `packages/services/src/auth/` (vendor-free
  operator auth, reusable) · `apps/web/lib/auth/session.ts` (the `SessionProvider` seam with no
  vendor)

## Problem

Once a patient writes health data into REMI, a URL is a thin credential. D-2 accepted that risk for the beta; this stub is its answer — an account without a password to lose.

## Proposed change

Once a patient writes health data into REMI, a URL is a thin credential. This stub gives the
patient an account without giving them a password to lose:

- **Invite** — from the console, "Inviter" on a patient with an email: an invitation token
  (hashed, expiring — the operator-invitation table's shape, reused) and an email through the
  mailer seam (the old version opened a `mailto:`; Resend is wired now).
- **Activate** — the patient opens the link, confirms their name, accepts the consent text (the
  consent date and channel already exist on the profile), and gets a **session**: a signed cookie
  from the existing HMAC session-token helper, no password; re-entry by a fresh emailed link
  (magic link). The `SessionProvider` seam in `apps/web` gets its first real provider.
- **The share token** becomes a read-only fallback or is retired — the owner's call at pickup; the
  privacy card and `RETENTION.md` say what is true.
- **Status** on the patient: `invitation pending → active`, visible in the console.

The old version's "3 mois gratuits, sans Stripe, expiration = activation + 3 mois" is a billing
rule; it belongs with `practitioner-space` and is only a date column here if the owner wants it
recorded from day one.

## Acceptance criteria (rough)

- [ ] « Inviter » on a patient with an email sends an activation link through the mailer seam (hashed, expiring token — the operator-invitation table's shape reused)
- [ ] Activation confirms the name, records consent, and opens a passwordless session on the product app through the existing HMAC session helper; re-entry is a fresh emailed link
- [ ] The patient's status (invitation pending → active) is visible in the console
- [ ] The share token's fate (read-only fallback, or retired) is decided at pickup and RETENTION and the privacy card say what is true

## Out of scope (this feature)

- Billing rules (« 3 mois gratuits ») — `practitioner-space`; passwords; the fixture-backed practitioner group on the product app

## Notes for Define

- **Decisions that bind** ([`README.md § Decisions of record`](../README.md)): D-2 (token read + write for the beta; accounts are the answer to its accepted risk) · D-10 (not needed for 1 December).

- Sessions on `apps/web` mean the app becomes signed-in for patients; the fixture-backed
  practitioner group there is unrelated and stays parked.
- A magic link is an email dependency: the mailer's failure mode (console fallback) must be loud
  on this path.

**Open for Define** — settled with the operator before the spec is approved, never assumed:

- Magic link only, or magic link + optional password later? The old version had passwords.
- Retire the share token, or keep it as the read-only "show your partner" link?

## Prompt

Run `/pipeline new patient-accounts` in the remi-ai repo — **only after the owner has moved this stub onto the live path**. Define reads this stub, its epic's `breakdown.md` and the decisions of record in `.icm/intake/README.md`, and asks the points under **Open for Define** rather than answering them. Scope is the Proposed change and nothing under Out of scope.
