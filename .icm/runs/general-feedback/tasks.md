# Tasks: general-feedback

The queue, with a definition of done per item. Ticked by the stage that finishes the item —
a human checkbox, never a script's. The definition of done is seeded from the spec's
acceptance criteria when the run is opened; the queue is Build's own, one line per commit-sized
step, so a resuming session can pick up the first unticked line.

## Definition of done

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

## Queue

- [x] Schema + migration — `patient_messages`, `0021_patient_messages.sql` (70139a5)
- [x] Service + tests — `db/services/patient-messages/`, model, exports, audit actions (96ed8fd)
- [x] Link — `messages` segment, home card, composer/thread/form, fr/en copy, `sendMessageAction` (d306325)
- [x] Console — thread with reply and « Marquer comme lu », working-view glance, roster badge, RETENTION (5a75e53)
- [ ] CI green on the draft tier, `main` merged in, ready flip, full gate green
