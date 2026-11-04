# Retention — what REMI keeps, what deleting removes, and for how long

The written answer to the question a patient can ask today: _what do you hold about me, and what
happens if I ask you to delete it?_ It is written so Morgane can read it out loud, and it describes
**what the code actually does** — not a policy we intend to have. Where the two would differ, this
file is wrong and gets fixed.

Scope: the beta as it stands — Morgane accompanying 10–15 patients, the admin console as her tool,
the share link as their view. No consent-management vendor and no legal review sit behind any of
this. One deletion is automatic: an account inactive for twelve months, after a notice
(§ Inactive accounts).

## What is held about a patient

One row in `patient_profiles`, plus what hangs off it:

| What                                                               | Where                     | Reaches the patient's link                         |
| ------------------------------------------------------------------ | ------------------------- | -------------------------------------------------- |
| Pseudonym, real name, email, language, status                      | `patient_profiles`        | the real name; the rest, no                        |
| Birth date, sex, height, weight                                    | `patient_profiles`        | age, height and weight — the birth date itself, no |
| Objective, constraints, preferences, medication, supplements       | `patient_profiles`        | yes                                                |
| Diet, allergies, intolerances, likes cooking, time to cook, budget | `patient_profiles`        | yes — the patient edits them on « Mon profil »     |
| When the patient last changed each of those fields                 | `patient_profiles`        | no                                                 |
| Referral, anamnesis                                                | `patient_profiles`        | no — practitioner's working record                 |
| Consent date and channel, recorded by hand before the consent rows | `patient_profiles`        | no                                                 |
| Each consent decision, with the version and the hash of its text   | `patient_consents`        | no                                                 |
| Questionnaire: sex for the calculation, activity, desired weight   | `patient_profiles`        | no — no page shows them yet                        |
| Questionnaire: consultation reason and date, diet, pathologies     | `patient_profiles`        | no — no page shows them yet                        |
| Questionnaire: celiac disease, the free question's answer          | `patient_profiles`        | no — no page shows them yet                        |
| The genetic test answer, the APOE, DIO2 and AMY1A results          | `patient_profiles`        | no — stored, never interpreted (D-35)              |
| Allergies and intolerances as checked boxes                        | `patient_allergens`       | no — no page shows them yet                        |
| Whether the patient declared « no known » allergy or intolerance   | `patient_profiles`        | no — no page shows them yet                        |
| The share token, when the link was last opened, last written       | `patient_profiles`        | the token is the link                              |
| The protocol, entry by entry                                       | `patient_recommendations` | yes, unless archived                               |
| Consultation notes                                                 | `patient_notes`           | no                                                 |
| Challenges — hers, and the patient's two answers to each           | `patient_challenges`      | the running one; closed ones, no                   |
| Documents she put on their page — PDFs, images, links              | `patient_documents`       | the title and the day added; who added it, no      |
| The files behind those documents                                   | the file store (below)    | through a five-minute signed link only             |
| The general thread — the patient's messages and her replies        | `patient_messages`        | yes — the whole thread                             |
| What the patient writes through the link                           | the table it belongs to   | yes — they wrote it                                |
| One timestamp per accepted write through the link                  | `patient_link_writes`     | no                                                 |

The link records **when** it was last opened and **when** it was last written into, and nothing
else — no page views, no device, no address. Those are two timestamps, not a tracking table: the
first answers "did they look?", the second "is something waiting for me?", and they are separate
columns because Morgane acts on them differently. The open is rate-limited to one write per five
minutes; the second moves on every accepted write.

## Where a patient's files are, and who can read them

Morgane can put documents on a patient's page — the recipe PDFs she used to send over WhatsApp,
the personalised list of fifteen foods, an image, or a link. A link is a row with a title and an
address. A file is a row **and** an object in the file store: a **private** Vercel Blob store in
an **EU region** (decision D-18), where each patient's files sit under a prefix of their own.
Only PDF, JPEG, PNG and WebP are accepted, at 10 MB each.

Nothing in the store has a public address. The patient's link opens a file by asking the web app,
which checks that the token owns the document and then hands the browser a signed address that
stops working after five minutes; the console does the same behind the operator's session. The
patient never uploads anything — the link has no file or image route at all.

Removing a document in the console removes its file from the store first and the row after; if
the store refuses, both stay and the console says so, so there is never a file left that nothing
points at. The audit trail keeps one line per document added, edited or removed, with the
document's title as the target label — the way a goal's title is kept — and nothing of its
content.

## What the patient writes, and how it is marked

Since `link-writes`, the same token that shows the page also accepts writes — decision #2 of
10 September 2026, with patient accounts parked until after December. Three things follow, and all
three are what the code does:

- **Every row a patient creates is marked as theirs.** The tables the console and the link both
  write — the meal journal and the goal check-ins — carry a `written_by` column that reads
  `practitioner` or `patient`. Rows that predate the write path read `practitioner`, which is what
  they were: Morgane transcribing from WhatsApp. Nothing is inferred from the absence of a value.
  `patient_challenges` is the one exception, and it needs no such column: Morgane writes the
  challenge, and the patient writes only its two answers — `acquired_at` (« Challenge acquis ») and
  `ready_for_next_at` (« Prêt(e) pour le prochain »), two timestamps and nothing else. Those columns
  are the patient's by construction, and each set or clear of one is in the audit trail as theirs.
  The goal check-ins gained two columns with `check-in-and-progression`: `score`, the patient's
  weekly 0–5 on a goal, written only on a `patient` row, and `seen_at`, the moment Morgane marked a
  lower score « vu ». Both go with the goal they belong to.
  A closed challenge keeps both, frozen, with the outcome she gave it.
  `patient_messages` needs no `written_by` either, for the opposite reason: its `author` column
  _is_ that marker — `patient` for what the patient sent through the link, `practitioner` for her
  replies, which also carry the replying operator's id (set to null if that account is removed, so
  the reply stays readable). The thread is append-only on both sides, and `read_at` — set on a
  patient message when she replies after it or marks it read — records only that she dealt with
  it. The whole thread is deleted with the patient (`on delete cascade`); what remains is the
  audit trail's lines (`message.sent`, `message.replied`, `message.marked_read`), which carry no
  message text.
  The profile is the one row the patient **edits** rather than creates. Since
  `patient-profile-edit`, « Mon profil » lets them change seven fields of their own record and no
  others: diet, allergies, intolerances, foods liked and disliked (`preferences`), whether they
  like cooking, the time they have to cook (`cooking_time`, three levels) and their budget
  (`food_budget`, three levels — free text before, the leftover words moved into `preferences`).
  They can clear an allergy as freely as add one; the safeguard is that Morgane sees it. Per field,
  `patient_edited_at` keeps only the moment the patient last changed it, so the console can say
  « modifié par la patiente le … »; her own change to a field removes its entry. It is deleted with
  the profile. Identity, measures, medication, supplements, referral, consent and anamnesis are
  never written through the link, and the birth date never reaches it — the page shows the age.
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
- their questionnaire's allergy and intolerance boxes;
- every challenge she gave them, running or closed, with the patient's answers on each;
- the whole general thread — every message the patient sent and every reply to it;
- everything the patient themselves wrote through the link — their meal entries and their
  check-ins go with the rest, marked `patient` or not;
- every document she put on their page, and every file behind them in the file store — the files
  are removed from the store **before** the profile, and if the store refuses (or no store is
  configured while the patient has files), nothing is deleted and the console says why;
- the write ledger behind the rate limit, which is timestamps and nothing else;
- the share link — the token goes with the row, so the URL stops resolving. Anyone still holding it
  gets a not-found page.

This is a database cascade (`onDelete: "cascade"` on every child table, the write ledger
included) — plus the file store's sweep of the patient's prefix just before it, since no database
cascade reaches outside the database — not a status flag: there
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
wrote beyond the fact that they wrote it. A challenge's row in the trail does carry its one
sentence as the target's label (« Boire 1,5 L d'eau par jour ») and, on a close, the outcome key —
the same way a goal's carries its title — so that line survives a deletion too. So after a deletion, what survives is a set of lines
saying a patient by that pseudonym existed, wrote on these dates, and was deleted on that date by
that operator; the record itself is gone.

If a patient asks for that line to go too, it is a manual database operation and a deliberate one —
not something the console offers, and not something it should offer by accident.

**A context export is one of those rows.** « Copier le contexte » puts a patient's context on the
operator's clipboard to be pasted into an AI model of her choosing, and writes a
`context.exported` row naming the patient, the moment and which blocks went. Read it for what it
is: generating recipes from a hand-typed profile is Morgane's practice **today**, outside REMI and
with the patient's real name typed in by hand. The export carries the pseudonym and never the
name, the email or the share link, so what it changes about the exposure is that it reduces it —
and that there is now a line in the trail saying it happened. REMI itself calls no model here.

## How long an ended patient is kept

**Until Morgane deletes them, or until the inactivity rule below deletes the account.** Setting a
patient to `ended` changes how they sort and filter in the roster. It removes nothing and starts no
clock. The file status plays no part in the inactivity rule either.

A file the console made, with a share link and no patient account, has no sign-in. The inactivity
rule does not reach it: it stays until Morgane deletes it.

## Inactive accounts

The pilot privacy policy (section 7) promises that REMI deletes an inactive account after twelve
months, after a notice. `GET /api/cron/inactive-accounts` on the app does it. Vercel Cron calls it
once a day at 02:00 UTC: 03:00 in Brussels in winter, 04:00 in summer. The caller must send the
shared secret `CRON_SECRET`. The rule lives in `packages/services/src/db/services/retention/`.

**The clock.** It covers every patient account. It starts at the latest of:

1. the account's creation;
2. the patient's last sign-in, or the last day a live session opened the app
   (`patient_accounts.last_seen_at`, written at most once a day);
3. the patient's last write: the newest `audit_events` row with actor kind `patient`.

Months are calendar months.

**Eleven months after it**, REMI e-mails the patient once, in the language of the file:
« Votre compte REMI sera supprimé le <date> », with a sign-in link. The practitioner who holds the
file receives a copy in French, which names the pseudonym only. `patient_accounts.inactivity_notice_sent_at`
records the notice, and the audit trail gets a `patient.inactivity_notice_sent` row with the date.

**A return cancels it.** A sign-in, a session or a write after the notice voids it. The column goes
back to null and the clock starts again. The next notice comes eleven months later.

**Twelve months after it**, and never sooner than thirty days after the notice, the route deletes
the file through `deletePatient`: the same cascade as the console, files first (§ What deleting a
patient removes). The audit trail gets a `patient.deleted` row with actor kind `system` and the
detail `inactivity`. When the file store refuses, nothing is deleted and the next run tries again.

**The retention hold.** An admin of the console can set a hold on a file, in the « Zone sensible »
of the file page (`patient_profiles.retention_hold_at`). While it stands, the route sends no notice
and deletes nothing. It writes one log line per skipped file per run. Setting and clearing the hold
each write an audit row with the admin's name. Morgane said on 2026-10-23 that no legal retention
rule applies during the pilot, so the hold is the only exception.

**What makes it safe to run twice.** A sent notice stamps its column, so a second run on the same
day sends nothing. A deleted file is gone, so nothing is deleted twice. With no mailer registered,
the route sends nothing and deletes nothing: no file goes without its notice.

Vercel Cron runs on the production deployment only. Preview and UAT have no daily run. A call by
hand with the secret runs the same sweep.

## Consent

Each consent decision is one row of `patient_consents`: the key (`care` or `genetic`), the
decision (`given`, `refused` or `withdrawn`), the moment, the channel and who took it. The row
names the text the patient read three ways: its version, the language shown, and the SHA-256 of
the text file. The texts live in `packages/services/src/consent/texts/`, one file per key, version
and language. A published file never changes: a new wording is a new version, and a test pins the
hash of every file. Recording a decision also writes an audit event (D-32).

The table is append-only. A change of mind is a new row, and the latest row per key is the
patient's answer. The rows are deleted with the patient, like everything else on the profile.

Before this table, Morgane recorded consent by hand as two facts on the profile: the date and the
channel (in consultation, WhatsApp, or email). Migration `0028` copied each profile with a date into
one `care` row of version `legacy`, with the channel kept. The two columns stay on the profile and
the console shows them, but nothing writes them any more. A later migration drops them.

The sign-up screen (`/inscription/<token>`) is the first gate. It shows the mandatory `care` text
before any field, and refuses to create an account without the tick. The patient file, the account
and the `care` row commit in one transaction, so no account exists without its consent row. The
audit events are written after the commit. The two takeover paths of
`patient-file-creation/patient-takes-over-file` are not gated yet.

## Where this is enforced

Deletion is Morgane's action in the console, with one automatic exception: the inactivity rule
above. Any other retention is her judgement. What the code guarantees is only what is written
above: that deleting really deletes, that the cascade reaches everything hanging off the profile,
that an inactive account goes only after its notice, and that the audit trail survives it on
purpose.
