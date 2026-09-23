# Breakdown: beyond-december — the old version's flows that are right, and not for now

- scope-slug: beyond-december · story: none — cut 2026-09-10 from the old version's product logic (`remi-v2-explication-systeme.docx`) and the « vision finale » paragraphs of the feedback § 7 and § 8; two stubs added 2026-09-23 from the August calls and her 20 Aug catalogue (`runs/september-sources/01_scope/`, decision D-22)
- initiative: a patient experience validated on real terrain, in time for the December open day / objective: the database and accounts under it
- personas: patient, practitioner, operator

## What I understood

Cut 2026-09-10 from the old version's product logic
([`remi-v2-explication-systeme.docx`](../../docs/collaboration/remi-v2-explication-systeme.docx),
precedence row 6) and the "vision finale" paragraphs of Morgane's feedback § 7 and § 8. She asked
that the old version not be reproduced as is, but that its thought-through journeys not be thrown
away either: "conserver les apprentissages et les bonnes idées de ce qui existe déjà". Decision
D-10 (2026-09-10, [`README.md § Decisions of record`](../README.md))
settles that FunMedDev's team tests on 1 December as patients Morgane creates, so none of the
flows below is needed for the open day. They are parked **as stubs, not as a wish list**, so the
board shows them and a pickup starts from a written scope — every one is P2, and two are blocked
on decisions only the owner can make.

The sequence below is an order of _likely need_, not a dependency chain, and no stub here is
"next" until the owner moves it or lifts its P2.

**Amended 2026-09-23.** The blob-vendor question that blocked two stubs is answered — Vercel Blob
behind a files seam (D-18), built by `patient-loop/patient-documents-and-links` — so `meal-photos`
and `autonomous-patient-pdf-import` are parked, no longer blocked. Two stubs join from the older
sources (D-22): `patient-record-export`, her 20 Aug trust principle, and `send-link-email`, the
28 Aug promise. `genotype-layer` carries a second blocker from the 28 Aug call (D-23).

## Where it sits

Accounts and sessions on the product app; the practitioner request flow and billing; the files seam (built in `patient-loop`); groups on the console; the generation context slot; the email seam; the record's export.

## Build order

1. `patient-accounts` — invite → activation link → a session; the token stops being the whole
   credential — depends-on: none
2. `autonomous-patient-pdf-import` — a patient with no practitioner in REMI uploads their
   practitioner's PDF and REMI structures it — depends-on: patient-accounts
3. `practitioner-space` — practitioner sign-up → admin approval → Stripe → active; the
   practitioner app on `apps/web`'s scaffold — depends-on: patient-accounts
4. `meal-photos` — photos on meal entries through the files seam — depends-on: none
5. `patient-groups` — assign a recipe or a protocol block to a named group of patients —
   depends-on: none
6. `genotype-layer` — nutrients to favour from a genetic test (Fagron), the Dr Mouton table —
   depends-on: none · blocked
7. `patient-record-export` — « Exporter le dossier », readable, audited — depends-on: none
8. `send-link-email` — « Envoyer le lien », one templated mail through Resend — depends-on: none

## Parallelizable

Irrelevant until something is un-parked; each stub says what it waits on.

## Out of scope (whole epic)

- Anything on the December path — it lives in the live epics.
- Recorded on 2026-09-23 as ideas without a stub (D-21): a practitioner knowledge-sharing forum,
  speech-to-text for consultations, a supplement reference table, a shopping list, a cross-patient
  follow-up board, a period synthesis, pre-consultation questionnaires.
- The braindump's diversification list (`idees-opportunites/nouvelles-directions.md`) — not
  stubs, not yet ideas with a scope.
