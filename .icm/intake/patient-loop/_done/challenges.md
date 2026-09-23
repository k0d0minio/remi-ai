# Stub: Challenges — one habit at a time, « Challenge acquis » and « Prêt(e) pour le prochain »

- feature-slug: challenges
- scope: patient-loop
- personas: patient, practitioner
- initiative: a patient experience validated on real terrain, in time for the December open day / objective: the patient loop working end to end for one real patient
- depends-on: link-writes
- sequence: 4 of 9
- priority: P1
- size: M
- complexity: medium
- sources: « Ce que les consultants doivent voir » § 2 and § 7 (Morgane, 2026-09-14 —
  `.icm/docs/collaboration/what-the-consultants-see.docx`) · 11 Sept call [27:34] (« les challenges
  que j'ai déjà donnés ») and [20:11]–[20:43] (a goal moves at the patient's pace: « il m'a fallu 10
  jours avant qu'elle commence ») · feedback § 4 / § 6 (« challenge / consigne de la semaine ») ·
  decisions D-2, D-9, D-19 · `_done/patient-home-today.md` (shipped the active instruction as this
  week's consigne and left open whether the challenge is a separate, patient-facing thing — it is)

## Problem

Morgane runs one habit at a time with each person — « Boire 1,5 L d'eau par jour », « Manger plus lentement », « Ajouter une source de protéines au petit-déjeuner » — and today the link shows only her instruction, with no way for the patient to say « acquis » or « prêt(e) pour le prochain », and no way for her to see it without WhatsApp.

## Proposed change

Her § 2, in her words: « Je voudrais pouvoir lancer des challenges personnalisés à chaque consultant.
Le challenge en cours doit être facilement visible. » A challenge is a **separate, patient-facing
item with a lifecycle**, not the practitioner instruction (`patient-home-today` renders that as the
consigne and keeps it).

- **On the console**, on the patient page: create a challenge (one sentence, optional why, start
  date), edit it, close it; the current one and the list of past ones with their outcome. The
  at-a-glance page shows the current challenge and its state.
- **On the link**, on the home under « Aujourd'hui / cette semaine »: the current challenge, first
  thing, with two taps — **« Challenge acquis »** and **« Prêt(e) pour le prochain »** — one tap,
  changeable, `written_by: patient`, audited through `link-writes`. When none is active the slot says
  so in her register.
- **Her side** (§ 7): the patient list and the at-a-glance page show when a challenge was marked
  acquired and when the patient says they are ready for the next one — the two signals she reads
  today from WhatsApp.
- **Ma progression** (`check-in-and-progression`) lists past challenges and their outcome; this stub
  only stores them in a shape that view can read.

## Acceptance criteria (rough)

- [ ] Morgane creates, edits and closes a challenge from the patient page; the current one and the past ones with outcome are listed there and the current one appears on the at-a-glance page
- [ ] The link's home shows the current challenge first with two taps — « Challenge acquis » and « Prêt(e) pour le prochain » — saved through the link-writes path, attributed to the patient, audited
- [ ] The console shows, per patient, when a challenge was acquired and when the patient asked for the next one; the patient list carries the signal
- [ ] With no active challenge the slot says so; a closed challenge keeps its outcome

## Out of scope (this feature)

- A challenge library or templates (a `reuse-and-duplicate` follow-up if she asks); several active
  challenges at once unless Define settles otherwise; any model call; a notification to her (D-9)

## Notes for Define

- **Decisions that bind** ([`README.md § Decisions of record`](../README.md)): D-2 (the same
  token, read + write) · D-9 (in-page, no outbound channel) · D-19 (cut from her 14 Sept document,
  before any model).

- One new table (`patient_challenges`: patient, text, why, started_on, closed_on, outcome, the
  patient's answer and its timestamp) — a migration; `touches:` the schema and the journal, so this
  stub is sequenced, not parallel, with the two that follow.
- The instruction field stays what it is; a challenge is written to the patient, the instruction to
  REMI (brainstorm `PRACTITIONER_INSTRUCTION`).
- The patient's register (« tu » / « vous ») is the link's existing one.

**Open for Define** — settled with the operator before the spec is approved, never assumed:

- Her two labels verbatim, and whether « prêt(e) pour le prochain » raises an awaiting-attention
  count on the console (like meals) or only shows on the patient's row.
- One active challenge at a time (her examples read that way), or several.

## Prompt

Run `/pipeline new challenges` in the remi-ai repo. Define reads this stub, its epic's `breakdown.md` and the decisions of record in `.icm/intake/README.md`, and asks the points under **Open for Define** rather than answering them. Scope is the Proposed change and nothing under Out of scope.
