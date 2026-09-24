# Stub: General feedback — one place for « comment se passe votre accompagnement cette semaine ? »

- feature-slug: general-feedback
- scope: patient-loop
- personas: patient, practitioner
- initiative: a patient experience validated on real terrain, in time for the December open day / objective: the patient loop working end to end for one real patient
- depends-on: link-writes
- sequence: 6 of 9
- priority: P1
- size: S
- complexity: low
- sources: « Ce que les consultants doivent voir » § 6 and § 7 (Morgane, 2026-09-14 —
  `.icm/docs/collaboration/what-the-consultants-see.docx`) · 11 Sept call [28:21] (« avoir peut-être
  un commentaire ou un feedback de leur part ») · decisions D-2, D-9, D-19 ·
  `check-in-and-progression.md` (the one-tap check-in; this is the free text she asked for first)

## Problem

Her § 6: « Je voudrais un endroit très simple où le consultant peut laisser un commentaire général. Il ne faut pas nécessairement créer des commentaires partout dans l'application. » Today the patient can write a meal and nothing else; what they think of the recipes, the challenges and the recommendations reaches her on WhatsApp.

## Proposed change

- **On the link**, its own segment and a card on the home: one prompt in her words — her example:
  « Comment se passe votre accompagnement cette semaine ? Vous pouvez également indiquer ici ce que
  vous avez pensé des recettes, des challenges ou des recommandations proposées. » — and one text
  box. Send; the patient sees their past messages, newest first. Saved through `link-writes`,
  `written_by: patient`, audited.
- **On the console** (her § 7 « voir les feedbacks laissés par les consultants »): the messages on the
  patient page, newest first, with an unread mark; the patient list and the at-a-glance page carry an
  awaiting-attention count like meals do. She can reply in the same thread — the reply shows on the
  link under her name.
- **Weekly framing without a scheduler**: the prompt is the same every visit; the page says when the
  last message was sent. No email, no push (D-9).

## Acceptance criteria (rough)

- [ ] The link has a general feedback segment and a home card: her prompt, one text box, the patient's past messages newest first; saved through the link-writes path, attributed, audited
- [ ] The console shows the messages on the patient page with an unread mark, an awaiting-attention count on the patient list and the at-a-glance page, and lets Morgane reply in the thread
- [ ] The patient sees her reply on the link, under her name
- [ ] No scheduler, no email, no push; the page states when the last message was sent

## Out of scope (this feature)

- Comments on individual recipes or recommendations (her words: not everywhere); the one-tap
  check-in and « Ma progression » (`check-in-and-progression`); any model call

## Notes for Define

- **Decisions that bind** ([`README.md § Decisions of record`](../README.md)): D-2 (the same
  token, read + write) · D-9 (in-page, no outbound channel) · D-19 (cut from her 14 Sept document,
  before any model).

- One new table (`patient_messages`: patient, author (patient / practitioner), body, sent_at,
  read_at) — a migration; `touches:` the schema and journal, so it is sequenced after
  `patient-documents-and-links`.
- The meal journal's « awaiting feedback » pattern (count, unread mark, reply) is the model; reuse
  its components rather than a second design.

**Open for Define** — settled with the operator before the spec is approved, never assumed:

- The prompt sentence, verbatim, in the patient's register.
- ~~Whether this box replaces the one-tap check-in question on the home or sits beside it.~~
  Settled 2026-09-24 in `check-in-and-progression`'s Define: **beside it**, as two separate cards
  (the check-in became her weekly 0–5 score per goal).

## Prompt

Run `/pipeline new general-feedback` in the remi-ai repo. Define reads this stub, its epic's `breakdown.md` and the decisions of record in `.icm/intake/README.md`, and asks the points under **Open for Define** rather than answering them. Scope is the Proposed change and nothing under Out of scope.
