# Epic: beyond-december — the old version's flows that are right, and not for now

Cut 2026-09-10 from the old version's product logic
([`remi-v2-explication-systeme.docx`](../../docs/collaboration/remi-v2-explication-systeme.docx),
precedence row 5) and the "vision finale" paragraphs of Morgane's feedback § 7 and § 8. She asked
that the old version not be reproduced as is, but that its thought-through journeys not be thrown
away either: "conserver les apprentissages et les bonnes idées de ce qui existe déjà". Decision
#10 (2026-09-10, [`practitioner-workflow/breakdown.md § Decisions`](../practitioner-workflow/breakdown.md))
settles that FunMedDev's team tests on 1 December as patients Morgane creates, so none of the
flows below is needed for the open day. They are parked **as stubs, not as a wish list**, so the
board shows them and a pickup starts from a written scope — every one is P2, and two are blocked
on decisions only the owner can make.

The sequence below is an order of _likely need_, not a dependency chain, and no stub here is
"next" until the owner moves it or lifts its P2.

## Build order

1. `patient-accounts` — invite → activation link → a session; the token stops being the whole
   credential — depends-on: none
2. `autonomous-patient-pdf-import` — a patient with no practitioner in REMI uploads their
   practitioner's PDF and REMI structures it — depends-on: patient-accounts
3. `practitioner-space` — practitioner sign-up → admin approval → Stripe → active; the
   practitioner app on `apps/web`'s scaffold — depends-on: patient-accounts
4. `meal-photos` — photos on meal entries, once a blob vendor exists — depends-on: none · blocked
5. `patient-groups` — assign a recipe or a protocol block to a named group of patients —
   depends-on: none
6. `genotype-layer` — nutrients to favour from a genetic test (Fagron), the Dr Mouton table —
   depends-on: none · blocked

## Parallelizable

Irrelevant until something is un-parked; each stub says what it waits on.

## Out of scope (whole epic)

- Anything on the December path — it lives in the four live epics.
- The braindump's diversification list (`idees-opportunites/nouvelles-directions.md`) — not
  stubs, not yet ideas with a scope.
