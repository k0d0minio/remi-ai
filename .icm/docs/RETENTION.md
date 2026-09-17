# Retention — what REMI keeps, what deleting removes, and for how long

The written answer to the question a patient can ask today: _what do you hold about me, and what
happens if I ask you to delete it?_ It is written so Morgane can read it out loud, and it describes
**what the code actually does** — not a policy we intend to have. Where the two would differ, this
file is wrong and gets fixed.

Scope: the beta as it stands — Morgane accompanying 10–15 patients, the admin console as her tool,
the share link as their view. No consent-management vendor, no automated deletion, no legal review
sits behind any of this.

## What is held about a patient

One row in `patient_profiles`, plus what hangs off it:

| What                                                         | Where                     | Reaches the patient's link                         |
| ------------------------------------------------------------ | ------------------------- | -------------------------------------------------- |
| Pseudonym, real name, email, language, status                | `patient_profiles`        | the real name; the rest, no                        |
| Birth date, sex, height, weight                              | `patient_profiles`        | age, height and weight — the birth date itself, no |
| Objective, constraints, preferences, medication, supplements | `patient_profiles`        | yes                                                |
| Referral, anamnesis                                          | `patient_profiles`        | no — practitioner's working record                 |
| Consent date and channel                                     | `patient_profiles`        | no                                                 |
| The share token, when the link was last opened, last written | `patient_profiles`        | the token is the link                              |
| The protocol, entry by entry                                 | `patient_recommendations` | yes, unless archived                               |
| Consultation notes                                           | `patient_notes`           | no                                                 |
| What the patient writes through the link                     | the table it belongs to   | yes — they wrote it                                |
| One timestamp per accepted write through the link            | `patient_link_writes`     | no                                                 |

The link records **when** it was last opened and **when** it was last written into, and nothing
else — no page views, no device, no address. Those are two timestamps, not a tracking table: the
first answers "did they look?", the second "is something waiting for me?", and they are separate
columns because Morgane acts on them differently. The open is rate-limited to one write per five
minutes; the second moves on every accepted write.

## What the patient writes, and how it is marked

Since `link-writes`, the same token that shows the page also accepts writes — decision #2 of
10 September 2026, with patient accounts parked until after December. Three things follow, and all
three are what the code does:

- **Every row a patient creates is marked as theirs.** The tables the console and the link both
  write — the meal journal and the goal check-ins — carry a `written_by` column that reads
  `practitioner` or `patient`. Rows that predate the write path read `practitioner`, which is what
  they were: Morgane transcribing from WhatsApp. Nothing is inferred from the absence of a value.
- **Every write is in the audit trail as the patient's.** `audit_events` records an actor kind
  alongside the actor, so a patient's write cannot be read as an operator's or as the system's. A
  patient actor carries the pseudonym and **no email** — there is no account, and inventing an
  address to fill the column would be a lie the trail could never correct.
- **A write is ceilinged, not free.** Per link: ten writes a minute and a hundred a day, both
  rolling windows counted from `patient_link_writes`; free text is capped at 2 000 characters for a
  body and 200 for a short field; no file or image can be uploaded on that route at all. The ledger
  holds a patient id and a time and nothing else — what was written is the row the write created,
  and who wrote it is the audit trail. Rows older than a day are deleted on the next write, so the
  ledger never grows past about a day per patient.

**Anyone holding the link can write as the patient.** That is the beta's accepted trade and it is
said plainly on the page itself, in the patient's own language, so they can decide who to forward
it to. The recovery move is unchanged and instant: regenerating the link in the console kills the
old token, and the replacement starts with neither an open nor a write recorded against it.

## What deleting a patient removes

Deleting a patient from the console removes, permanently and in one operation:

- the profile row — every field in the table above, the real name and the email included;
- every recommendation encoded for them, archived ones too;
- every consultation note about them;
- everything the patient themselves wrote through the link — their meal entries and their
  check-ins go with the rest, marked `patient` or not;
- the write ledger behind the rate limit, which is timestamps and nothing else;
- the share link — the token goes with the row, so the URL stops resolving. Anyone still holding it
  gets a not-found page.

This is a database cascade (`onDelete: "cascade"` on every child table, the write ledger
included), not a status flag: there
is no soft-deleted copy, no recycle bin, and nothing to undo it with. The console asks for
confirmation first for that reason.

## What deleting does not remove, and why

**The audit trail.** `audit_events` keeps one row per action taken — by an operator, and since
`link-writes` by a patient through their link — including the deletion itself, with the pseudonym
as it read at the time. It is deliberately **not** a foreign key to the patient, precisely so a
cascade cannot erase the evidence of the deletion. A trail that disappears with what it records is
not a trail.

What a row holds is who did what and when: the actor's kind, their name, an operator's email where
there is one, the action, and the target's type and how it read at the time. It does not hold the
patient's health data — no constraints, no medication, no notes, and nothing of what a patient
wrote beyond the fact that they wrote it. So after a deletion, what survives is a set of lines
saying a patient by that pseudonym existed, wrote on these dates, and was deleted on that date by
that operator; the record itself is gone.

If a patient asks for that line to go too, it is a manual database operation and a deliberate one —
not something the console offers, and not something it should offer by accident.

## How long an ended patient is kept

**Indefinitely, until Morgane deletes them.** Setting a patient to `ended` changes how they sort
and filter in the roster; it removes nothing and starts no clock. There is no expiry job, no
deletion prompt, and no scheduled purge anywhere in the codebase.

That is a description of today's behaviour, not a decided policy. Whether ended patients should be
deleted after some period — and whether the console should prompt for it — is an open question for
Morgane, recorded in the `data-care` spec and not answered here. When she answers it, this section
says what she chose, and any automation lands with it.

## Consent

Consent is recorded on the profile as two facts: the date the patient agreed, and the channel they
agreed through (in consultation, WhatsApp, or email). Morgane records and edits them on the patient
page; a profile with neither shows "pas encore enregistré" rather than an empty line.

It is a **recorded fact, not a gate**. Nothing in REMI refuses to save, render or share a profile
because consent is missing — the value of writing it down is that it can be answered, not that it
blocks anything. No consent wording or version is stored; if that is wanted later, it is one more
nullable column, not a reshape.

## Where this is enforced

Nowhere automatically, and that is the honest answer. Deletion is Morgane's action in the console;
retention is her judgement. What the code guarantees is only what is written above: that deleting
really deletes, that the cascade reaches everything hanging off the profile, and that the audit
trail survives it on purpose.
