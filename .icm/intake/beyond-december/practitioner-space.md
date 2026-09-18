# Stub: Practitioner space — sign-up, approval, billing, and a practitioner app of their own

- feature-slug: practitioner-space
- scope: beyond-december
- personas: practitioner, operator
- initiative: a patient experience validated on real terrain, in time for the December open day / objective: the database and accounts under it
- depends-on: patient-accounts
- sequence: 3 of 6
- priority: P2
- size: L
- sources: V2 explication (« Profil Praticien » : demande → Pending → back-office Accepter /
  Refuser → email with a Stripe Checkout link → webhook → Active; « Awaiting Payment »; only
  Active accounts have full access) · direction letter § 5 ("construire ensuite l'espace
  praticien … quelques praticiens pilotes") · feedback § 3 (three experiences) · decision D-1
  (admin, reorganised, for December) · braindump `business/pricing.md` (€39 / €79 / €199 tiers,
  proposals) · `apps/web/app/(app)/(practitioner)/*` (the fixture-backed scaffold)

## Problem

D-1 keeps Morgane in the console until the open day; after it, other practitioners need a request flow, billing and a view of their own patients. The old version thought it through end to end; nothing of it exists in this repository beyond a fixture-backed scaffold.

## Proposed change

Decision D-1 keeps Morgane in the console until the open day; this is what comes after, and the
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

## Acceptance criteria (rough)

- [ ] Practitioner accounts with a request form → pending → console back-office Accepter / Refuser → emails through the mailer seam
- [ ] Stripe Checkout from the approval email and a webhook flipping approved → active; only active sees the app; `STRIPE_*` under the three-list rule
- [ ] The practitioner's own view of their patients (the at-a-glance page and the consultation flow) behind practitioner auth, with per-practitioner scoping on every query
- [ ] Expect three runs: accounts + approval, billing, the app

## Out of scope (this feature)

- Deciding the tier structure — the braindump's prices are proposals; the operator console's view of everyone changes nothing

## Notes for Define

- **Decisions that bind** ([`README.md § Decisions of record`](../README.md)): D-1 (the console, reorganised, until the open day) · D-10 (parked until then) · the direction letter § 5 (a few pilot practitioners, after the patient experience is validated).

- Per-practitioner scoping is the security work here: every patient query gains a practitioner
  filter, and the v1 report's IDOR finding is the mistake not to repeat.
- The "3 mois gratuits" for invited patients and the patient premium (~€9.99, a proposal) are
  billing rules that belong with piece 2.

**Open for Define** — settled with the operator before the spec is approved, never assumed:

- Does the practitioner app live in `apps/web` alongside the patient, or does admin grow a
  practitioner role? The scaffold argues web; the shipped console argues admin. Owner's call.
- Which tier structure, if any, is real by then.

## Prompt

Run `/pipeline new practitioner-space` in the remi-ai repo — **only after the owner has moved this stub onto the live path; expect it to split into three runs (accounts + approval, billing, the app)**. Define reads this stub, its epic's `breakdown.md` and the decisions of record in `.icm/intake/README.md`, and asks the points under **Open for Define** rather than answering them. Scope is the Proposed change and nothing under Out of scope.
