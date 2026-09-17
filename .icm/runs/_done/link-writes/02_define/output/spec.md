# Spec: Link writes — the token accepts writes, attributed, rate-limited, audited

- slug: link-writes
- apps: web, admin, packages
- touches: apps/web/lib/patient-link, apps/web/lib/content, apps/web/app/[locale]/p/[token], packages/services/src/db/schema.ts, packages/services/src/db/migrations, packages/services/src/db/services/patients, packages/services/src/db/services/audit, packages/services/src/shared/audit.ts, apps/admin/app, .icm/docs/RETENTION.md, apps/docs/app/business/roles
- complexity: complex

## Problem

`/p/[token]` is six read-only segments. The token resolves to a patient and the page renders what
Morgane encoded; the patient has no way to answer. That makes the current initiative's one question
— does REMI help a patient apply what their practitioner told them between two consultations —
unanswerable, because a static rendering of the protocol produces no evidence either way
(`business/initiatives`, "A patient experience validated on real terrain").

Decision #2 of 2026-09-10 makes the same token read **and** write, with patient accounts parked in
`beyond-december`. Five stubs in this epic then write through that path — meals, recipe feedback,
profile edits, check-ins — and every one of them needs the same four things: the token resolved the
same way the loader resolves it, a row attributable to the patient rather than to Morgane, an audit
entry whose actor is not an operator, and a ceiling on what an unauthenticated URL can do. Built
five times it is built five ways; built once it is the trunk the epic branches off.

Today none of it exists. `recordAuditEvent` takes an operator-shaped actor and writes an empty
email and name for anything else, so a patient write would be indistinguishable from a system write.
No table records who wrote a row. The only limit on the route is
`recordPatientLinkOpened`'s one-write-per-five-minutes on a single timestamp column, which is a read
guard, not a write guard.

## Proposed change

A write path for the patient link — the helper and its proof, with no feature write using it yet.

**The write helper.** A server-action helper in `apps/web` that every future patient write goes
through. Given a token and a write, it resolves the token to a patient by exactly the loader's rules
(unknown, malformed or regenerated → not found, never a partial result), refuses the write if the
token is over its rate limit or the payload is over its length caps, performs the write through
`@remi/services/server`, records the audit event, stamps the profile's new write timestamp, and
revalidates the segment so the page re-renders with the row. A refusal comes back as a `Result` the
caller can render — never a thrown error and never a silent no-op. The token is read from the URL
and nothing else: no cookie is set, no session is created or read, and the helper accepts no patient
id from its caller.

The rules that need proving — token resolution for writes, rate-limit accounting, length caps,
audit attribution — live in `@remi/services`, where the in-memory client tests them. `apps/web` holds
the thin action wrapper (the token from the route, `revalidatePath`), which has no test runner.

**Audit with a patient actor.** `audit_events` gains an explicit actor kind — `operator` or
`patient` — so a patient's write is unmistakable in the console's journal rather than inferred from
an empty email. A patient actor carries the pseudonym as its name and no email, because the patient
has no account and inventing one in the trail would be a lie the trail cannot correct. The vocabulary
in `shared/audit.ts` gains the patient-side action names this epic will use; unknown actions stay
silently dropped, as today.

**Attribution on shared rows.** The tables a patient will write that the console also writes —
`patient_meal_entries` and `patient_goal_check_ins` today — gain `written_by: practitioner |
patient`, defaulting to `practitioner` so every existing row keeps its true author. Nothing renders
it yet beyond the audit journal; the segments that do are stubs 2–6, and the tables they introduce
(recipe feedback, recommendation check-ins) carry the column from birth.

**Limits.** Per-token, two tiers, both DB-backed so they survive serverless instance churn: **10
writes per rolling minute** and **100 per rolling day**. Free text is capped at **2000 characters**
for a body (a meal description, a check-in note) and **200** for a short field. Over either ceiling
the helper refuses with a distinguishable reason so the UI can say which. No file or binary input is
accepted on this route at all.

**The write timestamp.** `patient_profiles` gains `link_last_wrote_at`, stamped by the helper on
every accepted write. It is separate from `link_last_opened_at` because "they looked" and "they
answered" are different facts and Morgane acts on them differently. A patient write does **not** move
`last_edited_at`: that column means Morgane worked on this patient and sorts her roster. The admin
patient page shows the new timestamp beside « dernière ouverture »; nothing else in the console
changes.

**What becomes true in writing.** The link's privacy card says today that the page only shows what
the practitioner recorded and that anyone holding the link can read it. Both halves stop being true
the moment a write lands, so the copy is rewritten in both locales: what the patient writes is saved
and attributed to their link, their practitioner sees it, and anyone holding the link can write as
them — stated plainly, because decision #2 accepts a URL as the credential for the beta and a patient
who knows that can choose who to forward it to. `RETENTION.md` gains the patient-written rows, their
place in the deletion cascade, and what the audit trail keeps of a patient's writes after the profile
is gone. `business/roles` gains what a patient can now change, on which surface, and with what
credential.

## Acceptance criteria

- [ ] A write through the helper with a valid token creates the row, records an audit event whose
      actor kind is `patient` and whose name is the pseudonym, stamps `link_last_wrote_at`, and
      leaves `last_edited_at` untouched.
- [ ] A write with an unknown, malformed or regenerated token is refused as not-found, writes no
      row, records no audit event, and reveals nothing about whether the token ever existed.
- [ ] The 11th write inside a rolling minute, and the 101st inside a rolling day, are refused with a
      rate-limit reason; the counters are held in the database, so two concurrent server instances
      share one ceiling.
- [ ] A body over 2000 characters, or a short field over 200, is refused with a length reason before
      any write reaches the seam.
- [ ] The helper accepts no patient id, sets and reads no cookie, and creates no session; a caller
      can only name the token the route gave it.
- [ ] `patient_meal_entries` and `patient_goal_check_ins` carry `written_by`, every pre-existing row
      reads `practitioner`, and the migration is generated from `schema.ts` and checked in.
- [ ] The rules above are covered by `packages/services` tests against the in-memory client and
      `pnpm test` is green in CI.
- [ ] The admin patient page shows « dernière écriture » beside « dernière ouverture », empty when
      the patient has never written.
- [ ] The privacy card, in `fr` and `en`, states that what the patient writes is saved, attributed
      to their link and seen by their practitioner, and that anyone holding the link can write as
      them.
- [ ] `.icm/docs/RETENTION.md` describes the patient-written rows, the new columns, their deletion
      cascade, and what the audit trail keeps after a deletion.
- [ ] `apps/docs/app/business/roles` states what a patient can change and through which credential.

## Out of scope

- **Any feature write.** No meal entry, recipe feedback, check-in or profile edit ships here — those
  are stubs 2–6 of this epic. This run delivers the helper and its proof; the only exercise of the
  path is its tests.
- **Any patient-facing write UI.** No form, no button, no optimistic state on `/p/[token]`.
- **Patient accounts, passwords, sessions or cookies** — `beyond-december/patient-accounts`, by
  decision #2. Whether a URL is a good enough credential for health-data writes is answered there,
  not here; this run only makes the current answer legible to the patient.
- **`written_by` on tables that do not exist yet** — recipe feedback and recommendation check-ins
  carry it when their stubs create them.
- **A console redesign around patient writes.** One timestamp on the patient page, nothing more; the
  journal already renders entries and a patient-written marker in its cards is `meal-entry`'s.
- **Photos or any file input** (decision #12), and any model call (`ai-assist`).
- **Automated retention or deletion** — `RETENTION.md` describes what the code does, and the code
  still deletes only when Morgane asks it to.

## Open questions

- none — the stub's two open questions were put to the owner and answered at Define: the rate limit
  is 10/minute + 100/day with 2000/200-character caps, and the console gets a `link_last_wrote_at`
  distinct from « dernière ouverture ».
