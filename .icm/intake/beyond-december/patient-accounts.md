# Stub: Patient accounts — invite, activate, a session; the link stops being the whole credential

- feature-slug: patient-accounts
- sequence: 1 of 6
- depends-on: none
- priority: P2
- size: L
- sources: V2 explication (« Inviter le patient », lien d'invitation unique, statut « Invitation
  en attente », activation, « 3 mois gratuits ») · decision #2 (token read + write for the beta;
  accounts are the answer to its accepted risk) · `patient-loop/link-writes` (the privacy card
  that says anyone holding the link can write) · `packages/services/src/auth/` (vendor-free
  operator auth, reusable) · `apps/web/lib/auth/session.ts` (the `SessionProvider` seam with no
  vendor)

## What this is

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

## Worth knowing

- Sessions on `apps/web` mean the app becomes signed-in for patients; the fixture-backed
  practitioner group there is unrelated and stays parked.
- A magic link is an email dependency: the mailer's failure mode (console fallback) must be loud
  on this path.

## Open questions — flag these on pickup

- Magic link only, or magic link + optional password later? The old version had passwords.
- Retire the share token, or keep it as the read-only "show your partner" link?

## Prompt

Run `/pipeline new .icm/intake/beyond-december/patient-accounts.md` in the remi-ai repo and
follow the pipeline from there — only after the owner has moved this stub onto the live path.
Read the stub and its epic's `breakdown.md` first. Scope: invitation from the console with an
emailed activation link, activation with consent and a passwordless session on `apps/web` through
the existing session-token helper and the `SessionProvider` seam, patient status in the console,
the share token's fate decided and documented. Raise the stub's open questions rather than
answering them.
