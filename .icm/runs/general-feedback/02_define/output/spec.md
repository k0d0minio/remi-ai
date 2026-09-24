# Spec: General feedback — one place for « Comment se passe votre accompagnement cette semaine ? »

- slug: general-feedback
- personas: patient, practitioner
- touches: packages/services/src/db, apps/web/app/[locale]/p/[token], apps/web/components/patient-link, apps/web/lib/patient-link, apps/web/lib/content, apps/admin/app/(admin)/patients, apps/admin/components/patients, apps/admin/components/audit, .icm/docs/RETENTION.md
- complexity: standard

## Problem

Morgane's 14 Sept document, § 6: « Je voudrais un endroit très simple où le consultant peut laisser
un commentaire général. Il ne faut pas nécessairement créer des commentaires partout dans
l'application. » § 7 adds « voir les feedbacks laissés par les consultants ». Today the patient can
write a meal and tap a challenge, and nothing else: what they think of the recipes, the challenges
and the recommendations reaches her on WhatsApp, outside the record. This advances the initiative
— a patient experience validated on real terrain, in time for the December open day — through its
objective: the patient loop working end to end for one real patient. Decisions D-2 (the token reads
and writes), D-9 (in-page, no outbound channel) and D-19 (cut from her 14 Sept document, before
any model) bind it.

## Proposed change

**One thread per patient.** A new `patient_messages` table: patient, author (`patient` |
`practitioner`), body (plain text, trimmed, 1–2000 characters, the meal journal's limit), `sent_at`,
`read_at` (set on patient-authored messages only; null means unread by Morgane), and the replying
operator on practitioner-authored messages (null on patient ones) — the link does not know the
practitioner's name today, so the reply carries it. Messages are
append-only — no edit, no delete by either side; they are deleted with the patient (RETENTION
updated in the same PR). One migration.

**On the link** (`/p/[token]`):

- A new segment, **Messages** (`/p/[token]/messages`), always visible like Home and Repas — it is
  where the first message is written, so it is never hidden for being empty.
- The prompt, her § 6 sentence verbatim, above one text box and a send button:
  « Comment se passe votre accompagnement cette semaine ? Vous pouvez également indiquer ici ce que
  vous avez pensé des recettes, des challenges ou des recommandations proposées. » The English
  locale carries a faithful translation.
- Under the box, the thread newest first: each message with its date; the patient's own messages
  marked as theirs, Morgane's replies under the replying operator's name.
- Above the box, when the patient has sent at least one message: « Dernier message envoyé le
  <date> » — the weekly framing, with no scheduler.
- A **home card** with the same prompt, the text box and send, the last-sent line, and a link to
  the Messages segment. It sits **beside** the future check-in question (decision below): this run
  adds only its own card.
- Sending goes through the existing link-writes path (`lib/patient-link/write.ts` → the
  `patient-link-writes` service): token-only credential, rate limit, `written_by: patient`, an
  audit event. An empty or over-long body is refused with a message in the patient's language.

**On the console** (`apps/admin`):

- **Patient page**: a Messages card, the thread newest first, author and date on each message,
  unread patient messages visibly marked, and a reply box. The card header carries the count —
  « 1 message attend une réponse » / « N messages attendent une réponse » — worded like the meals.
- **What clears unread**: sending a reply sets `read_at` on every unread patient message sent
  before it; a « Marquer comme lu » action on an unread message clears that one without a reply.
  Opening the page clears nothing.
- **Patient list**: a row with unread messages carries a badge with the count, beside the existing
  challenge badge.
- **At-a-glance page** (the patient page's working view, where meals show « N repas attendent un
  retour ») carries the same unread-messages count.
- Every reply and every « Marquer comme lu » is an audit event, with its wording in the audit
  vocabulary.

**Decided in Define (2026-09-24, with the operator):**

- The prompt is her § 6 example verbatim, both sentences, as the prompt above the box.
- The feedback box sits **beside** the one-tap check-in on the home; it does not replace it.
  `check-in-and-progression` keeps its own home card — this answers the same open point in that
  stub.
- Unread clears on a reply or on « Marquer comme lu »; nothing clears on its own.
- Run ahead of `patient-documents-and-links` (5 of 9): both add a migration; whichever merges
  second renumbers its own.

## Acceptance criteria

- [ ] `/p/[token]/messages` exists and is in the link's navigation for every patient, including one with no messages; an unknown or revoked token 404s on it like every other segment
- [ ] The Messages segment shows her § 6 prompt verbatim (French locale), one text box and a send button, and the patient's thread newest first with each message's date
- [ ] The home shows a feedback card with the same prompt, box and send, and a link to the Messages segment
- [ ] Sending a message stores it in `patient_messages` with author `patient`, through the link-writes path: it is rate-limited, attributed `written_by: patient`, and recorded as an audit event
- [ ] An empty or over-2000-character message is refused with a message in the patient's language and nothing is stored
- [ ] Once a message has been sent, both the segment and the home card show « Dernier message envoyé le <date> »; with none sent, the line is absent
- [ ] The console patient page shows the thread newest first, marks unread patient messages, and shows « N message(s) attend(ent) une réponse » when any are unread
- [ ] Morgane can reply from the patient page; the reply is stored with author `practitioner` and her operator id, audited, and appears on the patient's link under her operator name
- [ ] Sending a reply marks every earlier unread patient message read; « Marquer comme lu » marks one message read without a reply and is audited; opening the page changes nothing
- [ ] The patient list shows an unread-messages badge with the count on the rows that have any, and the at-a-glance page shows the same count
- [ ] Messages are deleted with the patient, and `.icm/docs/RETENTION.md` lists `patient_messages`
- [ ] No scheduler, no cron, no email, no push is added

## Out of scope

- Comments on individual recipes, challenges or recommendations — her § 6: one general place.
- The one-tap check-in, the 0–5 weekly score and « Ma progression » (`check-in-and-progression`).
- Editing or deleting a message, by either side; attachments or photos in a message.
- Any notification outside the page — email, push, WhatsApp (D-9; `beyond-december`).
- Any model call (`ai-assist`).
- More than one thread per patient, or threads per topic.

## Open questions

- none
