# Stub: Practitioner space — sign-up, approval, billing, and a practitioner app of their own

- feature-slug: practitioner-space
- sequence: 3 of 6
- depends-on: patient-accounts
- priority: P2
- size: L
- sources: V2 explication (« Profil Praticien » : demande → Pending → back-office Accepter /
  Refuser → email with a Stripe Checkout link → webhook → Active; « Awaiting Payment »; only
  Active accounts have full access) · direction letter § 5 ("construire ensuite l'espace
  praticien … quelques praticiens pilotes") · feedback § 3 (three experiences) · decision #1
  (admin, reorganised, for December) · braindump `business/pricing.md` (€39 / €79 / €199 tiers,
  proposals) · `apps/web/app/(app)/(practitioner)/*` (the fixture-backed scaffold)

## What this is

Decision #1 keeps Morgane in the console until the open day; this is what comes after, and the
old version had already thought it through end to end. Three pieces, each its own PR when the
time comes:

1. **Practitioner accounts and the request flow** — "Je suis praticien" → a request form → a
   `pending` practitioner → the console's back-office list with Accepter / Refuser → emails
   through the mailer seam → `approved` / `rejected`. Vendor-free auth as for operators.
2. **Billing** — Stripe Checkout from the approval email, a webhook flipping `approved` to
   `active`, `awaiting_payment` for the rest; only `active` sees the app. A payments seam (one
   adapter, one webhook route), `STRIPE_*` under the three-list rule. Pricing tiers are proposals
   in the braindump, not decisions.
3. **The practitioner app** — `apps/web`'s practitioner group, today on fixtures, becomes the
   practitioner's own view of _their_ patients: the at-a-glance page and the consultation flow
   `practitioner-workflow` built in the console, re-homed behind practitioner auth with
   per-practitioner scoping on every query. The console keeps the operator's view of everyone.

The direction letter's method applies: a few pilot practitioners, real use, feedback, iterate —
after the patient experience is validated (§ 4 of the letter).

## Worth knowing

- Per-practitioner scoping is the security work here: every patient query gains a practitioner
  filter, and the v1 report's IDOR finding is the mistake not to repeat.
- The "3 mois gratuits" for invited patients and the patient premium (~€9.99, a proposal) are
  billing rules that belong with piece 2.

## Open questions — flag these on pickup

- Does the practitioner app live in `apps/web` alongside the patient, or does admin grow a
  practitioner role? The scaffold argues web; the shipped console argues admin. Owner's call.
- Which tier structure, if any, is real by then.

## Prompt

Run `/pipeline new .icm/intake/beyond-december/practitioner-space.md` in the remi-ai repo and
follow the pipeline from there — only after the owner has moved this stub onto the live path;
expect it to split into three runs (accounts + approval, billing, the app). Read the stub and its
epic's `breakdown.md` first. Scope as written above; per-practitioner scoping on every query is
non-negotiable. Raise the stub's open questions rather than answering them.
