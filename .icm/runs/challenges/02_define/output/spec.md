# Spec: Challenges — one habit at a time, « Challenge acquis » and « Prêt(e) pour le prochain »

- slug: challenges
- personas: patient, practitioner
- touches: packages/services/src/db, apps/web/app/[locale]/p/[token], apps/web/components/patient-link, apps/web/lib/patient-link, apps/web/lib/content, apps/admin/app/(admin)/patients, apps/admin/components/patients, .icm/docs/RETENTION.md
- complexity: standard

## Problem

Morgane runs one habit at a time with each person — « Boire 1,5 L d'eau par jour », « Manger plus
lentement », « Ajouter une source de protéines au petit-déjeuner » — and her 14 Sept document (§ 2,
§ 7) asks for it on the page: « Je voudrais pouvoir lancer des challenges personnalisés à chaque
consultant. Le challenge en cours doit être facilement visible. » Today the link shows only her
instruction (titled, confusingly, « Le challenge de la semaine »), the patient has no way to say
« acquis » or « prêt(e) pour le prochain », and she reads both signals from WhatsApp. This advances
the initiative — a patient experience validated on real terrain, in time for the December open day
— through its objective: the patient loop working end to end for one real patient. Decisions D-2
(the token reads and writes), D-9 (in-page, no outbound channel) and D-19 (cut from her 14 Sept
document, before any model) bind it.

## Proposed change

A challenge is a **separate, patient-facing item with a lifecycle**, distinct from the practitioner
instruction (which stays what it is and is relabelled as the consigne).

**Data.** One new table, `patient_challenges`: patient (cascade-deleted with the patient), `text`
(one sentence, required, ≤ 200 characters), `why` (optional, ≤ 2000), `started_on` (date, defaults
to today, never in the future), `closed_on` (null while current), `outcome` (null while current;
`acquired | not_acquired | abandoned` once closed), `acquired_at` and `ready_for_next_at` (the
patient's two taps, nullable timestamps), created/updated timestamps. **At most one open challenge
per patient**, enforced in the database (partial unique index on the patient where `closed_on` is
null). The migration is generated from `schema.ts` and checked in. A services-package service owns
create, edit, close, the two patient taps and the reads (current + past, newest first) — the shape
`check-in-and-progression`'s « Ma progression » will read.

**Console — patient page.** A « Challenges » section beside « Objectifs »:

- The current challenge: its text, why, start date, and its state — « Challenge acquis le <date> »
  and « Prêt(e) pour le prochain depuis le <date> » when the patient tapped them, otherwise « En
  cours ». Edit (text, why, start date) and **Clore** (an outcome picker — Acquis / Non acquis /
  Abandonné — pre-selected to Acquis when the patient tapped « Challenge acquis », else Non acquis).
- **Nouveau challenge**: text, optional why, start date. When a challenge is current, the same form
  shows it with the outcome picker (same pre-selection); submitting closes the current one with that
  outcome and creates the new one in a single transaction.
- The past challenges, newest first: text, start and close dates, outcome, and the dates of the
  patient's taps. Read-only.
- Every practitioner write is audited with the operator actor, as the other patient sections are.

**Console — at a glance and the list.** The at-a-glance view (`working-view`) shows the current
challenge and its state. While the current challenge is marked « prêt(e) pour le prochain », it is
an **awaiting item** there — « Prêt(e) pour le prochain challenge depuis le <date> » — styled like
« repas attendent un retour », until she closes it or creates the next. The patient list row carries
a badge: « Prêt(e) pour le prochain » (attention) when that tap is set, else « Challenge acquis »
(subtle) when acquired, else nothing.

**Link — home.** Under « Aujourd'hui / cette semaine », **first**, a card titled « Le challenge du
moment » (en « Your current challenge »): the text, the why when present, « depuis le <date> », and
two taps, sequential:

- **« Challenge acquis »** (en « Challenge done ») — always offered on the current challenge.
- **« Prêt(e) pour le prochain »** (en « Ready for the next one ») — offered only once « Challenge
  acquis » is set.

Each tap toggles: tapping a set one clears it, and clearing « Challenge acquis » also clears « Prêt(e)
pour le prochain ». Every tap goes through the `link-writes` path — token-resolved, rate-limited,
stamping `link_last_wrote_at`, audited with the `patient` actor — and the new state shows straight
after the tap. A closed challenge accepts no tap (refused as not-found, like any stale target).
With no current challenge the card still renders and says so: « Pas de challenge en cours pour
l'instant — votre praticienne vous en proposera un. » (en « No challenge right now — your
practitioner will suggest one. »). The « Aujourd'hui / cette semaine » section therefore always
renders. The register stays the link's existing « vous ».

**Link — the consigne.** The instruction card's title changes from « Le challenge de la semaine » to
« La consigne de la semaine » (en « This week's focus »); it renders under the challenge and the
goals, content unchanged (`patientBody` only, never `body`).

**Retention.** `.icm/docs/RETENTION.md` describes `patient_challenges`, which columns the patient
writes, its deletion cascade, and what the audit trail keeps after a deletion.

## Acceptance criteria

- [ ] `patient_challenges` exists with the columns above; a second open challenge for the same
      patient is rejected by the database; deleting the patient deletes their challenges; the
      migration is generated from `schema.ts` and checked in.
- [ ] From the patient page Morgane creates a challenge (text, optional why, start date — a future
      date is refused), edits the current one, and closes it with Acquis / Non acquis / Abandonné;
      the picker is pre-selected to Acquis when the patient tapped « Challenge acquis », else Non
      acquis.
- [ ] Creating a challenge while one is current shows the current one with the outcome picker;
      submitting closes it with the chosen outcome and opens the new one, atomically — a failure
      leaves neither half applied.
- [ ] The patient page lists the current challenge with its state and the past ones newest first
      with start date, close date, outcome and tap dates; the at-a-glance view shows the current
      challenge and its state.
- [ ] The link's home shows « Le challenge du moment » first under « Aujourd'hui / cette semaine »,
      with « Challenge acquis » always and « Prêt(e) pour le prochain » only after « Challenge
      acquis » is set, in `fr` and `en`.
- [ ] Each tap is saved through the `link-writes` path: attributed to the token's patient, audited
      with the `patient` actor, `link_last_wrote_at` stamped, the rate ceiling applied; an
      unknown token or a closed challenge is refused as not-found and writes nothing.
- [ ] A tap toggles; clearing « Challenge acquis » also clears « Prêt(e) pour le prochain ».
- [ ] While « Prêt(e) pour le prochain » is set on the current challenge, the at-a-glance view shows
      it as an awaiting item with its date, and the patient list row carries the « Prêt(e) pour le
      prochain » badge; closing the challenge or creating the next clears both. A patient with an
      acquired-but-not-ready challenge carries the subtle « Challenge acquis » badge.
- [ ] With no current challenge the link's card says so in the copy above; a closed challenge keeps
      its outcome and tap dates in the console's past list.
- [ ] The link's instruction card is titled « La consigne de la semaine » / « This week's focus »
      and still renders `patientBody` only.
- [ ] The service rules — one open challenge, sequential taps, clear cascade, close-and-create
      atomicity, no tap on a closed challenge — are covered by `packages/services` tests against the
      in-memory client, and `pnpm test` is green in CI.
- [ ] `.icm/docs/RETENTION.md` describes `patient_challenges`, its patient-written columns, its
      deletion cascade and what the audit trail keeps.

## Out of scope

- A challenge library or templates (a `reuse-and-duplicate` follow-up if she asks).
- Several active challenges at once — one at a time, settled here.
- Editing a past challenge's text or outcome once closed.
- A scheduled challenge (a start date in the future) — the start date is informational.
- « Ma progression » on the link — `check-in-and-progression` renders past challenges; this run
  only stores them in a shape it can read.
- Any model call; any notification to her or to the patient (D-9).
- A free-text comment on a challenge — `general-feedback` is the one place for words.

## Open questions

- none — the four points under the stub's Open for Define were settled with the operator on
  2026-09-23: her labels verbatim (« Challenge acquis », « Prêt(e) pour le prochain »); « prêt(e)
  pour le prochain » raises an awaiting item and a row badge; one active challenge, a new one closes
  the current with an outcome she picks; taps are sequential and undoable until close (D-25 to
  D-28 in `decisions.md`).
